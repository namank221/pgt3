/**
 * GT3 Exploded-View // Phase 3 Cylindrical Orbit Camera Choreography
 * Smoothly interpolates (radius, azimuth, height) around the car with subtle cursor parallax.
 */

class CameraPathController {
  constructor(camera) {
    this.camera = camera;
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Keyframes in cylindrical coordinates:
    // theta: azimuth angle in radians (0 = +Z front nose, +PI/2 = +X left side, PI = -Z rear wing)
    this.keyframes = [
      // 0.00: Dramatic Front-Quarter Close-Up
      { scroll: 0.00, radius: 4.65, theta: 0.58, height: 1.35, targetY: 0.58, targetZ: 0.35 },
      // 0.16: Pull back to Studio Framing as explosion begins
      { scroll: 0.16, radius: 6.55, theta: 0.88, height: 1.85, targetY: 0.65, targetZ: 0.05 },
      // 0.45: Elevated Side-to-Rear Sweep (Doors, wheels & canopy suspended)
      { scroll: 0.45, radius: 6.95, theta: 2.35, height: 2.85, targetY: 0.72, targetZ: 0.00 },
      // 0.72: Rear Aero & Wing Showcase (360 orbit past rear diffuser)
      { scroll: 0.72, radius: 6.75, theta: 4.15, height: 2.15, targetY: 0.68, targetZ: -0.10 },
      // 1.00: Complete 360 Orbit & Settle into Low Hero Stance
      { scroll: 1.00, radius: 5.85, theta: 6.283 + 0.65, height: 1.55, targetY: 0.60, targetZ: 0.10 }
    ];

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

  smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  update(scrollProgress) {
    if (!this.camera) return;

    const p = Math.min(Math.max(scrollProgress, 0), 1);

    let k0 = this.keyframes[0];
    let k1 = this.keyframes[this.keyframes.length - 1];

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (p >= this.keyframes[i].scroll && p <= this.keyframes[i + 1].scroll) {
        k0 = this.keyframes[i];
        k1 = this.keyframes[i + 1];
        break;
      }
    }

    const span = k1.scroll - k0.scroll;
    const rawT = span > 0 ? (p - k0.scroll) / span : 0;
    // Blend linear + smoothstep so camera never freezes at intermediate waypoints
    const t = 0.35 * rawT + 0.65 * this.smoothstep(rawT);

    const radius = k0.radius + (k1.radius - k0.radius) * t;
    const theta = k0.theta + (k1.theta - k0.theta) * t;
    const height = k0.height + (k1.height - k0.height) * t;
    const targetY = k0.targetY + (k1.targetY - k0.targetY) * t;
    const targetZ = k0.targetZ + (k1.targetZ - k0.targetZ) * t;

    this.smoothMouseX += (this.mouseX - this.smoothMouseX) * 0.06;
    this.smoothMouseY += (this.mouseY - this.smoothMouseY) * 0.06;

    const finalTheta = theta + this.smoothMouseX * 0.06;
    const finalHeight = Math.max(0.4, height - this.smoothMouseY * 0.18);

    this.camera.position.set(
      Math.sin(finalTheta) * radius,
      finalHeight,
      Math.cos(finalTheta) * radius
    );
    this.camera.lookAt(0, targetY, targetZ);
  }
}

window.CameraPathController = CameraPathController;
