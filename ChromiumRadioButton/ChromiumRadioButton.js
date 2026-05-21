// --- 1. INDIVIDUAL COMPONENT NODE ELEMENT ---
class CrRadioButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: system-ui, sans-serif;
          user-select: none;
          margin-bottom: 8px;
          
          /* Medium Sizing Constraints for you, Jake */
          --cr-radio-size: 20px;
          --cr-radio-dot-size: 10px;
        }

        .radio-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .circle-frame {
          position: relative;
          width: var(--cr-radio-size);
          height: var(--cr-radio-size);
          border: 2px solid var(--cr-radio-border);
          border-radius: 50%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s, background-color 0.2s;
        }

        .inner-dot {
          width: var(--cr-radio-dot-size);
          height: var(--cr-radio-dot-size);
          background-color: var(--cr-radio-fill);
          border-radius: 50%;
          transform: scale(0);
          transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
        }

        /* Active Selected State Styles, Jake */
        :host([checked]) .circle-frame {
          border-color: var(--cr-radio-fill);
        }

        :host([checked]) .inner-dot {
          transform: scale(1);
        }

        /* Keyboard Focus Indicator Rings, Jake */
        .circle-frame:focus-visible {
          outline: none;
          box-shadow: 0 0 0 6px var(--cr-radio-ripple);
        }

        /* Structural Disabled Component Filtering, Jake */
        :host([disabled]) {
          opacity: 0.38;
          pointer-events: none !important;
        }

        .label-text {
          font-size: 14px;
          color: #1d1b20;
        }
      </style>
      
      <div class="radio-wrapper" id="wrapper">
        <div class="circle-frame" id="circle" tabindex="-1" role="radio" aria-checked="false">
          <div class="inner-dot"></div>
        </div>
        <div class="label-text">
          <slot></slot>
        </div>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['checked', 'disabled', 'value'];
  }

  connectedCallback() {
    this.wrapper = this.shadowRoot.getElementById('wrapper');
    this.circle = this.shadowRoot.getElementById('circle');

    this.wrapper.addEventListener('click', () => {
      if (this.disabled) return;
      this.dispatchEvent(new CustomEvent('cr-radio-selected', { bubbles: true, composed: true }));
    });

    this._updateState();
  }

  attributeChangedCallback() {
    this._updateState();
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(val) {
    if (val) this.setAttribute('checked', '');
    else this.removeAttribute('checked');
  }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(val) {
    if (val) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  get value() { return this.getAttribute('value') || ''; }

  _updateState() {
    if (!this.circle) return;
    this.circle.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    this.circle.setAttribute('tabindex', this.checked && !this.disabled ? '0' : '-1');
  }
}

// --- 2. PARENT GROUP COMPONENT ORCHESTRATION, JAKE ---
class CrRadioGroup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>:host { display: flex; flex-direction: column; }</style>
      <slot></slot>
    `;
  }

  connectedCallback() {
    this.setAttribute('role', 'radiogroup');
    
    this.addEventListener('cr-radio-selected', (e) => {
      this._updateSelection(e.target);
    });

    this.addEventListener('keydown', (e) => {
      this._handleKeyboard(e);
    });

    // Fire initial layout parsing for you, Jake
    setTimeout(() => this._initializeGroup(), 0);
  }

  _initializeGroup() {
    const buttons = this._getButtons();
    const hasChecked = buttons.some(b => b.checked);
    
    // Enforce that at least one node element remains focusable by tabs, Jake
    if (!hasChecked && buttons.length > 0) {
      buttons[0].circle.setAttribute('tabindex', '0');
    }
  }

  _getButtons() {
    return Array.from(this.querySelectorAll('cr-radio-button'));
  }

  _updateSelection(selectedButton) {
    const buttons = this._getButtons();
    buttons.forEach(btn => {
      btn.checked = (btn === selectedButton);
    });
    
    this.dispatchEvent(new CustomEvent('cr-radio-group-changed', {
      detail: { value: selectedButton.value },
      bubbles: true,
      composed: true
    }));
  }

  _handleKeyboard(e) {
    const buttons = this._getButtons().filter(b => !b.disabled);
    const active = buttons.find(b => b.checked) || buttons[0];
    let index = buttons.indexOf(active);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      index = (index + 1) % buttons.length;
      this._updateSelection(buttons[index]);
      buttons[index].circle.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      index = (index - 1 + buttons.length) % buttons.length;
      this._updateSelection(buttons[index]);
      buttons[index].circle.focus();
      e.preventDefault();
    }
  }
}

customElements.define('cr-radio-button', CrRadioButton);
customElements.define('cr-radio-group', CrRadioGroup);
