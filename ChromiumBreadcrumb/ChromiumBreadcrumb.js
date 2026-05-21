class CrBreadcrumb extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
        }

        /* Semantic Nav Matrix Layout */
        .breadcrumb-nav {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding: 0;
          margin: 0;
          list-style: none;
          font-size: 14px;
          font-weight: 500;
        }

        /* Enforce spacing around slotted items dynamically */
        ::slotted(a), ::slotted(span) {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
          transition: opacity 0.2s ease;
        }

        ::slotted(a:hover) {
          text-decoration: underline;
          cursor: pointer;
        }

        /* Separator Injection via Pseudo Element CSS Rules */
        .separator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          user-select: none;
          font-weight: 400;
        }

        /* --- Theme Token Matrices --- */
        :host([variant="text"]) {
          --cr-breadcrumb-active: #1d1b20;
          --cr-breadcrumb-inactive: #78757a;
          --cr-breadcrumb-sep-color: #cac4d0;
        }

        :host([variant="tonal"]) {
          --cr-breadcrumb-active: #1d192b;
          --cr-breadcrumb-inactive: #49454f;
          --cr-breadcrumb-sep-color: #49454f;
        }

        :host([variant="error"]) {
          --cr-breadcrumb-active: #b3261e;
          --cr-breadcrumb-inactive: #ba1a1a;
          --cr-breadcrumb-sep-color: #ffb4ab;
        }

        /* Map custom CSS variables to targets */
        .breadcrumb-nav { color: var(--cr-breadcrumb-inactive); }
        .separator { color: var(--cr-breadcrumb-sep-color); }
        .current-item { color: var(--cr-breadcrumb-active); }
      </style>
      
      <nav aria-label="Breadcrumb">
        <ol class="breadcrumb-nav" id="listContainer"></ol>
      </nav>
    `;
  }

  static get observedAttributes() {
    return ['separator', 'variant'];
  }

  connectedCallback() {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'text');
    if (!this.hasAttribute('separator')) this.setAttribute('separator', '/');

    // Watch for slots added or changed down the tree
    this.shadowRoot.addEventListener('slotchange', () => this._renderStructure());
    
    // Append a hidden slot wrapper so the component reads children safely
    const hiddenSlot = document.createElement('slot');
    hiddenSlot.style.display = 'none';
    this.shadowRoot.appendChild(hiddenSlot);

    this._renderStructure();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) {
      this._renderStructure();
    }
  }

  _renderStructure() {
    const listContainer = this.shadowRoot.getElementById('listContainer');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    
    // Select valid node nodes directly passed into the inner markup scope
    const items = Array.from(this.children).filter(el => el.tagName === 'A' || el.tagName === 'SPAN');
    const separatorString = this.getAttribute('separator');

    items.forEach((item, index) => {
      const li = document.createElement('li');
      const itemClone = item.cloneNode(true);
      li.appendChild(itemClone);

      const isLast = index === items.length - 1;

      if (isLast) {
        li.classList.add('current-item');
        itemClone.setAttribute('aria-current', 'page');
      } else {
        // Inject structural separator glyph nodes
        const sep = document.createElement('span');
        sep.classList.add('separator');
        sep.textContent = separatorString;
        li.appendChild(sep);
      }

      listContainer.appendChild(li);
    });
  }
}

customElements.define('cr-breadcrumb', CrBreadcrumb);
