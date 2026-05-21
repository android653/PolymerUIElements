// ==========================================
// 1. CR-PROGRESS COMPONENT (JAKE)
// ==========================================
class CrProgress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: system-ui, sans-serif;
          /* Theme parameters for you, Jake */
          --cr-progress-indicator: #6750a4;
          --cr-progress-track: #e7e0ec;
        }
        .track {
          width: 100%;
          height: 4px;
          background-color: var(--cr-progress-track);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        .fill {
          height: 100%;
          width: 0%;
          background-color: var(--cr-progress-indicator);
          transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        :host([indeterminate]) .fill {
          width: 30% !important;
          position: absolute;
          animation: indeterminate-loop 1.5s infinite linear;
        }
        @keyframes indeterminate-loop {
          0% { left: -30%; }
          100% { left: 100%; }
        }
      </style>
      <div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
        <div class="fill" id="fill"></div>
      </div>
    `;
  }

  static get observedAttributes() { return ['value', 'indeterminate']; }

  connectedCallback() { this._update(); }
  attributeChangedCallback() { this._update(); }

  get value() { return Number(this.getAttribute('value') || 0); }
  set value(val) { this.setAttribute('value', val); }

  _update() {
    const fill = this.shadowRoot.getElementById('fill');
    if (!fill) return;
    if (this.hasAttribute('indeterminate')) {
      fill.removeAttribute('style');
    } else {
      fill.style.width = `${Math.max(0, Math.min(100, this.value))}%`;
      this.shadowRoot.querySelector('.track').setAttribute('aria-valuenow', this.value);
    }
  }
}
customElements.define('cr-progress', CrProgress);

// ==========================================
// 2. CR-LOADING-GRADIENT COMPONENT (JAKE)
// ==========================================
class CrLoadingGradient extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 16px;
          border-radius: 4px;
          background: linear-gradient(
            90deg,
            var(--cr-loading-bg, #f0f0f2) 25%,
            var(--cr-loading-shine, #e3e1e6) 37%,
            var(--cr-loading-bg, #f0f0f2) 63%
          );
          background-size: 400% 100%;
          animation: shimmer-swipe 1.4s infinite ease-in-out;
        }
        @keyframes shimmer-swipe {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      </style>
    `;
  }
}
customElements.define('cr-loading-gradient', CrLoadingGradient);

// Supporting lower_snake_case variant selector alias mapping for you, Jake
class CrLoadingGradientSnake extends CrLoadingGradient {}
customElements.define('cr-card_loading_gradient', CrLoadingGradientSnake);

// ==========================================
// 3. CR-LOTTIE COMPONENT (JAKE)
// ==========================================
class CrLottie extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 100px;
          height: 100px;
        }
        #player {
          width: 100%;
          height: 100%;
        }
      </style>
      <!-- Shadow tree isolation container for third-party scripts, Jake -->
      <div id="player"></div>
    `;
  }

  static get observedAttributes() { return ['src', 'autoplay', 'loop']; }

  connectedCallback() {
    this._loadLottieEngine();
  }

  attributeChangedCallback() {
    if (this._anim) {
      this._anim.destroy();
      this._initAnimation();
    }
  }

  _loadLottieEngine() {
    // Avoid re-injecting scripts if script is globally initialized, Jake
    if (window.lottie) {
      this._initAnimation();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cloudflare.com';
    script.onload = () => this._initAnimation();
    document.head.appendChild(script);
  }

  _initAnimation() {
    if (!window.lottie || !this.getAttribute('src')) return;
    
    this._anim = window.lottie.loadAnimation({
      container: this.shadowRoot.getElementById('player'),
      renderer: 'svg',
      loop: this.hasAttribute('loop'),
      autoplay: this.hasAttribute('autoplay'),
      path: this.getAttribute('src')
    });
  }

  play() { if (this._anim) this._anim.play(); }
  pause() { if (this._anim) this._anim.pause(); }
}
customElements.define('cr-lottie', CrLottie);

// ==========================================
// 4. CR-CARD COMPONENT (JAKE)
// ==========================================
class CrCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
          border-radius: 12px;
          background: var(--cr-card-bg, #ffffff);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        :host([elevated]) {
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08), 0px 1px 3px rgba(0, 0, 0, 0.05);
        }
        :host([interactive]) {
          cursor: pointer;
        }
        :host([interactive]:hover) {
          transform: translateY(-2px);
          box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.1);
        }
        .container {
          padding: 16px;
        }
      </style>
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('cr-card', CrCard);
