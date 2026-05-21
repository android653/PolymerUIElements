class CrToolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: system-ui, sans-serif;
          box-sizing: border-box;
          
          /* Baseline Theme Variables for you, Jake */
          --cr-toolbar-bg: #ffffff;
          --cr-toolbar-color: #1d1b20;
          --cr-toolbar-search-bg: #f0f0f3;
          --cr-toolbar-search-focus-bg: #ffffff;
          --cr-toolbar-search-border: transparent;
          --cr-toolbar-search-focus-border: #6750a4;
        }

        .toolbar-core {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          padding: 0 16px;
          background-color: var(--cr-toolbar-bg);
          color: var(--cr-toolbar-color);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          gap: 24px;
        }

        .left-container, .right-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-area {
          font-size: 18px;
          font-weight: 500;
          white-space: nowrap;
        }

        /* Centered Chromium Search Framework Layout, Jake */
        .search-container {
          flex: 1;
          max-width: 680px;
          position: relative;
        }

        .search-input {
          width: 100%;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--cr-toolbar-search-border);
          background-color: var(--cr-toolbar-search-bg);
          color: inherit;
          padding: 0 16px 0 40px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
          transition: background-color 0.15s, border-color 0.15s;
        }

        .search-input:focus {
          background-color: var(--cr-toolbar-search-focus-bg);
          border-color: var(--cr-toolbar-search-focus-border);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          fill: currentColor;
          opacity: 0.6;
          pointer-events: none;
        }

        /* Structural Slotted Action Alignment, Jake */
        ::slotted(button), ::slotted(.action-btn) {
          background: transparent;
          border: none;
          color: inherit;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s;
        }

        ::slotted(button:hover), ::slotted(.action-btn:hover) {
          background-color: rgba(0, 0, 0, 0.06);
        }
        
        ::slotted(button:focus-visible), ::slotted(.action-btn:focus-visible) {
          outline: 2px solid var(--cr-toolbar-search-focus-border);
        }
      </style>
      
      <div class="toolbar-core" role="toolbar">
        <div class="left-container">
          <slot name="menu-button"></slot>
          <div class="title-area" id="titleText">
            <slot name="title">Settings</slot>
          </div>
        </div>

        <div class="search-container" id="searchWrapper">
          <svg class="search-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input type="text" class="search-input" id="searchInput" placeholder="Search settings..." aria-label="Search">
        </div>

        <div class="right-container">
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }

  static get observedAttributes() { return ['search-placeholder', 'clear-on-escape', 'show-search']; }

  connectedCallback() {
    this.searchInput = this.shadowRoot.getElementById('searchInput');
    this.searchWrapper = this.shadowRoot.getElementById('searchWrapper');

    this.searchInput.addEventListener('input', (e) => this._dispatchSearchEvent(e.target.value));
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.hasAttribute('clear-on-escape')) {
        this.searchInput.value = '';
        this._dispatchSearchEvent('');
        this.searchInput.blur();
      }
    });

    this._updateLayout();
  }

  attributeChangedCallback() { this._updateLayout(); }

  _updateLayout() {
    if (!this.searchInput) return;
    
    if (this.hasAttribute('search-placeholder')) {
      this.searchInput.setAttribute('placeholder', this.getAttribute('search-placeholder'));
    }
    
    if (this.getAttribute('show-search') === 'false') {
      this.searchWrapper.style.display = 'none';
    } else {
      this.searchWrapper.style.display = 'block';
    }
  }

  _dispatchSearchEvent(query) {
    this.dispatchEvent(new CustomEvent('cr-toolbar-search', {
      detail: { query: query },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('cr-toolbar', CrToolbar);
