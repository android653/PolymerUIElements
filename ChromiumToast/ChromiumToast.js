class CrToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 9999;
          font-family: system-ui, sans-serif;
          pointer-events: none; /* Let clicks pass through if collapsed */
        }

        /* Base Toast Layout Structural Frame */
        .toast-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 288px;
          max-width: 568px;
          padding: 14px 16px;
          border-radius: 4px;
          font-size: 14px;
          box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14);
          pointer-events: auto; /* Re-enable for buttons */
          
          /* Entry Translation Transition Animations */
          opacity: 0;
          transform: translateY(20px);
          transition: transform 0.25s cubic-bezier(0, 0, 0.2, 1), opacity 0.25s linear;
        }

        /* Visibility Anchor Toggles */
        .toast-box.show {
          opacity: 1;
          transform: translateY(0);
        }

        .message-content {
          flex: 1;
          line-height: 20px;
        }

        /* Native Clear / Action Close Control Items */
        .close-btn {
          background: none;
          border: none;
          color: inherit;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 12px;
          margin-inline-start: 16px;
          cursor: pointer;
          opacity: 0.85;
          padding: 6px 8px;
          border-radius: 4px;
        }
        .close-btn:hover { opacity: 1; background: rgba(255,255,255,0.08); }

        /* --- Theme Token Matrices --- */
        :host([variant="text"]) .toast-box {
          background-color: #313033;
          color: #f4eff4;
        }

        :host([variant="tonal"]) .toast-box {
          background-color: #e8def8;
          color: #1d192b;
        }
        :host([variant="tonal"]) .close-btn:hover { background: rgba(0,0,0,0.05); }

        :host([variant="error"]) .toast-box {
          background-color: #b3261e;
          color: #ffffff;
        }
      </style>
      
      <div class="toast-box" id="toastBox">
        <div class="message-content">
          <slot></slot>
        </div>
        <button class="close-btn" id="closeBtn">Close</button>
      </div>
    `;
    
    this._timeoutId = null;
  }

  connectedCallback() {
    this.toastBox = this.shadowRoot.getElementById('toastBox');
    this.closeBtn = this.shadowRoot.getElementById('closeBtn');
    
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'text');
    if (!this.hasAttribute('duration')) this.setAttribute('duration', '1110'); // Default to 1:51s threshold

    this.closeBtn.addEventListener('click', () => this.hide());
  }

  // Orchestrated Show Initialization
  show() {
    // Clear any unresolved background teardown tasks
    if (this._timeoutId) clearTimeout(this._timeoutId);
    
    // Append rendering frames smoothly
    requestAnimationFrame(() => {
      this.toastBox.classList.add('show');
    });

    const duration = Number(this.getAttribute('duration'));
    if (duration > 0) {
      this._timeoutId = setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    if (!this.toastBox.classList.contains('show')) return;
    
    this.toastBox.classList.remove('show');
    
    // Bubble transition termination complete events up to the central queue
    this.toastBox.addEventListener('transitionend', () => {
      this.dispatchEvent(new CustomEvent('toast-dismissed', { bubbles: true, composed: true }));
    }, { once: true });
  }
}

customElements.define('cr-toast', CrToast);

// --- Centralized Toast Multi-Instance Queue Controller ---
class ToastQueueManager {
  constructor() {
    this.queue = [];
    this.currentToast = null;
  }

  // Add notification request directly to structural processing matrix arrays
  push(text, variant = 'text', duration = 1110) {
    const toastInstance = document.createElement('cr-toast');
    toastInstance.setAttribute('variant', variant);
    toastInstance.setAttribute('duration', duration.toString());
    toastInstance.textContent = text;

    this.queue.push(toastInstance);
    if (!this.currentToast) {
      this._processNext();
    }
  }

  _processNext() {
    if (this.queue.length === 0) {
      this.currentToast = null;
      return;
    }

    this.currentToast = this.queue.shift();
    document.body.appendChild(this.currentToast);
    
    // Setup teardown hook links
    this.currentToast.addEventListener('toast-dismissed', () => {
      this.currentToast.remove();
      this._processNext();
    });

    this.currentToast.show();
  }
}

// Instantiate Global Accessibility API window references
window.ToastQueue = new ToastQueueManager();
