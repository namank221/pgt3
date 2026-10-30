/**
 * GT3 Exploded-View // Multi-Page Scroll Progress & Page 1 -> Page 2 -> Page 3 Handoff Controller
 */

class ScrollController {
  constructor() {
    this.progress = 0;
    this.targetProgress = 0;
    this.page1Progress = 0;
    this.isPage2Active = false;
    this.isPage3Active = false;
    this.isPage2Visible = false;
    this.callbacks = [];

    this.fillBar = document.getElementById('scroll-fill');
    this.overtureEl = document.getElementById('page1-overture');
    this.stageEl = document.getElementById('deconstruction-stage');
    this.page3El = document.getElementById('page3-beyond-mechanics');

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const vh = window.innerHeight || 1;
      const stageTop = this.getStageOffsetTop();
      const stageRange = this.getStageScrollRange();
      const page3Top = this.getPage3OffsetTop();

      if (stageTop > 0) {
        this.page1Progress = Math.min(Math.max(scrollY / stageTop, 0), 1);
      } else {
        this.page1Progress = 1;
      }

      const enteredPage2 = scrollY >= Math.max(0, stageTop - vh * 0.42);
      const enteredPage3 = page3Top > 0 && scrollY >= (page3Top - vh * 0.55);

      this.isPage2Visible = (scrollY + vh * 1.35 >= stageTop) && (page3Top === 0 || scrollY <= page3Top + vh * 0.35);

      if (enteredPage2 !== this.isPage2Active || enteredPage3 !== this.isPage3Active) {
        this.isPage2Active = enteredPage2;
        this.isPage3Active = enteredPage3;
        document.body.classList.toggle('is-page1-active', !enteredPage2);
        document.body.classList.toggle('is-page3-active', enteredPage3);
      }

      const stageScrollY = scrollY - stageTop;
      const p = stageRange > 0 ? Math.min(Math.max(stageScrollY / stageRange, 0), 1) : 0;
      this.targetProgress = p;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', onScroll, { passive: true });
    onScroll();
    this.progress = this.targetProgress;
  }

  getStageOffsetTop() {
    return this.stageEl ? this.stageEl.offsetTop : 0;
  }

  getPage3OffsetTop() {
    return this.page3El ? this.page3El.offsetTop : 0;
  }

  getStageScrollRange() {
    if (this.stageEl && this.stageEl.offsetHeight > window.innerHeight) {
      return this.stageEl.offsetHeight - window.innerHeight;
    }
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  setProgress(val) {
    const clamped = Math.min(Math.max(val, 0), 1);
    this.targetProgress = clamped;
    this.progress = clamped;
    this.updateUI();
    this.notify();
  }

  update() {
    this.progress += (this.targetProgress - this.progress) * 0.075;
    if (Math.abs(this.targetProgress - this.progress) < 0.0001) {
      this.progress = this.targetProgress;
    }
    this.updateUI();
  }

  updateUI() {
    if (this.fillBar) {
      this.fillBar.style.width = (this.progress * 100).toFixed(1) + '%';
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