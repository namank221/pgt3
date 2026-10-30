/**
 * GT3 Exploded-View // Camera Path Tracer with Mobile Portrait Aspect Compensation (v=939)
 * - Desktop (aspect >= 1.0): 100% identical to v=938
 * - Mobile Portrait (aspect < 1.0): automatically scales camera radius so the entire 3D Porsche
 *   and its laterally exploding wheels/doors fit inside a 9:16 mobile screen without clipping
 */

class CameraPathController {
  constructor(camera) {
    this.camera = camera;
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.baseRadius = 6.10;
    this.baseTheta = 0.65;
    this.idleOffset = 0;

    this.mouseX = 0;
    this.mouseY = 0;
    this.smoothMouseX = 0;
    this.smoothMouseY = 0;

    if (!this.reducedMotion) {
      window.addEventListener('mousemove', (e) => {
        this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        document.documentElement.style.setProperty('--wm-x', `${(this.mouseX * -16).toFixed(1)}px`);
      }, { passive: true });
    }
  }

  update(scrollProgress, carCenterY, explodeProgress) {
    if (!this.camera) return;

    const s = Math.min(Math.max(scrollProgress, 0), 1);
    const exp = typeof explodeProgress === 'number' ? explodeProgress : 0;

    // Full 360° studio orbit across the 4 sections
    const theta = this.baseTheta + (Math.PI * 2.15) * s + (this.idleOffset || 0);

    // Portrait mobile aspect compensation (1.0 on desktop, ~1.75x-1.95x pullback on 9:16 phones so car is never clipped)
    const aspect = (window.innerWidth || 1) / (window.innerHeight || 1);
    const mobileRadiusMultiplier = aspect < 1.0
      ? Math.min(2.05, 0.92 / Math.max(0.42, aspect))
      : 1.0;

    const baseR = (this.baseRadius + exp * 0.45 - (s > 0.72 ? ((s - 0.72) / 0.28) * 0.40 : 0)) * mobileRadiusMultiplier;

    const baseHeight = (typeof carCenterY === 'number' ? carCenterY : 0) + (1.48 - 0.32 * s + exp * 0.22) * (aspect < 1.0 ? 1.15 : 1.0);

    this.smoothMouseX += (this.mouseX - this.smoothMouseX) * 0.06;
    this.smoothMouseY += (this.mouseY - this.smoothMouseY) * 0.06;

    const finalTheta = theta + this.smoothMouseX * 0.05;
    const finalHeight = Math.max(0.55, baseHeight - this.smoothMouseY * 0.12);

    const x = Math.sin(finalTheta) * baseR;
    const z = Math.cos(finalTheta) * baseR;

    const lookY = (typeof carCenterY === 'number' ? carCenterY : 0) + 0.52 + exp * 0.12;

    this.camera.position.set(x, finalHeight, z);
    this.camera.lookAt(0, lookY, 0);
  }
}

window.CameraPathController = CameraPathController;
