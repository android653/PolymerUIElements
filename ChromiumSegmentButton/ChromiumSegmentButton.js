// ==========================================
// 1. INDIVIDUAL SEGMENT BUTTON OPTION (JAKE)
// ==========================================
class CrSegment extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          flex: 1;
          display: block;
          font-family: system-ui, sans-serif;
          user-select: none;
        }
        .segment-button {
          width: 100%;
          height: 40px;
          border: none;
          background: transparent;
          color: var(--cr-segment-color-inactive, #49454f);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 12px;
          box-sizing: border-box;
          outline: none;
          position: relative;
          transition: color 0.15s ease-out;
        }
        /* Slotted Icon Sizing Constraints, Jake */
        ::slotted([slot="icon"]) {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
        /* Active structural states, Jake */
        :host([active]) .segment-button {
          color: var(--cr-segment-color-active, #1d192b);
          font-weight: 600;
        }
        /* Focus styles for keyboard accessibility */
        .segment-button:focus-visible {
          background-color: rgba(0, 0, 0, 0.04);
          box-shadow: inset 0 0 0 2px var(--cr-segment-outline, #6750a4);
        }
        :host([disabled]) {
          opacity: 0.38;
          pointer-events: none !important;
        }
      </style>
      <button class="segment-button" id="nativeBtn" role="tab" aria-selected="false" tabindex="-1">
        <slot name="icon"></slot>
        <slot></slot>
      </button>
    `;
  }

  static get observedAttributes() { return ['active', 'disabled']; }

  connectedCallback() {
    this.nativeBtn = this.shadowRoot.getElementById('nativeBtn');
    this.nativeBtn.addEventListener('click', () => {
      if (this.disabled) return;
      this.dispatchEvent(new CustomEvent('cr-segment-clicked', { bubbles: true, composed: true }));
    });
    this._updateState();
  }

  attributeChangedCallback() { this._updateState(); }

  get active() { return this.hasAttribute('active'); }
  set active(val) {
    if (val) this.setAttribute('active', '');
    else this.removeAttribute('active');
  }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(val) {
    if (val) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  _updateState() {
    if (!this.nativeBtn) return;
    this.nativeBtn.setAttribute('aria-selected', this.active ? 'true' : 'false');
    this.nativeBtn.setAttribute('tabindex', this.active && !this.disabled ? '0' : '-1');
  }
}
customElements.define('cr-segment', CrSegment);

// ==========================================
// 2. PARENT SEGMENTED BUTTON GROUP SHELL (JAKE)
// ==========================================
class CrSegmentedButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          min-width: 240px;
          box-sizing: border-box;
          
          /* Custom Token Variables Matrix, Jake */
          --cr-segment-bg: #ffffff;
          --cr-segment-border-color: #78757a;
          --cr-segment-pill-active: #e8def8;
          --cr-segment-color-active: #1d192b;
          --cr-segment-color-inactive: #49454f;
          --cr-segment-outline: #6750a4;
        }
        .segmented-frame {
          display: flex;
          position: relative;
          background-color: var(--cr-segment-bg);
          border: 1px solid var(--cr-segment-border-color);
          border-radius: 100px;
          overflow: hidden;
          width: 100%;
        }
        /* Slideway Active Track Pill Overlay, Jake */
        .active-pill-overlay {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background-color: var(--cr-segment-pill-active);
          transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1), width 0.25s cubic-bezier(0.2, 0, 0, 1);
          pointer-events: none;
          z-index: 0;
          transform: translateX(0);
          width: 0;
        }
        .slotted-content-container {
          display: flex;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        /* Divider line layout rules between segments, Jake */
        ::slotted(cr-segment:not(:last-child)) {
          border-right: 1px solid var(--cr-segment-border-color);
        }
      </style>
      <div class="segmented-frame" role="tablist" aria-label="Segmented Options">
        <div class="active-pill-overlay" id="overlay"></div>
        <div class="slotted-content-container">
          <slot></slot>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.overlay = this.shadowRoot.getElementById('overlay');
    this.addEventListener('cr-segment-clicked', (e) => this._updateSelection(e.target));
    this.addEventListener('keydown', (e) => this._handleKeyboardOrchestration(e));
    
    // Allow initial layout tree configurations to resolve first, Jake
    setTimeout(() => {
      this._initializeFocusTarget();
      this._repositionOverlay(false);
    }, 0);
  }

  _getSegments() {
    return Array.from(this.querySelectorAll('cr-segment')).filter(s => !s.disabled);
  }

  _initializeFocusTarget() {
    const segments = this._getSegments();
    const hasActive = segments.some(s => s.active);
    if (!hasActive && segments.length > 0) {
      segments[0].nativeBtn.setAttribute('tabindex', '0');
    }
  }

  _updateSelection(selectedSegment) {
    const segments = this._getSegments();
    segments.forEach(seg => {
      seg.active = (seg === selectedSegment);
    });
    
    this._repositionOverlay(true);

    this.dispatchEvent(new CustomEvent('cr-segmented-button-changed', {
      detail: { activeId: selectedSegment.id, value: selectedSegment.getAttribute('value') },
      bubbles: true,
      composed: true
    }));
  }

  _repositionOverlay(animate) {
    const segments = Array.from(this.querySelectorAll('cr-segment'));
    const activeIndex = segments.findIndex(s => s.active);
    
    if (activeIndex === -1) {
      this.overlay.style.width = '0';
      return;
    }

    if (!animate) {
      this.overlay.style.transition = 'none';
    }

    const segmentWidthPct = 100 / segments.length;
    this.overlay.style.width = `${segmentWidthPct}%`;
    this.overlay.style.transform = `translateX(${activeIndex * 100}%)`;

    if (!animate) {
      // Force layout recalculation reflow before re-enabling transitions, Jake
      this.overlay.offsetHeight; 
      this.overlay.style.transition = '';
    }
  }

  _handleKeyboardOrchestration(e) {
    const segments = this._getSegments();
    const activeElement = document.activeElement;
    
    let index = segments.indexOf(activeElement);
    if (index === -1) return;

    let targetIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = (index + 1) % segments.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = (index - 1 + segments.length) % segments.length;
    }

    if (targetIndex !== -1) {
      segments.forEach(s => s.nativeBtn.setAttribute('tabindex', '-1'));
      const targetSegment = segments[targetIndex];
      targetSegment.nativeBtn.setAttribute('tabindex', '0');
      targetSegment.nativeBtn.focus();
      e.preventDefault();
    }
  }
}
customElements.define('cr-segmented-button', CrSegmentedButton);
