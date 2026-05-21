class CrSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Setup encapsulated template styles and elements
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 100%;
          max-width: 400px;
          font-family: system-ui, sans-serif;
          --cr-slider-primary-color: #6750a4;
          --cr-slider-secondary-color: #e7e0ec;
        }
        .slider-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          height: 32px;
          cursor: pointer;
        }
        .rail {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--cr-slider-secondary-color);
          border-radius: 2px;
          z-index: 1;
        }
        .fill {
          position: absolute;
          left: 0;
          height: 4px;
          background: var(--cr-slider-primary-color);
          border-radius: 2px;
          z-index: 2;
          width: 0%;
        }
        .knob {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--cr-slider-primary-color);
          z-index: 3;
          transform: translateX(-50%);
          left: 0%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          outline: none;
        }
        .knob:focus-visible {
          box-shadow: 0 0 0 8px rgba(103, 80, 164, 0.2), 0 1px 3px rgba(0,0,0,0.3);
          transform: translateX(-50%) scale(1.1);
        }
      </style>
      <div class="slider-wrapper" id="container">
        <div class="rail"></div>
        <div class="fill" id="fill"></div>
        <div class="knob" id="knob" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['min', 'max', 'value'];
  }

  connectedCallback() {
    this.container = this.shadowRoot.getElementById('container');
    this.knob = this.shadowRoot.getElementById('knob');
    this.fill = this.shadowRoot.getElementById('fill');

    // Initialize bounds default values if empty
    if (!this.hasAttribute('min')) this.setAttribute('min', '0');
    if (!this.hasAttribute('max')) this.setAttribute('max', '100');
    if (!this.hasAttribute('value')) this.setAttribute('value', '0');

    this._setupEventListeners();
    this._updateVisualState();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.knob) {
      this._updateVisualState();
    }
  }

  // Getters & Setters matching internal cr property models
  get min() { return Number(this.getAttribute('min')); }
  set min(val) { this.setAttribute('min', val); }

  get max() { return Number(this.getAttribute('max')); }
  set max(val) { this.setAttribute('max', val); }

  get value() { return Number(this.getAttribute('value')); }
  set value(val) {
    const clamped = Math.max(this.min, Math.min(this.max, val));
    this.setAttribute('value', clamped);
    this.dispatchEvent(new CustomEvent('cr-slider-value-changed', {
      detail: { value: clamped },
      bubbles: true,
      composed: true
    }));
  }

  _setupEventListeners() {
    // Mouse Drag Coordinates Trackers
    const onDrag = (e) => {
      const rect = this.container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      this.value = Math.round(this.min + percentage * (this.max - this.min));
    };

    const stopDrag = () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', stopDrag);
    };

    const startDrag = (e) => {
      onDrag(e);
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', onDrag);
      window.addEventListener('touchend', stopDrag);
      this.knob.focus();
    };

    this.container.addEventListener('mousedown', startDrag);
    this.container.addEventListener('touchstart', startDrag, { passive: true });

    // Keyboard Arrow Handling Rules
    this.knob.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        this.value += 1;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        this.value -= 1;
        e.preventDefault();
      }
    });
  }

  _updateVisualState() {
    const ratio = (this.value - this.min) / (this.max - this.min);
    const percentage = (ratio * 100).toFixed(2);

    this.knob.style.left = `${percentage}%`;
    this.fill.style.width = `${percentage}%`;

    // Modern accessibility node declarations
    this.knob.setAttribute('aria-valuemin', this.min);
    this.knob.setAttribute('aria-valuemax', this.max);
    this.knob.setAttribute('aria-valuenow', this.value);
  }
}

customElements.define('cr-slider', CrSlider);
