/**
 * GT3 Exploded-View // User-Perspective Hero Car Presentation + Optical Flare & 9,000 RPM Dial Engine (v=939)
 */

class UIController {
  constructor() {
    this.cards = Array.from(document.querySelectorAll('.callout-card'));
    this.sections = Array.from(document.querySelectorAll('.story-section'));

    // Page 1 User-Perspective Hero Video Stage
    this.heroVideoStage = document.getElementById('sanctuary-video-stage');
    this.heroVideo = document.getElementById('sanctuary-hero-video');
    this.heroCarStartTime = null;
    this.isHeroCarPlayingForUser = false;

    if (this.heroVideo) {
      this.heroVideo.muted = true;
      this.heroVideo.pause();
      try {
        this.heroVideo.currentTime = 0;
      } catch (e) {}
    }

    // Monumental Optical Flare Stages
    this.heroTitleStage = document.getElementById('hero-title-stage');
    this.heroTitleCard = document.getElementById('hero-title-card');
    this.nStage = document.getElementById('n-presents-stage');
    this.nCard = document.getElementById('n-presents-card');
    this.beyondStage = document.getElementById('beyond-mechanics-stage');
    this.beyondCard = document.getElementById('beyond-mechanics-card');

    this.heroRevealStartTime = null;
    this.nRevealStartTime = null;
    this.beyondRevealStartTime = null;

    // Asymmetric Editorial 4-Part Scroll-Animated & Interactive Sculptures
    this.partCards = Array.from(document.querySelectorAll('.bento-part-card'));
    this.initInteractivePartSculptures();

    // Row 1: Masters of the Air (Car In Motion) & Row 2: Original v=912 9,000 RPM Optical Resonance Dial
    this.motionRow = document.getElementById('concept-row-motion');
    this.ignitionRow = document.getElementById('concept-row-ignition');
    this.motionCard = document.getElementById('page3-rev-btn');
    this.ignitionCard = document.getElementById('page3-idle-btn');
    this.motionWords = Array.from(document.querySelectorAll('.sky-word[data-group="motion"]'));
    this.ignitionWords = Array.from(document.querySelectorAll('.sky-word[data-group="ignition"]'));
    this.motionWhisper = document.getElementById('motion-whisper-label');
    this.ignitionWhisper = document.getElementById('ignition-whisper-label');
    this.speedoRpmNumber = document.getElementById('speedo-rpm-number');

    this.motionStartTime = null;
    this.ignitionStartTime = null;

    // Only observe Page 3 secondary loops when they enter the user's actual viewport (exclude #sanctuary-hero-video which is controlled strictly by updateHeroCarPresentation)
    const secondaryVideos = Array.from(document.querySelectorAll('video')).filter(
      (v) => v.id !== 'sanctuary-hero-video'
    );
    secondaryVideos.forEach((v) => {
      v.muted = true;
      v.pause();
    });

    if ('IntersectionObserver' in window) {
      const vObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const vid = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        });
      }, { threshold: [0.0, 0.35, 0.75], rootMargin: '0px' });

      secondaryVideos.forEach((v) => vObserver.observe(v));
    }
  }

  /**
   * User-Perspective Page 1 Car Presentation:
   * Waits until the loading overlay is gone AND the user has scrolled #sanctuary-video-stage
   * into their eye-level viewport before starting gt3_hero.mp4 from 0.00s.
   */
  updateHeroCarPresentation(vh, nowSeconds) {
    if (!this.heroVideoStage || !this.heroVideo || typeof nowSeconds !== 'number') return;



    const rect = this.heroVideoStage.getBoundingClientRect();

    // If the car stage is outside the user's view (scrolled above or below), pause and reset to 0.00s
    const isOutOfUserView = rect.top > vh * 0.86 || rect.bottom < vh * 0.14;
    if (isOutOfUserView) {
      if (this.isHeroCarPlayingForUser) {
        this.isHeroCarPlayingForUser = false;
        this.heroCarStartTime = null;
        this.heroVideo.pause();
        try {
          this.heroVideo.currentTime = 0;
        } catch (e) {}
      }
      this.heroVideoStage.style.setProperty('--hero-car-reveal', '0');
      return;
    }

    // Trigger presentation from 0.00s ONLY when the car stage enters the user's eye-level view
    const isMobile = window.innerWidth <= 768;
    const isInUserEyeLine = rect.top <= vh * (isMobile ? 0.82 : 0.68) && rect.bottom >= vh * (isMobile ? 0.16 : 0.28);
    if (isInUserEyeLine && !this.isHeroCarPlayingForUser) {
      this.isHeroCarPlayingForUser = true;
      this.heroCarStartTime = nowSeconds;
      try {
        this.heroVideo.currentTime = 0;
      } catch (e) {}
      this.heroVideo.play().catch(() => {});
    }

    if (this.heroCarStartTime !== null) {
      const elapsed = Math.max(0, nowSeconds - this.heroCarStartTime);
      const t = Math.min(1, elapsed / 1.85);
      const easeOut = 1 - Math.pow(1 - t, 3.0);
      this.heroVideoStage.style.setProperty('--hero-car-reveal', easeOut.toFixed(3));
    }
  }

  initInteractivePartSculptures() {
    this.partCards.forEach((card, activeIdx) => {
      const vid = card.querySelector('video');

      card.addEventListener('pointerenter', () => {
        this.partCards.forEach((c, idx) => {
          c.style.setProperty('--sibling-dim', idx === activeIdx ? '1' : '0.52');
          c.style.setProperty('--sibling-blur', idx === activeIdx ? '0px' : '1.4px');
          c.style.setProperty('--hover-scale', idx === activeIdx ? '1.045' : '0.985');
        });
      });

      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;

        const tiltY = (nx - 0.5) * 12.0;
        const tiltX = (0.5 - ny) * 9.5;
        const magX = (nx - 0.5) * 14.0;
        const magY = (ny - 0.5) * 10.0;

        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        card.style.setProperty('--mag-x', `${magX.toFixed(1)}px`);
        card.style.setProperty('--mag-y', `${magY.toFixed(1)}px`);
        card.style.setProperty('--spot-x', `${(nx * 100).toFixed(1)}%`);
        card.style.setProperty('--spot-y', `${(ny * 100).toFixed(1)}%`);
        card.style.setProperty('--hover-lum', '1');

        if (vid && vid.paused) {
          vid.play().catch(() => {});
        }
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--mag-x', '0px');
        card.style.setProperty('--mag-y', '0px');
        card.style.setProperty('--hover-lum', '0');
        this.partCards.forEach((c) => {
          c.style.setProperty('--sibling-dim', '1');
          c.style.setProperty('--sibling-blur', '0px');
          c.style.setProperty('--hover-scale', '1');
        });
      });
    });
  }

  updatePartSculptures(vh) {
    if (!this.partCards.length) return;

    for (let i = 0; i < this.partCards.length; i++) {
      const card = this.partCards[i];
      const rect = card.getBoundingClientRect();

      if (rect.bottom < -vh * 0.35 || rect.top > vh * 1.35) continue;

      const speed = parseFloat(card.getAttribute('data-parallax-speed') || '1.0');
      const enterDir = parseFloat(card.getAttribute('data-enter-dir') || '1.0');

      const entryRaw = (vh * 0.88 - rect.top) / (vh * 0.60);
      const clampedEntry = Math.min(1, Math.max(0, entryRaw));
      const reveal = 1 - Math.pow(1 - clampedEntry, 2.8);

      const cardCenter = rect.top + rect.height * 0.5;
      const centerOffset = (cardCenter - vh * 0.5) / vh;
      const parallaxY = centerOffset * 20.0 * speed + (1 - reveal) * 34.0;
      const shiftX = (1 - reveal) * 22.0 * enterDir;
      const videoScale = 1.0 + (1 - reveal) * 0.06;
      const flareSweep = -55 + (1 - centerOffset) * 70;

      card.style.setProperty('--part-reveal', Math.max(0.08, reveal).toFixed(3));
      card.style.setProperty('--part-shift-y', `${parallaxY.toFixed(1)}px`);
      card.style.setProperty('--part-shift-x', `${shiftX.toFixed(1)}px`);
      card.style.setProperty('--part-video-scale', videoScale.toFixed(3));
      card.style.setProperty('--part-flare-x', `${flareSweep.toFixed(1)}%`);
    }
  }

  updateConceptRow(rowEl, cardEl, wordsArr, startKey, vh, nowSeconds, isOpticalDialRow) {
    if (!rowEl || typeof nowSeconds !== 'number') return;

    const rect = rowEl.getBoundingClientRect();

    if (rect.top > vh * 0.94) {
      this[startKey] = null;
      wordsArr.forEach((w) => w.style.setProperty('--w-progress', '0'));
      if (cardEl) {
        cardEl.style.setProperty('--card-emerge', '0');
        if (isOpticalDialRow) cardEl.style.setProperty('--dial-progress', '0.12');
      }
      return;
    }

    if (rect.top <= vh * 0.68 && rect.bottom >= vh * 0.15 && this[startKey] === null) {
      this[startKey] = nowSeconds;
    }

    if (this[startKey] === null) return;

    const elapsed = Math.max(0, nowSeconds - this[startKey]);

    const wordDelays = [0.0, 0.62, 1.28];
    const wordDuration = 1.37;

    for (let i = 0; i < wordsArr.length; i++) {
      const wElapsed = Math.max(0, elapsed - wordDelays[i]);
      const t = Math.min(1, wElapsed / wordDuration);
      const easeOut = 1 - Math.pow(1 - t, 3.2);
      wordsArr[i].style.setProperty('--w-progress', easeOut.toFixed(3));
    }

    if (cardEl) {
      const carT = Math.min(1, Math.max(0, (elapsed - 0.10) / 2.55));
      const carEase = 1 - Math.pow(1 - carT, 3.0);
      cardEl.style.setProperty('--card-emerge', carEase.toFixed(3));

      if (isOpticalDialRow) {
        const isStartingPlaying = cardEl.classList.contains('is-playing');
        const isMotionPlaying = this.motionCard && this.motionCard.classList.contains('is-playing');

        let dialProg = Math.min(1, Math.max(0.12, carEase));
        if (isStartingPlaying || isMotionPlaying) {
          dialProg = 0.96 + Math.sin(nowSeconds * 42.0) * 0.035;
        }

        cardEl.style.setProperty('--dial-progress', dialProg.toFixed(3));

        if (this.speedoRpmNumber) {
          const targetRpm = (isStartingPlaying || isMotionPlaying)
            ? 9000
            : Math.round((900 + dialProg * 8100) / 50) * 50;
          this.speedoRpmNumber.textContent = targetRpm.toLocaleString('en-US');
        }
      }
    }
  }

  updateOpticalStage(stageEl, cardEl, startKey, nowSeconds, vh) {
    if (!stageEl || !cardEl) return;

    const rect = stageEl.getBoundingClientRect();
    if (rect.bottom < -vh * 0.2 || rect.top > vh * 1.2) return;

    const stageCenter = rect.top + rect.height * 0.5;
    const distFromViewportCenter = Math.abs(stageCenter - vh * 0.5);

    if (rect.top < vh * 0.85 && rect.bottom > vh * 0.15 && this[startKey] === null) {
      this[startKey] = nowSeconds;
    }

    const normalizedDist = Math.min(1, distFromViewportCenter / (vh * 0.78));
    const scrollLum = Math.pow(1 - normalizedDist, 1.55);

    let timeLum = 0;
    let shimmerOffsetPx = 0;
    let flareScale = 0.65;

    if (this[startKey] !== null) {
      const elapsed = Math.max(0, nowSeconds - this[startKey]);
      if (elapsed <= 4.0) {
        const t4 = elapsed / 4.0;
        timeLum = 1 - Math.pow(1 - t4, 2.6);
        flareScale = 0.62 + 0.38 * timeLum;
      } else {
        const phase = elapsed - 4.0;
        const subtleWave = Math.sin(phase * 1.55) * 0.055;
        timeLum = 0.945 + subtleWave;
        shimmerOffsetPx = Math.sin(phase * 1.1) * 14.0;
        flareScale = 1.0 + Math.sin(phase * 1.55) * 0.06;
      }
    }

    const viewportPresence = rect.bottom < 0 || rect.top > vh
      ? 0.0
      : Math.min(1, Math.pow(1 - Math.min(1, distFromViewportCenter / (vh * 0.98)), 0.75));

    const finalLum = Math.min(1, Math.max(scrollLum, timeLum * viewportPresence));

    cardEl.style.setProperty('--n-lum', finalLum.toFixed(3));
    cardEl.style.setProperty('--n-shimmer-x', `${shimmerOffsetPx.toFixed(1)}px`);
    cardEl.style.setProperty('--n-flare-scale', flareScale.toFixed(3));
  }

  update(scrollProgress, nowSeconds) {
    const vh = window.innerHeight || 1;
    if (typeof nowSeconds === 'number') {
      this.updateHeroCarPresentation(vh, nowSeconds);
      this.updateOpticalStage(this.heroTitleStage, this.heroTitleCard, 'heroRevealStartTime', nowSeconds, vh);
      this.updateOpticalStage(this.nStage, this.nCard, 'nRevealStartTime', nowSeconds, vh);
      this.updateOpticalStage(this.beyondStage, this.beyondCard, 'beyondRevealStartTime', nowSeconds, vh);
    }

    this.updatePartSculptures(vh);
    this.updateConceptRow(this.motionRow, this.motionCard, this.motionWords, 'motionStartTime', vh, nowSeconds, false);
    this.updateConceptRow(this.ignitionRow, this.ignitionCard, this.ignitionWords, 'ignitionStartTime', vh, nowSeconds, true);

    if (this.motionWhisper && this.motionCard) {
      this.motionWhisper.textContent = this.motionCard.classList.contains('is-playing')
        ? 'ACTIVE // 9,000 RPM IN MOTION'
        : 'IN MOTION // 9,000 RPM';
    }
    if (this.ignitionWhisper && this.ignitionCard) {
      this.ignitionWhisper.textContent = this.ignitionCard.classList.contains('is-playing')
        ? 'ACTIVE // 9,000 RPM IGNITION'
        : 'PULSE TO IGNITE';
    }
  }
}

window.UIController = UIController;
