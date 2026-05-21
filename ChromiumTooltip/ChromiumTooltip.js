class CrTooltip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10000;
          pointer-events: none; /* Never interferes with mouse selectors */
          font-family: system-ui, sans-serif;
          
          /* Smooth MD3 Scale Transition Rules */
          opacity: 0;
          transform: scale(0.85);
          transition: transform 0.15s cubic-bezier(0, 0, 0.2, 1), opacity 0.15s linear;
        }

        :host(.visible) {
          opacity: 1;
          transform: scale(1);
        }

        .tooltip-box {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          line-height: 16px;
          white-space: nowrap;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
        }

        /* --- Semantic Color Variant Tokens --- */
        :host([variant="text"]) .tooltip-box {
          background-color: #313033;
          color: #f4eff4;
        }

        :host([variant="tonal"]) .tooltip-box {
          background-color: #e8def8;
          color: #1d192b;
        }

        :host([variant="error"]) .tooltip-box {
          background-color: #b3261e;
          color: #ffffff;
        }
      </style>
      <div class="tooltip-box">
        <slot></slot>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['variant'];
  }

  // Absolute positioning tracking map rules
  show(targetElement) {
    const targetRect = targetElement.getBoundingClientRect();
    this.classList.add('visible');
    
    // Position tooltip directly below the target component centermass
    const top = targetRect.bottom + 6;
    const left = targetRect.left + (targetRect.width / 2);
    
    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
    this.style.transformOrigin = 'top center';
    
    // Dynamic boundary check to prevent left/right screen overflow
    requestAnimationFrame(() => {
      const tooltipRect = this.getBoundingClientRect();
      let adjustedLeft = left - (tooltipRect.width / 2);
      
      if (adjustedLeft < 8) adjustedLeft = 8;
      if (adjustedLeft + tooltipRect.width > window.innerWidth - 8) {
        adjustedLeft = window.innerWidth - tooltipRect.width - 8;
      }
      
      this.style.left = `${adjustedLeft}px`;
    });
  }

  hide() {
    this.classList.remove('visible');
  }
}

customElements.define('cr-tooltip', CrTooltip);

// --- Global Tooltip Orchestration Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  // Create a singleton instance shared globally across the view lifecycle
  const globalTooltip = document.createElement('cr-tooltip');
  document.body.appendChild(globalTooltip);

  const handleMouseEnter = (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;

    const text = target.getAttribute('data-tooltip');
    const variant = target.getAttribute('data-tooltip-variant') || 'text';

    globalTooltip.textContent = text;
    globalTooltip.setAttribute('variant', variant);
    globalTooltip.show(target);
  };

  const handleMouseLeave = () => {
    globalTooltip.hide();
  };

  // Bind top-level global bubbling window capture events
  document.addEventListener('mouseenter', handleMouseEnter, true);
  document.addEventListener('mouseleave', handleMouseLeave, true);
  document.addEventListener('focusin', handleMouseEnter, true);
  document.addEventListener('focusout', handleMouseLeave, true);
});
