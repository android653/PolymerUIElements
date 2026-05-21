// --- 1. INDIVIDUAL MENU ACTION NODE ---
class CrMenuItem extends HTMLElement {
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

        .menu-item-core {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          min-height: 36px;
          box-sizing: border-box;
          background-color: transparent;
          color: var(--cr-menu-item-color, #1d1b20);
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.1s ease;
          outline: none;
        }

        /* Interactive Element States for you, Jake */
        .menu-item-core:hover {
          background-color: var(--cr-menu-item-hover-bg, rgba(0, 0, 0, 0.04));
        }

        .menu-item-core:focus-visible {
          background-color: var(--cr-menu-item-focus-bg, rgba(0, 0, 0, 0.08));
          box-shadow: inset 4px 0 0 0 var(--cr-menu-primary-marker, #6750a4);
        }

        :host([disabled]) {
          opacity: 0.38;
          pointer-events: none !important;
        }

        ::slotted([slot="shortcut"]) {
          font-size: 12px;
          opacity: 0.6;
          margin-inline-start: 24px;
        }
      </style>
      
      <div class="menu-item-core" id="itemCore" tabindex="-1" role="menuitem">
        <slot></slot>
        <slot name="shortcut"></slot>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  connectedCallback() {
    this.itemCore = this.shadowRoot.getElementById('itemCore');
    this._updateAccessibility();
    
    this.addEventListener('click', (e) => {
      if (this.disabled) {
        e.stopPropagation();
        return;
      }
    });
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

// --- 2. PARENT DROPDOWN FLOATING SHELL CONTAINER, JAKE ---
class CrMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          z-index: 10005;
          min-width: 160px;
          border-radius: 4px;
          overflow: hidden;
          background: var(--cr-menu-wrapper-bg, #ffffff);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1);
          padding: 4px 0;
          
          /* Smooth MD3 entry translation mechanics, Jake */
          opacity: 0;
          transform: scale(0.9) translateY(-10px);
          pointer-events: none;
          transform-origin: top left;
          transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0, 0, 0.2, 1);
        }

        :host(.visible) {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }

        .menu-container {
          display: flex;
          flex-direction: column;
        }
      </style>
      <div class="menu-container" id="container" role="menu" tabindex="-1">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'text');
    this.addEventListener('keydown', (e) => this._handleKeyboardOrchestration(e));
    
    // Auto-close menu on outside window interaction routines, Jake
    this._outsideClickHandler = (e) => {
      if (!this.contains(e.target) && !e.target.hasAttribute('data-menu-trigger')) {
        this.close();
      }
    };
  }

  _getItems() {
    return Array.from(this.querySelectorAll('cr-menu-item')).filter(item => !item.disabled);
  }

  open(anchorElement) {
    const rect = anchorElement.getBoundingClientRect();
    this.classList.add('visible');
    
    // Anchor perfectly under target elements for clean structural matching, Jake
    this.style.top = `${rect.bottom + 4}px`;
    this.style.left = `${rect.left}px`;
    
    window.addEventListener('click', this._outsideClickHandler, true);
    
    // Automatically flag the first operational child element as focus target, Jake
    setTimeout(() => {
      const items = this._getItems();
      if (items.length > 0) {
        items[0].itemCore.focus();
      }
    }, 50);
  }

  close() {
    this.classList.remove('visible');
    window.removeEventListener('click', this._outsideClickHandler, true);
  }

  _handleKeyboardOrchestration(e) {
    const items = this._getItems();
    const activeElement = this.shadowRoot.activeElement || document.activeElement;
    
    // Resolve core item wrappers safely out of shadow bounds, Jake
    const currentItem = items.find(item => item.itemCore === activeElement || item === activeElement);
    let index = items.indexOf(currentItem);

    if (e.key === 'ArrowDown') {
      index = (index + 1) % items.length;
      items[index].itemCore.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      index = (index - 1 + items.length) % items.length;
      items[index].itemCore.focus();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      this.close();
      e.preventDefault();
    }
  }
}

customElements.define('cr-menu-item', CrMenuItem);
customElements.define('cr-menu', CrMenu);
