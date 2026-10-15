/**
 * GT3 Exploded-View // Phase 2 Verified Part-Group Explosion Engine
 * Accounts for gt3.glb parent node names and -90 deg X parent local transform.
 */

class ExplodeEngine {
  constructor(carModel) {
    this.carModel = carModel;
    this.parts = [];
    this.init();
  }

  init() {
    if (!this.carModel) return;
    this.carModel.updateMatrixWorld(true);

    this.carModel.traverse((child) => {
      if (!child.isMesh) return;

      const rawName = (child.name && !child.name.startsWith('Object_'))
        ? child.name
        : ((child.parent && child.parent.name) || child.name || '');
      const name = rawName.toLowerCase();

      // Hide duplicate motion-blur / damage / duplicate harness state meshes
      if (name.includes('rim_blur') || name.includes('damageglass') || name.includes('cinture_on')) {
        child.visible = false;
        return;
      }

      const box = new THREE.Box3().setFromObject(child);
      const center = box.getCenter(new THREE.Vector3());

      const partData = {
        mesh: child,
        name: name,
        originalPos: child.position.clone(),
        originalRot: child.rotation.clone(),
        center: center,
        worldOffset: new THREE.Vector3(0, 0, 0),
        worldRotOffset: new THREE.Vector3(0, 0, 0),
        staggerStart: 0.0,
        staggerEnd: 1.0
      };

      this.assignGroupVector(partData);
      this.parts.push(partData);
    });

    console.log(`[ExplodeEngine] Initialized ${this.parts.length} active mesh parts.`);
  }

  assignGroupVector(p) {
    const name = p.name;
    const x = p.center.x;
    const y = p.center.y;
    const z = p.center.z;
    // In centered world space (+Z forward, +Y up), +X is Left and -X is Right
    const side = x >= 0 ? 1 : -1;

    // 1. WHEELS & TIRES (Outward 0.78m)
    if (name.includes('rim') || name.includes('tyre') || name.includes('tire')) {
      p.worldOffset.set(side * 0.78, 0, 0);
      p.staggerStart = 0.00;
      p.staggerEnd = 0.65;
      return;
    }

    // 2. BRAKE DISCS, CALIPERS & WHEEL HUBS (Outward 0.40m, nested inside wheel path)
    if (name.includes('caliper') || name.includes('disc') || name.includes('hub')) {
      p.worldOffset.set(side * 0.40, 0, 0);
      p.staggerStart = 0.06;
      p.staggerEnd = 0.72;
      return;
    }

    // 3. REAR WING, SPOILER & UPRIGHTS (Elevate +0.52m, push back -0.72m)
    if (name.includes('spoiler') || name.includes('wing') || name.includes('body_sub2')) {
      p.worldOffset.set(0, 0.52, -0.72);
      p.worldRotOffset.set(-0.08, 0, 0);
      p.staggerStart = 0.10;
      p.staggerEnd = 0.80;
      return;
    }

    // 4. REAR BUMPER, DIFFUSER, TAILLIGHTS & REAR GRILLES (Backward -0.58m, slight drop -0.08m)
    if (
      name.includes('rearlight') ||
      name.includes('rearbumper') ||
      name.includes('glass_rear') ||
      name.includes('detached50') ||
      name.includes('detached53') ||
      name.includes('detached73') ||
      name.includes('body_sub8') ||
      name.includes('body_sub9')
    ) {
      p.worldOffset.set(0, -0.08, -0.58);
      p.staggerStart = 0.14;
      p.staggerEnd = 0.82;
      return;
    }

    // 5. FRONT HOOD, WIPERS & COWL GRID (Forward +0.62m, lift +0.36m, slight pitch)
    if (name.includes('motorhood') || name.includes('wiper') || name.includes('gridsbody')) {
      p.worldOffset.set(0, 0.36, 0.62);
      p.worldRotOffset.set(0.10, 0, 0);
      p.staggerStart = 0.08;
      p.staggerEnd = 0.76;
      return;
    }

    // 6. FRONT BUMPER & HEADLIGHT ASSEMBLIES (Forward +0.56m)
    if (
      name.includes('front_bumper') ||
      name.includes('frontlight') ||
      name.includes('body_sub4') ||
      name.includes('body_sub5')
    ) {
      p.worldOffset.set(0, 0.04, 0.56);
      p.staggerStart = 0.12;
      p.staggerEnd = 0.78;
      return;
    }

    // 7. COMPLETE LEFT & RIGHT DOOR ASSEMBLIES (Outward 0.62m, lift +0.12m, subtle outward yaw)
    if (
      name.includes('door') ||
      name.includes('mirror_') ||
      name.includes('window_l') ||
      name.includes('wind_l') ||
      name.includes('wind_r') ||
      name.includes('plastic_flat2') ||
      name.includes('rubber_l') ||
      name.includes('rubber_r') ||
      name.includes('decals_l') ||
      name.includes('decals_r') ||
      name.includes('stich1') ||
      name.includes('stich2') ||
      name.includes('polymsh111') ||
      name.includes('polymsh108')
    ) {
      p.worldOffset.set(side * 0.62, 0.12, 0.08);
      p.worldRotOffset.set(0, -side * 0.14, 0);
      p.staggerStart = 0.14;
      p.staggerEnd = 0.86;
      return;
    }

    // 8. WINDSHIELD, REAR CANOPY GLASS & INTERIOR MIRROR (Ascend vertically +0.58m)
    if (name.includes('windows_sub') || name.startsWith('mirror.001')) {
      p.worldOffset.set(0, 0.58, -0.06);
      p.staggerStart = 0.18;
      p.staggerEnd = 0.88;
      return;
    }

    // 9. SEATS, ROLLBAR & RACING HARNESSES (Elevate +0.26m inside open cabin)
    if (
      name.includes('seat') ||
      name.includes('rollbar') ||
      name.includes('cinture') ||
      name.includes('extracted24') ||
      name.includes('seams_sub1')
    ) {
      p.worldOffset.set(0, 0.26, -0.08);
      p.staggerStart = 0.24;
      p.staggerEnd = 0.92;
      return;
    }

    // 10. DASHBOARD, STEERING COLUMN & GAUGE CLUSTER (Cohesive forward/upward float +0.14m)
    if (
      name.includes('dial') ||
      name.includes('steer') ||
      name.includes('pad_') ||
      name.includes('tag_') ||
      name.includes('cylinder') ||
      name.includes('light_up') ||
      name.includes('led_fuel') ||
      name.includes('ind_light') ||
      name.includes('switch') ||
      name.includes('display_tunnel') ||
      name.includes('detached45') ||
      name.includes('extracted12')
    ) {
      p.worldOffset.set(0, 0.14, 0.12);
      p.staggerStart = 0.26;
      p.staggerEnd = 0.94;
      return;
    }

    // 11. UNIBODY SHELL & CHASSIS FLOOR (Anchored reference core)
    p.worldOffset.set(0, 0, 0);
  }

  ease(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // Maps scroll [0..1] -> explosion envelope:
  // 0.00..0.08: Assembled hero close-up
  // 0.08..0.64: Progressive deconstruction
  // 0.64..0.78: Full exploded hold during 360 orbit
  // 0.78..0.96: Symmetrical reassembly to settled stance
  getEnvelope(scrollProgress) {
    if (scrollProgress <= 0.08) return 0;
    if (scrollProgress < 0.64) {
      return (scrollProgress - 0.08) / (0.64 - 0.08);
    }
    if (scrollProgress <= 0.78) return 1;
    if (scrollProgress < 0.96) {
      return 1 - (scrollProgress - 0.78) / (0.96 - 0.78);
    }
    return 0;
  }

  update(scrollProgress) {
    if (!this.parts.length) return;

    const globalT = this.getEnvelope(scrollProgress);

    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      const span = p.staggerEnd - p.staggerStart;
      let localT = span > 0 ? (globalT - p.staggerStart) / span : 0;
      localT = Math.min(Math.max(localT, 0), 1);

      const factor = this.ease(localT);

      // Transform World offset (dx, dy, dz) into Parent Local Space (dx, dz, -dy)
      p.mesh.position.x = p.originalPos.x + p.worldOffset.x * factor;
      p.mesh.position.y = p.originalPos.y + p.worldOffset.z * factor;
      p.mesh.position.z = p.originalPos.z - p.worldOffset.y * factor;

      if (
        p.worldRotOffset.x !== 0 ||
        p.worldRotOffset.y !== 0 ||
        p.worldRotOffset.z !== 0
      ) {
        p.mesh.rotation.x = p.originalRot.x + p.worldRotOffset.x * factor;
        p.mesh.rotation.y = p.originalRot.y + p.worldRotOffset.z * factor;
        p.mesh.rotation.z = p.originalRot.z - p.worldRotOffset.y * factor;
      }
    }
  }
}

window.ExplodeEngine = ExplodeEngine;
