/**
 * GT3 Exploded-View // Phase 3 Camera Choreography
 * Constant-radius 6.80m 360° orbit with locked realistic vehicle scale.
 * Coordinated look target tracks car descent so downward motion remains visible without drifting out of view.
 */

class CameraPathController {
  constructor(camera) {
    this.camera = camera;
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Locked constant orbit radius in meters - vehicle scale NEVER shrinks or blows up
    this.radius = 6.80;

    // Base front-three-quarter azimuth angle (~37.2 degrees)
    this.baseTheta = 0.65;

    this.mouseX = 0;
    this.mouseY = 0;
    this.smoothMouseX = 0;
    this.smoothMouseY = 0;

    if (!this.reducedMotion) {
      window.addEventListener('mousemove', (e) => {
        this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }
  }

  update(scrollProgress) {
    if (!this.camera) return;

    const s = Math.min(Math.max(scrollProgress, 0), 1);

    // Continuous 360° orbital revolution
    const theta = this.baseTheta + (Math.PI * 2) * s;

    // Smooth camera elevation glide (1.55m -> 1.20m)
    const height = 1.55 - 0.35 * s;

    // Coordinated target tracking: glides from 0.65m to -0.20m so downward motion remains visible
    // while keeping all exploded subassemblies perfectly centered inside the 100vh viewport
    const targetY = 0.65 - 0.85 * s;

    this.smoothMouseX += (this.mouseX - this.smoothMouseX) * 0.06;
    this.smoothMouseY += (this.mouseY - this.smoothMouseY) * 0.06;

    const finalTheta = theta + this.smoothMouseX * 0.05;
    const finalHeight = Math.max(0.6, height - this.smoothMouseY * 0.15);

    const x = Math.sin(finalTheta) * this.radius;
    const z = Math.cos(finalTheta) * this.radius;

    this.camera.position.set(x, finalHeight, z);
    this.camera.lookAt(0, targetY, 0);
  }
}

window.CameraPathController = CameraPathController;
