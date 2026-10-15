/**
 * GT3 Exploded-View // Phase 3 Constant-Distance Camera Choreography
 * Camera distance remains locked at R ~ 6.8m around vehicle center (0, 0.65, 0).
 * Prevents accordion shrinking and keeps vehicle perfectly framed at all times.
 */

class CameraPathController {
  constructor(camera) {
    this.camera = camera;

    // Fixed automotive center
    this.fixedTarget = new THREE.Vector3(0, 0.65, 0);

    // Constant-radius orbit path (R ~ 6.8 meters, FOV 40 deg)
    this.waypoints = [
      // 0.00: Majestic Front-Three-Quarter Hero Stance
      { scroll: 0.00, pos: new THREE.Vector3(4.6, 1.8, 4.6), target: new THREE.Vector3(0, 0.60, 0.2) },

      // 0.25: Front-Lateral Sweep (Wheels & front aero deploy)
      { scroll: 0.25, pos: new THREE.Vector3(6.2, 2.0, 2.0), target: new THREE.Vector3(0, 0.65, 0.0) },

      // 0.55: Elevated Top-Quarter View (Doors & roof floating in suspension)
      { scroll: 0.55, pos: new THREE.Vector3(4.0, 3.4, -4.4), target: new THREE.Vector3(0, 0.70, 0.0) },

      // 0.80: 360-Degree Rear Aerodynamic View (Exposed rear wing & diffuser)
      { scroll: 0.80, pos: new THREE.Vector3(-4.4, 2.0, -4.6), target: new THREE.Vector3(0, 0.65, -0.2) },

      // 1.00: Low-Angle Driver-Side Quarter Finish
      { scroll: 1.00, pos: new THREE.Vector3(-5.2, 1.4, 3.6), target: new THREE.Vector3(0, 0.60, 0.1) }
    ];

    this.currentPos = new THREE.Vector3();
    this.currentTarget = new THREE.Vector3();
  }

  smooth(t) {
    return t * t * (3 - 2 * t);
  }

  update(scrollProgress) {
    if (!this.camera) return;

    const p = Math.min(Math.max(scrollProgress, 0), 1);

    // Locate segment
    let w0 = this.waypoints[0];
    let w1 = this.waypoints[this.waypoints.length - 1];

    for (let i = 0; i < this.waypoints.length - 1; i++) {
      if (p >= this.waypoints[i].scroll && p <= this.waypoints[i + 1].scroll) {
        w0 = this.waypoints[i];
        w1 = this.waypoints[i + 1];
        break;
      }
    }

    const span = w1.scroll - w0.scroll;
    const t = span > 0 ? (p - w0.scroll) / span : 0;
    const factor = this.smooth(t);

    // Symmetrical position interpolation
    this.currentPos.lerpVectors(w0.pos, w1.pos, factor);
    this.camera.position.copy(this.currentPos);

    // Symmetrical target interpolation
    this.currentTarget.lerpVectors(w0.target, w1.target, factor);
    this.camera.lookAt(this.currentTarget);
  }
}

window.CameraPathController = CameraPathController;
