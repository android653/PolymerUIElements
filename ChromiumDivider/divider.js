class CrDivider extends HTMLElement {
  constructor() {
    super();
    // Attach an open shadow root tree
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          /* Chromium default design system structural properties */
          --cr-divider-color: var(--google-grey-300, #e8eaed);
          --cr-divider-height: 1px;
          --cr-divider-margin: 0;
          
          height: var(--cr-divider-height);
          background-color: var(--cr-divider-color);
          margin: var(--cr-divider-margin);
          width: 100%;
        }

        /* Dark mode design variable override rules */
        @media (prefers-color-scheme: dark) {
          :host {
            --cr-divider-color: var(--google-grey-700, #3c4043);
          }
        }
      </style>
    `;
  }

  // Lifecycle callback hook matching standard customElement rules
  connectedCallback() {
    // Inject semantic accessibility roles into the host element safely
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'separator');
    }
  }
}

// Define the custom element tag globally
customElements.define('cr-divider', CrDivider);
