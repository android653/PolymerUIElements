class CrRangeSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 400px;
          font-family: system-ui, sans-serif;
          --cr-slider-primary: #6750a4;
          --cr-slider-inactive: #e8eaed;
          --cr-slider-knob-size: 18px;
        }

        .slider-area {
          position: relative;
          height: 32px;
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
          touch-action: none;
        }

        .rail {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--cr-slider-inactive);
          border-radius: 2px;
          z-index: 1;
        }

        .fill {
          position: absolute;
          height: 4px;
          background: var(--cr-slider-primary);
          border-radius: 2px;
          z-index: 2;
          left: 0%;
          right: 0%;
        }

        .knob {
          position: absolute;
          width: var(--cr-slider-knob-size);
          height: var(--cr-slider-knob-size);
          border-radius: 50%;
          background: var(--cr-slider-primary);
          z-index: 3;
          transform: translateX(-50%);
          outline: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }

        .knob:focus-visible {
          box-shadow: 0 0 0 8px rgba(103, 80, 164, 0.2), 0 1px 3px rgba(0,0,0,0.3);
          transform: translateX(-50%) scale(1.1);
        }

        @media (prefers-color-scheme: dark) {
          :host {
            --cr-slider-inactive: #3c4043;
          }
        }
      </style>
      
      <div class="slider-area" id="sliderArea">
        <div class="rail"></div>
        <div class="fill" id="fill"></div>
        <div class="knob" id="knobMin" tabindex="0" role="slider" aria-label="Minimum value"></div>
        <div class="knob" id="knobMax" tabindex="0" role="slider" aria-label="Maximum value"></div>
      </div>
    `;
    
    this._activeKnob = null;
  }

  static get observedAttributes() {
    return ['min', 'max', 'value-min', 'value-max'];
  }

  connectedCallback() {
    this.sliderArea = this.shadowRoot.getElementById('sliderArea');
    this.fill = this.shadowRoot.getElementById('fill');
    this.knobMin = this.shadowRoot.getElementById('knobMin');
    this.knobMax = this.shadowRoot.getElementById('knobMax');

    // Default configuration assignments
    if (!this.hasAttribute('min')) this.setAttribute('min', '0');
    if (!this.hasAttribute('max')) this.setAttribute('max', '100');
    if (!this.hasAttribute('value-min')) this.setAttribute('value-min', '25');
    if (!this.hasAttribute('value-max')) this.setAttribute('value-max', '75');

    this._setupPointerEvents();
    this._setupKeyboardEvents();
    this._updateVisualTrack();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.fill) {
      this._updateVisualTrack();
    }
  }

  // Reactive Property Mappings
  get min() { return Number(this.getAttribute('min')); }
  set min(val) { this.setAttribute('min', val); }

  get max() { return Number(this.getAttribute('max')); }
  set max(val) { this.setAttribute('max', val); }

  get valueMin() { return Number(this.getAttribute('value-min')); }
  set valueMin(val) {
    const clamped = Math.max(this.min, Math.min(val, this.valueMax));
    this.setAttribute('value-min', clamped);
    this._dispatchChangeEvent();
  }

  get valueMax() { return Number(this.getAttribute('value-max')); }
  set valueMax(val) {
    const clamped = Math.max(this.valueMin, Math.min(val, this.max));
    this.setAttribute('value-max', clamped);
    this._dispatchChangeEvent();
  }

  _setupPointerEvents() {
    const handlePointerMove = (e) => {
      if (!this._activeKnob) return;
      
      const rect = this.sliderArea.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const calculatedVal = Math.round(this.min + pct * (this.max - this.min));

      if (this._activeKnob === this.knobMin) {
        this.valueMin = calculatedVal;
      } else if (this._activeKnob === this.knobMax) {
        this.valueMax = calculatedVal;
      }
    };

    const handlePointerUp = () => {
      this._activeKnob = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    this.sliderArea.addEventListener('pointerdown', (e) => {
      const rect = this.sliderArea.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const currentClickValue = this.min + pct * (this.max - this.min);

      // Determine closer handle node point
      const distToMin = Math.abs(currentClickValue - this.valueMin);
      const distToMax = Math.abs(currentClickValue - this.valueMax);
      
      this._activeKnob = (distToMin < distToMax) ? this.knobMin : this.knobMax;
      this._activeKnob.focus();
      
      handlePointerMove(e);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    });
  }

  _setupKeyboardEvents() {
    const attachKeys = (knob, keyProp) => {
      knob.addEventListener('keydown', (e) => {
        const step = 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          this[keyProp] += step;
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          this[keyProp] -= step;
          e.preventDefault();
        }
      });
    };

    attachKeys(this.knobMin, 'valueMin');
    attachKeys(this.knobMax, 'valueMax');
  }

  _updateVisualTrack() {
    const totalRange = this.max - this.min;
    const minPct = ((this.valueMin - this.min) / totalRange) * 100;
    const maxPct = ((this.valueMax - this.min) / totalRange) * 100;

    this.knobMin.style.left = `${minPct}%`;
    this.knobMax.style.left = `${maxPct}%`;
    this.fill.style.left = `${minPct}%`;
    this.fill.style.right = `${100 - maxPct}%`;

    this.knobMin.setAttribute('aria-valuemin', this.min);
    this.knobMin.setAttribute('aria-valuemax', this.valueMax);
    this.knobMin.setAttribute('aria-valuenow', this.valueMin);

    this.knobMax.setAttribute('aria-valuemin', this.valueMin);
    this.knobMax.setAttribute('aria-valuemax', this.max);
    this.knobMax.setAttribute('aria-valuenow', this.valueMax);
  }

  _dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('cr-range-slider-changed', {
      detail: { valueMin: this.valueMin, valueMax: this.valueMax },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('cr-range-slider', CrRangeSlider);
