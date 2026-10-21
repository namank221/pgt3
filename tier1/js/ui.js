/**
 * GT3 Exploded-View // Phase 6 UI Callouts & Cursor Parallax Controller
 */

class UIController {
  constructor() {
    this.cards = Array.from(document.querySelectorAll('.callout-card'));
    this.brandHeader = document.querySelector('.brand-header');
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.reducedMotion) {
      window.addEventListener('mousemove', (e) => {
        const px = ((e.clientX / window.innerWidth) - 0.5) * -12;
        const py = ((e.clientY / window.innerHeight) - 0.5) * -12;
        document.documentElement.style.setProperty('--parallax-x', `${px.toFixed(1)}px`);
        document.documentElement.style.setProperty('--parallax-y', `${py.toFixed(1)}px`);
      }, { passive: true });
    }
  }

  update(scrollProgress) {
    const s = Math.min(Math.max(scrollProgress, 0), 1);
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const start = parseFloat(card.dataset.start || '0');
      const end = parseFloat(card.dataset.end || '1');
      const isCardActive = (s >= start && s <= end) || (s <= start && i === 0);
      if (isCardActive) {
        card.classList.add('is-visible');
      } else {
        card.classList.remove('is-visible');
      }
    }
  }
}

window.UIController = UIController;
