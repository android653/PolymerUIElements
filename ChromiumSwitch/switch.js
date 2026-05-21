class CrSwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: system-ui, sans-serif;
          user-select: none;
          
          /* Medium Sizing Token Matrix (Chromium Default Spec) */
          --cr-switch-width: 44px;
          --cr-switch-height: 24px;
          --cr-switch-knob-size: 16px;
          --cr-switch-knob-travel: 20px;
          
          /* Default Fallback Semantic Tokens */
          --cr-switch-bg-off: #e3e1e6;
          --cr-switch-bg-on: #6750a4;
          --cr-switch-knob-off: #78757a;
          --cr-switch-knob-on: #ffffff;
        }

        /* Base Component Structuring */
        .switch-container {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .track {
          position: relative;
          width: var(--cr-switch-width);
          height: var(--cr-switch-height);
          background-color: var(--cr-switch-bg-off);
          border-radius: 100px;
          transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
        }

        .knob {
          position: absolute;
          top: calc((var(--cr-switch-height) - var(--cr-switch-knob-size)) / 2);
          left: calc((var(--cr-switch-height) - var(--cr-switch-knob-size)) / 2);
          width: var(--cr-switch-knob-size);
          height: var(--cr-switch-knob-size);
          background-color: var(--cr-switch-knob-off);
          border-radius: 50%;
          transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), background-color 0.2s;
          box-shadow: 0px 1px 2px rgba(0,0,0,0.2);
          outline: none;
        }

        /* Switch Active / Checked Positions */
        :host([checked]) .track {
          background-color: var(--cr-switch-bg-on);
        }

        :host([checked]) .knob {
          transform: translateX(var(--cr-switch-knob-travel));
          background-color: var(--cr-switch-knob-on);
        }

        /* Keyboard Focus Indicators */
        .knob:focus-visible {
          box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0,0,0,0.2);
        }

        /* Global Structural Disabled States filtering */
        :host([disabled]) {
          opacity: 0.38;
          pointer-events: none !important;
        }

        .label-text {
          font-size: 14px;
          color: #1d1b20;
          font-weight: 500;
        }
      </style>
      
      <div class="switch-container" id="wrapper">
        <div class="track">
          <div class="knob" id="knob" tabindex="0" role="switch" aria-checked="false"></div>
        </div>
        <div class="label-text">
          <slot></slot>
        </div>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['checked', 'disabled'];
  }

  connectedCallback() {
    this.wrapper = this.shadowRoot.getElementById('wrapper');
    this.knob = this.shadowRoot.getElementById('knob');

    this._setupEvents();
    this._updateAccessibility();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) {
      this._updateAccessibility();
    }
  }

  // Reactive Property Model Getters / Setters
  get checked() { return this.hasAttribute('checked'); }
  set checked(val) {
    if (val) this.setAttribute('checked', '');
    else this.removeAttribute('checked');
    this._dispatchChangeEvent();
  }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(val) {
    if (val) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  _setupEvents() {
    // Click Toggle Trigger Routing
    this.wrapper.addEventListener('click', (e) => {
      if (this.disabled) return;
      this.checked = !this.checked;
    });

    // Space/Enter Key Handling
    this.knob.addEventListener('keydown', (e) => {
      if (this.disabled) return;
      if (e.key === ' ' || e.key === 'Enter') {
        this.checked = !this.checked;
        e.preventDefault();
      }
    });
  }

  _updateAccessibility() {
    if (!this.knob) return;
    this.knob.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    if (this.disabled) {
      this.knob.removeAttribute('tabindex');
    } else {
      this.knob.setAttribute('tabindex', '0');
    }
  }

  _dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('cr-switch-changed', {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('cr-switch', CrSwitch);
