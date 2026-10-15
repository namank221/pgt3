/**
 * GT3 Exploded-View // Phase 2 & 3 Calculated Explosion Engine
 * Rigorous real-world automotive coordinate offsets.
 * Car dimensions: Width: 2.00m | Length: 4.55m | Height: 1.30m
 * Bounding envelope during explosion: Max 3.4m wide, 2.4m high, 5.8m long.
 */

class ExplodeEngine {
  constructor(carModel) {
    this.carModel = carModel;
    this.parts = [];

    // Explosion runs smoothly on scroll window [0.10, 0.75]
    this.scrollStart = 0.10;
    this.scrollEnd = 0.75;

    this.init();
  }

  init() {
    if (!this.carModel) return;

    this.carModel.traverse((child) => {
      if (child.isMesh) {
        // Calculate world position relative to centered model
        const box = new THREE.Box3().setFromObject(child);
        const center = box.getCenter(new THREE.Vector3());

        const partData = {
          mesh: child,
          name: (child.name || child.parent.name || '').toLowerCase(),
          originalPos: child.position.clone(),
          originalRot: child.rotation.clone(),
          center: center,
          offset: new THREE.Vector3(0, 0, 0),
          rotOffset: new THREE.Vector3(0, 0, 0),
          staggerStart: 0,
          staggerEnd: 1
        };

        this.calculateExactVector(partData);
        this.parts.push(partData);
      }
    });

    console.log(`[ExplodeEngine] Computed calculated vectors for ${this.parts.length} parts.`);
  }

  calculateExactVector(p) {
    const name = p.name;
    const x = p.center.x;
    const y = p.center.y;
    const z = p.center.z;

    const isLeft = x < -0.1 || name.includes('_l') || name.includes('lf') || name.includes('lr');
    const isRight = x > 0.1 || name.includes('_r') || name.includes('rf') || name.includes('rr');
    const isFront = z > 0.4 || name.includes('front') || name.includes('hood') || name.includes('bonnet');
    const isRear = z < -0.4 || name.includes('rear') || name.includes('spoiler') || name.includes('wing') || name.includes('diffuser');

    // 1. BRAKE CALIPERS: Move laterally exactly 0.35m (floats inside rim cavity)
    if (name.includes('caliper') || (name.includes('brake') && !name.includes('disc'))) {
      const lat = isLeft ? -0.38 : 0.38;
      p.offset.set(lat, 0, 0);
      p.staggerStart = 0.05;
      p.staggerEnd = 0.70;
      return;
    }

    // 2. WHEELS, TIRES, RIMS & HUBS: Move laterally exactly 0.72m
    if (name.includes('rim') || name.includes('wheel') || name.includes('tyre') || name.includes('tire') || name.includes('hub')) {
      const lat = isLeft ? -0.72 : 0.72;
      p.offset.set(lat, 0, 0);
      p.staggerStart = 0.0;
      p.staggerEnd = 0.65;
      return;
    }

    // 3. REAR SPOILER / WING: Elevate +0.48m, push back -0.75m
    if (name.includes('spoiler') || name.includes('wing')) {
      p.offset.set(0, 0.48, -0.75);
      p.rotOffset.set(-0.08, 0, 0);
      p.staggerStart = 0.12;
      p.staggerEnd = 0.80;
      return;
    }

    // 4. REAR LIGHTS & DIFFUSER: Backward -0.55m, down -0.12m
    if (name.includes('rearlight') || name.includes('diffuser') || (isRear && y < 0.55)) {
      p.offset.set(x * 0.25, -0.12, -0.55);
      p.staggerStart = 0.15;
      p.staggerEnd = 0.82;
      return;
    }

    // 5. FRONT HOOD & NOSE: Forward +0.70m, lift +0.32m
    if (isFront && (name.includes('hood') || name.includes('bonnet') || y > 0.45)) {
      p.offset.set(0, 0.32, 0.70);
      p.rotOffset.set(0.08, 0, 0);
      p.staggerStart = 0.08;
      p.staggerEnd = 0.75;
      return;
    }

    // 6. FRONT HEADLIGHTS & BUMPER: Forward +0.55m
    if (name.includes('frontlight') || (isFront && y <= 0.45)) {
      p.offset.set(x * 0.2, 0.1, 0.55);
      p.staggerStart = 0.10;
      p.staggerEnd = 0.78;
      return;
    }

    // 7. DOORS, MIRRORS & SIDE WINDOWS: Outward 0.58m + 12-degree subtle yaw
    if (name.includes('door') || name.includes('mirror') || name.includes('window') || name.includes('glass')) {
      const lat = isLeft ? -0.58 : 0.58;
      p.offset.set(lat, 0.18, 0);
      p.rotOffset.set(0, isLeft ? 0.18 : -0.18, 0);
      p.staggerStart = 0.12;
      p.staggerEnd = 0.85;
      return;
    }

    // 8. ROOF & UPPER CANOPY: Ascend vertically +0.65m
    if (y > 0.90 && Math.abs(x) < 0.65) {
      p.offset.set(0, 0.65, -0.05);
      p.staggerStart = 0.15;
      p.staggerEnd = 0.88;
      return;
    }

    // 9. INTERIOR & DIALS: Stable core, micro-expansion 0.10m
    if (name.includes('dial') || name.includes('seat') || name.includes('interior') || name.includes('steer')) {
      p.offset.set(x * 0.1, y * 0.08, z * 0.08);
      p.staggerStart = 0.2;
      p.staggerEnd = 0.9;
      return;
    }

    // 10. CHASSIS BEDROCK: Remains anchored at factory 0
    p.offset.set(0, 0, 0);
  }

  // Quintic smoothstep easing for luxury machinery feel
  ease(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  update(scrollProgress) {
    if (!this.parts.length) return;

    let globalT = (scrollProgress - this.scrollStart) / (this.scrollEnd - this.scrollStart);
    globalT = Math.min(Math.max(globalT, 0), 1);

    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];

      const span = p.staggerEnd - p.staggerStart;
      let localT = (globalT - p.staggerStart) / span;
      localT = Math.min(Math.max(localT, 0), 1);

      const factor = this.ease(localT);

      // Exact linear displacement
      p.mesh.position.x = p.originalPos.x + p.offset.x * factor;
      p.mesh.position.y = p.originalPos.y + p.offset.y * factor;
      p.mesh.position.z = p.originalPos.z + p.offset.z * factor;

      if (p.rotOffset.x !== 0 || p.rotOffset.y !== 0 || p.rotOffset.z !== 0) {
        p.mesh.rotation.x = p.originalRot.x + p.rotOffset.x * factor;
        p.mesh.rotation.y = p.originalRot.y + p.rotOffset.y * factor;
        p.mesh.rotation.z = p.originalRot.z + p.rotOffset.z * factor;
      }
    }
  }
}

window.ExplodeEngine = ExplodeEngine;
