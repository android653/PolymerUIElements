// --- 1. CHROME LIST ITEM WRAPPER NODE ---
class CrListItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
          user-select: none;
        }

        .list-item-core {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          min-height: 48px;
          box-sizing: border-box;
          background-color: var(--cr-list-item-bg, transparent);
          color: var(--cr-list-item-color, #1d1b20);
          cursor: pointer;
          transition: background-color 0.15s ease;
          outline: none;
        }

        /* Interactive Element Behaviors, Jake */
        .list-item-core:hover {
          background-color: var(--cr-list-item-hover-bg, rgba(0, 0, 0, 0.04));
        }

        .list-item-core:focus-visible {
          background-color: var(--cr-list-item-focus-bg, rgba(0, 0, 0, 0.08));
          box-shadow: inset 4px 0 0 0 var(--cr-list-primary-marker, #6750a4);
        }

        :host([disabled]) {
          opacity: 0.38;
          pointer-events: none !important;
        }

        /* Sub-component slotting frames, Jake */
        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        ::slotted([slot="meta"]) {
          font-size: 12px;
          color: #78757a;
          margin-inline-start: 16px;
        }
      </style>
      
      <div class="list-item-core" id="itemCore" tabindex="-1" role="listitem">
        <div class="content-area">
          <slot></slot>
        </div>
        <slot name="meta"></slot>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  connectedCallback() {
    this.itemCore = this.shadowRoot.getElementById('itemCore');
    this._updateAccessibility();
  }

  attributeChangedCallback() {
    this._updateAccessibility();
  }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(val) {
    if (val) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  _updateAccessibility() {
    if (!this.itemCore) return;
    if (this.disabled) {
      this.itemCore.removeAttribute('tabindex');
    } else {
      this.itemCore.setAttribute('tabindex', '-1');
    }
  }
}

// --- 2. PARENT CENTRAL LIST CONTAINER COMPONENT, JAKE ---
class CrList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border-radius: 8px;
          overflow: hidden;
          background: var(--cr-list-wrapper-bg, #ffffff);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .list-container {
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 0;
        }
      </style>
      <div class="list-container" id="container" role="list">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    this.addEventListener('keydown', (e) => this._handleKeyboardOrchestration(e));
    
    // Set up default tab index on the very first operational list child, Jake
    setTimeout(() => this._initializeFocusRing(), 0);
  }

  _getItems() {
    return Array.from(this.querySelectorAll('cr-list-item')).filter(item => !item.disabled);
  }

  _initializeFocusRing() {
    const items = this._getItems();
    if (items.length > 0) {
      items[0].itemCore.setAttribute('tabindex', '0');
    }
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
      // Manage standard roving tabindex mechanics for clean navigating, Jake
      items.forEach(item => item.itemCore.setAttribute('tabindex', '-1'));
      
      const targetItem = items[targetIndex];
      targetItem.itemCore.setAttribute('tabindex', '0');
      targetItem.itemCore.focus();
      e.preventDefault();
    }
  }
}

customElements.define('cr-list-item', CrListItem);
customElements.define('cr-list', CrList);
