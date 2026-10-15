/**
 * GT3 Exploded-View // Normalized Scroll Controller
 * Deterministic scroll value from 0.000 to 1.000
 */

class ScrollController {
  constructor() {
    this.rawProgress = 0;
    this.smoothProgress = 0;
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lerpFactor = this.reducedMotion ? 0.35 : 0.08;
    this.callbacks = [];
    this.initialized = false;

    this.hudValue = document.getElementById('hud-scroll-val');
    this.fillBar = document.getElementById('scroll-fill');
    this.scrubSlider = document.getElementById('hud-scrub-slider');

    if (this.scrubSlider) {
      this.scrubSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 1000;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: val * docHeight, behavior: 'auto' });
        this.rawProgress = val;
      });
    }

    window.addEventListener('scroll', () => this.onWindowScroll(), { passive: true });
    window.addEventListener('resize', () => this.onWindowScroll(), { passive: true });
    this.onWindowScroll();
  }

  onWindowScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      this.rawProgress = 0;
      return;
    }
    this.rawProgress = Math.min(Math.max(window.scrollY / docHeight, 0), 1);
  }

  update() {
    const prev = this.smoothProgress;
    this.smoothProgress += (this.rawProgress - this.smoothProgress) * this.lerpFactor;

    if (Math.abs(this.rawProgress - this.smoothProgress) < 0.00005) {
      this.smoothProgress = this.rawProgress;
    }

    if (this.initialized && Math.abs(this.smoothProgress - prev) < 0.00001) {
      return;
    }
    this.initialized = true;

    if (this.hudValue) {
      this.hudValue.textContent = this.smoothProgress.toFixed(3);
    }
    if (this.fillBar) {
      this.fillBar.style.width = (this.smoothProgress * 100).toFixed(1) + '%';
    }
    if (this.scrubSlider && document.activeElement !== this.scrubSlider) {
      this.scrubSlider.value = Math.round(this.smoothProgress * 1000);
    }

    for (let i = 0; i < this.callbacks.length; i++) {
      this.callbacks[i](this.smoothProgress, this.rawProgress);
    }
  }

  subscribe(callback) {
    this.callbacks.push(callback);
  }

  getProgress() {
    return this.smoothProgress;
  }
}

window.ScrollController = ScrollController;
