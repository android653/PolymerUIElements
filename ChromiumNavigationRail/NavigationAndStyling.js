// ==========================================
// 1. INDIVIDUAL RAIL TAB ITEM (JAKE)
// ==========================================
class CrNavigationRailItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
          user-select: none;
          width: 100%;
        }
        .item-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 56px;
          padding: 4px 0 8px 0;
          cursor: pointer;
          outline: none;
          position: relative;
        }
        /* Active Target Indicator Pill Frame, Jake */
        .indicator-pill {
          position: relative;
          width: 56px;
          height: 32px;
          border-radius: 16px;
          background-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s ease-out;
          color: var(--cr-rail-color-inactive, #49454f);
        }
        /* Slotted Icon Node Layout Constraints */
        ::slotted([slot="icon"]) {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }
        .label-text {
          font-size: 12px;
          font-weight: 500;
          margin-top: 4px;
          color: var(--cr-rail-color-inactive, #49454f);
          transition: color 0.15s ease-out;
          text-align: center;
          padding: 0 4px;
        }
        /* Active Component State Overrides, Jake */
        :host([active]) .indicator-pill {
          background-color: var(--cr-rail-pill-active, #e8def8);
          color: var(--cr-rail-color-active, #1d192b);
        }
        :host([active]) .label-text {
          color: var(--cr-rail-color-active, #1d192b);
          font-weight: 700;
        }
        /* Focus Ring Mechanics */
        .item-wrapper:focus-visible .indicator-pill {
          box-shadow: 0 0 0 2px var(--cr-rail-outline, #6750a4);
        }
        :host([disabled]) {
          opacity: 0.38;
          pointer-events: none !important;
        }
      </style>
      <div class="item-wrapper" id="itemWrapper" role="tab" aria-selected="false" tabindex="-1">
        <div class="indicator-pill">
          <slot name="icon"></slot>
        </div>
        <div class="label-text">
          <slot></slot>
        </div>
      </div>
    `;
  }

  static get observedAttributes() { return ['active', 'disabled']; }

  connectedCallback() {
    this.itemWrapper = this.shadowRoot.getElementById('itemWrapper');
    this.itemWrapper.addEventListener('click', () => {
      if (this.disabled) return;
      this.dispatchEvent(new CustomEvent('cr-rail-item-selected', { bubbles: true, composed: true }));
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
    if (!this.itemWrapper) return;
    this.itemWrapper.setAttribute('aria-selected', this.active ? 'true' : 'false');
    this.itemWrapper.setAttribute('tabindex', this.active && !this.disabled ? '0' : '-1');
  }
}
customElements.define('cr-navigation-rail-item', CrNavigationRailItem);

// ==========================================
// 2. PARENT CENTRAL RAIL SHELL PANEL (JAKE)
// ==========================================
class CrNavigationRail extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 80px;
          height: 100%;
          box-sizing: border-box;
          
          /* Custom Sizing Design Matrix Properties, Jake */
          --cr-rail-bg: #ffffff;
          --cr-rail-pill-active: #e8def8;
          --cr-rail-color-active: #1d192b;
          --cr-rail-color-inactive: #49454f;
          --cr-rail-outline: #6750a4;
        }
        .rail-shell {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          height: 100%;
          background-color: var(--cr-rail-bg);
          box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
          padding: 16px 0;
          gap: 12px;
          box-sizing: border-box;
        }
        .header-slot-area {
          margin-bottom: 20px;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .items-area {
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      </style>
      <div class="rail-shell" role="tablist" aria-label="Primary Navigation">
        <div class="header-slot-area">
          <slot name="header"></slot>
        </div>
        <div class="items-area">
          <slot></slot>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.addEventListener('cr-rail-item-selected', (e) => this._updateSelection(e.target));
    this.addEventListener('keydown', (e) => this._handleKeyboardOrchestration(e));
    
    // Fallback initialize to make sure tab routing is sound, Jake
    setTimeout(() => this._initializeFocusTarget(), 0);
  }

  _getItems() {
    return Array.from(this.querySelectorAll('cr-navigation-rail-item')).filter(item => !item.disabled);
  }

  _initializeFocusTarget() {
    const items = this._getItems();
    const hasActive = items.some(i => i.active);
    if (!hasActive && items.length > 0) {
      items[0].itemWrapper.setAttribute('tabindex', '0');
    }
  }

  _updateSelection(selectedItem) {
    const items = this._getItems();
    items.forEach(item => {
      item.active = (item === selectedItem);
    });
    
    this.dispatchEvent(new CustomEvent('cr-navigation-rail-changed', {
      detail: { activeId: selectedItem.id, activeElement: selectedItem },
      bubbles: true,
      composed: true
    }));
  }

  _handleKeyboardOrchestration(e) {
    const items = this._getItems();
    const activeElement = document.activeElement;
    
    let index = items.indexOf(activeElement);
    if (index === -1) return;

    let targetIndex = -1;
    if (e.key === 'ArrowDown') {
      targetIndex = (index + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
      targetIndex = (index - 1 + items.length) % items.length;
    }

    if (targetIndex !== -1) {
      items.forEach(item => item.itemWrapper.setAttribute('tabindex', '-1'));
      const targetItem = items[targetIndex];
      targetItem.itemWrapper.setAttribute('tabindex', '0');
      targetItem.itemWrapper.focus();
      e.preventDefault();
    }
  }
}
customElements.define('cr-navigation-rail', CrNavigationRail);
