/**
 * GT3 Exploded-View // Universal Scroll & Slider Controller
 * Direct responsive 1:1 control with synchronized scrub slider.
 */

class ScrollController {
  constructor() {
    this.progress = 0;
    this.callbacks = [];
    this.isScrubbing = false;

    this.hudValue = document.getElementById('hud-scroll-val');
    this.fillBar = document.getElementById('scroll-fill');
    this.scrubSlider = document.getElementById('hud-scrub-slider');

    // 1. Scrub Slider: 100% instant 1:1 control
    if (this.scrubSlider) {
      const onScrub = (e) => {
        const val = parseFloat(e.target.value) / 1000;
        this.setProgress(val, true);

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          window.scrollTo({ top: val * docHeight, behavior: 'auto' });
        }
      };

      this.scrubSlider.addEventListener('input', onScrub);
      this.scrubSlider.addEventListener('change', onScrub);
      this.scrubSlider.addEventListener('mousedown', () => { this.isScrubbing = true; });
      this.scrubSlider.addEventListener('touchstart', () => { this.isScrubbing = true; }, { passive: true });
      window.addEventListener('mouseup', () => { this.isScrubbing = false; });
      window.addEventListener('touchend', () => { this.isScrubbing = false; });
    }

    // 2. Direct Responsive Window Scroll Listener (Zero lag)
    const onScroll = () => {
      if (!this.isScrubbing) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const p = docHeight > 0 ? Math.min(Math.max(window.scrollY / docHeight, 0), 1) : 0;
        this.setProgress(p, false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', onScroll, { passive: true });
    onScroll();
  }

  setProgress(val, fromScrub) {
    const clamped = Math.min(Math.max(val, 0), 1);
    this.progress = clamped;
    this.updateUI(fromScrub);
    this.notify();
  }

  update() {
    // Kept for per-frame animation loop compatibility
    this.updateUI(false);
  }

  updateUI(fromScrub) {
    if (this.hudValue) {
      this.hudValue.textContent = this.progress.toFixed(3);
    }
    if (this.fillBar) {
      this.fillBar.style.width = (this.progress * 100).toFixed(1) + '%';
    }
    if (this.scrubSlider && !this.isScrubbing && !fromScrub) {
      this.scrubSlider.value = Math.round(this.progress * 1000);
    }
  }

  notify() {
    for (let i = 0; i < this.callbacks.length; i++) {
      this.callbacks[i](this.progress);
    }
  }

  subscribe(callback) {
    this.callbacks.push(callback);
  }

  getProgress() {
    return this.progress;
  }
}

window.ScrollController = ScrollController;
