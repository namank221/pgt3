/**
 * GT3 Exploded-View // Sequential 3-Stage Story Deconstruction Engine
 * Aligned with three 100vh story sections across normalized progress 0 to 1:
 * - Stage 1 (0.00 - 0.35): Intact baseline to Rolling Chassis, Wheels & Ceramic Brakes separation
 * - Stage 2 (0.30 - 0.68): Exterior & Mechanical Components (Bonnet, Wing, Doors, Bumpers & Diffuser)
 * - Stage 3 (0.62 - 1.00): Cabin Reveal & Complete Monocoque Deconstruction (Canopy, Seats, Steering, Cluster)
 * Reaches 100% complete exploded state as the user finishes section three (scroll = 1.00).
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

      // Hide duplicate motion blur / damage artifacts
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
        // World Displacement in Meters (X = lateral, Y = vertical, Z = longitudinal)
        worldOffset: new THREE.Vector3(0, 0, 0),
        worldRotOffset: new THREE.Vector3(0, 0, 0),
        stageStart: 0.0,
        stageEnd: 1.0
      };

      this.calculateVectors(partData);
      this.parts.push(partData);
    });

    console.log(`[ExplodeEngine] Active parts ready: ${this.parts.length} assemblies mapped.`);
  }

  calculateVectors(p) {
    const name = p.name;
    const x = p.center.x;
    const y = p.center.y;
    const z = p.center.z;
    // In model world space: +X is Left side, -X is Right side
    const side = x >= 0 ? 1 : -1;

        // --- STAGE 1: ROLLING CHASSIS & BRAKES (0.00 -> 0.35) ---
    // 1. WHEELS & TIRES: Displace outward laterally by 1.65m along axle line
    if (name.includes('rim') || name.includes('tyre') || name.includes('tire') || name.includes('wheel')) {
      p.worldOffset.set(side * 1.65, 0, 0);
      p.stageStart = 0.08;
      p.stageEnd = 0.35;
      return;
    }

    // 2. BRAKE CALIPERS, ROTORS & HUBS: Displace outward laterally by 0.90m
    if (name.includes('caliper') || name.includes('disc') || name.includes('hub') || name.includes('brake')) {
      p.worldOffset.set(side * 0.90, 0, 0);
      p.stageStart = 0.12;
      p.stageEnd = 0.38;
      return;
    }

    // --- STAGE 2: EXTERIOR & MECHANICAL KINETICS (0.30 -> 0.68) ---
    // 3. REAR WING & SWAN-NECK SPOILER: Lift up +1.20m, translate back -1.55m
    if (name.includes('spoiler') || name.includes('wing') || name.includes('body_sub2')) {
      p.worldOffset.set(0, 1.20, -1.55);
      p.worldRotOffset.set(-0.15, 0, 0);
      p.stageStart = 0.30;
      p.stageEnd = 0.64;
      return;
    }

    // 4. FRONT BONNET / HOOD & WIPERS: Slide forward +1.50m, lift +0.70m
    if (name.includes('motorhood') || name.includes('hood') || name.includes('bonnet') || name.includes('wiper') || name.includes('gridsbody')) {
      p.worldOffset.set(0, 0.70, 1.50);
      p.worldRotOffset.set(0.15, 0, 0);
      p.stageStart = 0.32;
      p.stageEnd = 0.65;
      return;
    }

    // 5. DOORS & MIRRORS: Move outward 1.40m, lift +0.25m, outward yaw rotation
    if (
      name.includes('door') ||
      name.includes('mirror') ||
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
      p.worldOffset.set(side * 1.40, 0.25, 0.10);
      p.worldRotOffset.set(0, -side * 0.18, 0);
      p.stageStart = 0.34;
      p.stageEnd = 0.68;
      return;
    }

    // 6. FRONT BUMPER & HEADLIGHTS: Slide forward +1.40m, lift +0.10m
    if (name.includes('front_bumper') || name.includes('frontlight') || name.includes('body_sub4') || name.includes('body_sub5')) {
      p.worldOffset.set(0, 0.10, 1.40);
      p.stageStart = 0.36;
      p.stageEnd = 0.68;
      return;
    }

    // 7. REAR BUMPER, DIFFUSER & TAILLIGHTS: Translate back -1.45m, drop -0.25m
    if (
      name.includes('rearlight') ||
      name.includes('rearbumper') ||
      name.includes('diffuser') ||
      name.includes('glass_rear') ||
      name.includes('detached50') ||
      name.includes('detached53') ||
      name.includes('detached73') ||
      name.includes('body_sub8') ||
      name.includes('body_sub9')
    ) {
      p.worldOffset.set(0, -0.25, -1.45);
      p.stageStart = 0.38;
      p.stageEnd = 0.70;
      return;
    }

    // 8. BODY SIDE PANELS & FENDER LOUVERS: Outward 0.80m, lift +0.25m
    if (
      name.includes('body_sub0') ||
      name.includes('body_sub1') ||
      name.includes('body_sub6') ||
      name.includes('body_sub7') ||
      name.includes('extracted24')
    ) {
      p.worldOffset.set(side * 0.80, 0.25, 0);
      p.stageStart = 0.40;
      p.stageEnd = 0.72;
      return;
    }

    // --- STAGE 3: CABIN REVEAL & COMPLETE MONOCOQUE DECONSTRUCTION (0.62 -> 1.00) ---
    // 9. ROOF & CANOPY GLASS: Lift up vertically +1.35m
    if (name.includes('windows_sub') || name.includes('mirror.001') || name.includes('mirror_001')) {
      p.worldOffset.set(0, 1.35, -0.05);
      p.stageStart = 0.62;
      p.stageEnd = 0.92;
      return;
    }

    // 10. BUCKET SEATS & ROLLBAR: Elevate +0.65m inside cabin
    if (name.includes('seat') || name.includes('rollbar') || name.includes('cinture') || name.includes('seams_sub1')) {
      p.worldOffset.set(0, 0.65, -0.06);
      p.stageStart = 0.64;
      p.stageEnd = 0.94;
      return;
    }

    // 11. COCKPIT FLOOR TRIM, PEDALS & SEAMS: Elevate +0.28m
    if (
      name.includes('cockpit_hr') ||
      name.includes('details_sub') ||
      name.includes('seams_sub') ||
      name.includes('stickers') ||
      name.includes('polymsh8')
    ) {
      p.worldOffset.set(0, 0.28, 0);
      p.stageStart = 0.66;
      p.stageEnd = 0.96;
      return;
    }

    // 12. STEERING COLUMN & PADDLE SHIFTERS: Elevate +0.50m, forward +0.60m
    if (
      name.includes('steer') ||
      name.includes('pad_l') ||
      name.includes('pad_r') ||
      name.includes('stich') ||
      name.includes('extracted12') ||
      name.includes('polymsh99')
    ) {
      p.worldOffset.set(-0.35, 0.50, 0.60);
      p.worldRotOffset.set(0.12, 0, 0);
      p.stageStart = 0.68;
      p.stageEnd = 0.98;
      return;
    }

    // 13. DASHBOARD, GAUGES & TELEMETRY DISPLAYS: Forward +0.55m, lift +0.65m
    if (
      name.includes('dials') ||
      name.includes('fuel') ||
      name.includes('light_up') ||
      name.includes('cylinder') ||
      name.includes('water_temp') ||
      name.includes('oil_temp') ||
      name.includes('oil_pressure') ||
      name.includes('switch') ||
      name.includes('ind_light') ||
      name.includes('display_tunnel') ||
      name.includes('detached45') ||
      name.includes('detached46') ||
      name.includes('extracted22')
    ) {
      p.worldOffset.set(0, 0.65, 0.55);
      p.stageStart = 0.70;
      p.stageEnd = 1.00;
      return;
    }

    // 14. CHASSIS CORE: Anchored datum tube (0, 0, 0)
    p.worldOffset.set(0, 0, 0);
    p.stageStart = 0.0;
    p.stageEnd = 1.0;
  }

  smoothStep(t) {
    return t * t * (3 - 2 * t);
  }

  update(scrollProgress) {
    if (!this.parts.length) return;

    const s = Math.min(Math.max(scrollProgress, 0), 1);

    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];

      const start = p.stageStart;
      const end = p.stageEnd;
      const span = end - start;

      let localT = 0;
      if (s <= start) {
        localT = 0;
      } else if (s >= end) {
        localT = 1;
      } else {
        localT = span > 0 ? (s - start) / span : 1;
      }

      const factor = this.smoothStep(localT);

      // Transform world offset (dx, dy, dz) into parent rotated space (dx, dz, -dy)
      p.mesh.position.x = p.originalPos.x + p.worldOffset.x * factor;
      p.mesh.position.y = p.originalPos.y + p.worldOffset.z * factor;
      p.mesh.position.z = p.originalPos.z - p.worldOffset.y * factor;

      if (p.worldRotOffset.x !== 0 || p.worldRotOffset.y !== 0 || p.worldRotOffset.z !== 0) {
        p.mesh.rotation.x = p.originalRot.x + p.worldRotOffset.x * factor;
        p.mesh.rotation.y = p.originalRot.y + p.worldRotOffset.z * factor;
        p.mesh.rotation.z = p.originalRot.z - p.worldRotOffset.y * factor;
      }
    }
  }
}

window.ExplodeEngine = ExplodeEngine;
