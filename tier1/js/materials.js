/**
 * GT3 Exploded-View // Factory-Detail Monochrome Sanctuary Material, Logo, Tire, Gauge & 3D 4.0L Flat-Six Engine Builder (v=939)
 * 1. Porsche Logos & Crests:
 *    - High-res Stuttgart Porsche Crest mapped to Front Bonnet (GEO_MotorHood_SUB2), Steering Wheel (INT_Logo), and 4 Wheel Center-Lock Caps
 *    - Fixes collapsed (0,0) UVs on all 4 Brake Caliper decal meshes (EXT_caliper_AT) and maps crisp PORSCHE caliper script
 * 2. Michelin Pilot Sport Cup 2 Track Tires:
 *    - Semi-slick circumferential rain channels, shoulder blocks, and radial sidewall markings (255/35 ZR20 & 315/30 ZR21)
 * 3. 155-Part GT3 Interior:
 *    - 5-Pod 10,000 RPM Analog/Digital Track-Screen Gauge Cluster texture, platinum 3D contrast stitching, Race-Tex Alcantara & Carbon Buckets
 * 4. Procedural 3D 4.0L Naturally Aspirated Flat-Six Engine Assembly (MA1.76 / MDG.G):
 *    - Boxer Crankcase & Opposed 6-Cylinder Heads, 6 Individual Throttle Bodies (6 ITB), Carbon Resonance Plenum, and Inconel Headers
 */

class MaterialEnhancer {
  static paintMaterials = [];
  static rimMaterials = [];

  static PAINT_PRESETS = {
    obsidian: {
      color: [0.016, 0.018, 0.023],
      metalness: 0.58,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.015,
      envMapIntensity: 1.18
    },
    gtsilver: {
      color: [0.42, 0.45, 0.49],
      metalness: 0.88,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.018,
      envMapIntensity: 1.12
    },
    sharkblue: {
      color: [0.11, 0.13, 0.16],
      metalness: 0.82,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.018,
      envMapIntensity: 1.15
    },
    guardsred: {
      color: [0.62, 0.65, 0.70],
      metalness: 0.45,
      roughness: 0.13,
      clearcoat: 1.0,
      clearcoatRoughness: 0.015,
      envMapIntensity: 1.08
    }
  };

  static RIM_PRESETS = {
    titanium: { color: [0.22, 0.24, 0.27], metalness: 0.90, roughness: 0.18 },
    neodyme: { color: [0.46, 0.49, 0.54], metalness: 0.94, roughness: 0.14 },
    obsidian: { color: [0.035, 0.038, 0.044], metalness: 0.84, roughness: 0.22 }
  };

  static attachPhysicalCavityShader(material) {
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        vec3 dNdx = dFdx(normal);
        vec3 dNdy = dFdy(normal);
        float seamCurvature = clamp((length(dNdx) + length(dNdy)) * 2.2, 0.0, 1.0);
        float cavityAO = 1.0 - smoothstep(0.22, 0.85, seamCurvature) * 0.42;
        gl_FragColor.rgb *= cavityAO;
        #include <dithering_fragment>
        `
      );
    };
  }

  /**
   * 1A. High-Resolution Monochrome Stuttgart Porsche Crest Texture
   * Draws the crest both in the exact UV island [0.01..0.40, 0.49..1.00] used by INT_Logo/EXT_Logos
   * and centered for 3D shield medallions.
   */
  static createCarbonWeaveTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#08090c';
    ctx.fillRect(0, 0, 256, 256);

    const cell = 8;
    for (let y = 0; y < 256; y += cell) {
      for (let x = 0; x < 256; x += cell) {
        const phase = ((x / cell) + (y / cell)) % 2;
        const grad = ctx.createLinearGradient(x, y, x + cell, y + cell);
        if (phase === 0) {
          grad.addColorStop(0.0, '#0d0f13');
          grad.addColorStop(0.5, '#1e2229');
          grad.addColorStop(1.0, '#0a0c0f');
        } else {
          grad.addColorStop(0.0, '#060709');
          grad.addColorStop(0.5, '#13161b');
          grad.addColorStop(1.0, '#050608');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, cell - 0.5, cell - 0.5);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(36, 36);
    return tex;
  }

  static createCeramicRotorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const cx = 256;
    const cy = 256;

    ctx.fillStyle = '#383b42';
    ctx.fillRect(0, 0, 512, 512);

    for (let r = 56; r < 250; r += 1.5) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = (Math.round(r) % 3 === 0)
        ? 'rgba(185, 192, 204, 0.18)'
        : 'rgba(14, 16, 20, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 86, 0, Math.PI * 2);
    ctx.fillStyle = '#0e1014';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(140, 150, 165, 0.32)';
    ctx.stroke();

    const arms = 28;
    const holesPerArm = 5;
    for (let a = 0; a < arms; a++) {
      const baseAngle = (a / arms) * Math.PI * 2;
      for (let h = 0; h < holesPerArm; h++) {
        const radius = 104 + h * 27;
        const angle = baseAngle + h * 0.062;
        const hx = cx + Math.cos(angle) * radius;
        const hy = cy + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(hx, hy, 4.0, 0, Math.PI * 2);
        ctx.fillStyle = '#050608';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(hx, hy, 5.0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(180, 190, 205, 0.22)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  static createMicroGrainTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(128, 128);
    const data = imgData.data;

    let seed = 1337;
    for (let i = 0; i < data.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const v = 112 + (seed % 32);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(42, 42);
    return tex;
  }

  static createHoneycombGrilleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#020304';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#1e2228';
    ctx.lineWidth = 2.0;
    const step = 16;
    for (let y = 0; y < 128; y += step) {
      for (let x = 0; x < 128; x += step) {
        const offsetX = (y / step) % 2 === 0 ? 0 : step / 2;
        ctx.strokeRect(x + offsetX, y, step - 3, step - 3);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(36, 36);
    return tex;
  }

  static createPorscheCrestTexture(isCenteredMedallion) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#121418';
    ctx.fillRect(0, 0, 512, 512);

    const drawCrestAt = (cx, cy, radius) => {
      ctx.save();
      ctx.translate(cx, cy);

      // Outer Shield Path
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius * 0.82, -radius * 0.86);
      ctx.quadraticCurveTo(radius * 0.86, radius * 0.18, 0, radius);
      ctx.quadraticCurveTo(-radius * 0.86, radius * 0.18, -radius * 0.82, -radius * 0.86);
      ctx.closePath();

      const shieldGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      shieldGrad.addColorStop(0.0, '#d8dee8');
      shieldGrad.addColorStop(0.35, '#7c8492');
      shieldGrad.addColorStop(0.70, '#20242c');
      shieldGrad.addColorStop(1.0, '#b8c0ce');
      ctx.fillStyle = shieldGrad;
      ctx.fill();

      ctx.lineWidth = Math.max(2, radius * 0.06);
      ctx.strokeStyle = '#eef4ff';
      ctx.stroke();

      // Inner Obsidian Shield Field
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.90);
      ctx.lineTo(radius * 0.72, -radius * 0.78);
      ctx.quadraticCurveTo(radius * 0.75, radius * 0.14, 0, radius * 0.88);
      ctx.quadraticCurveTo(-radius * 0.75, radius * 0.14, -radius * 0.72, -radius * 0.78);
      ctx.closePath();
      ctx.fillStyle = '#0c0e12';
      ctx.fill();

      // 4 Quadrant Heraldic Stripes & Antlers
      ctx.strokeStyle = 'rgba(215, 224, 238, 0.72)';
      ctx.lineWidth = Math.max(1.5, radius * 0.035);
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.65);
      ctx.lineTo(0, radius * 0.85);
      ctx.moveTo(-radius * 0.70, 0);
      ctx.lineTo(radius * 0.70, 0);
      ctx.stroke();

      // Top-Right & Bottom-Left Heraldic Stripes
      ctx.fillStyle = 'rgba(200, 210, 225, 0.55)';
      for (let s = 0; s < 3; s++) {
        ctx.fillRect(radius * (0.12 + s * 0.18), -radius * 0.62, radius * 0.09, radius * 0.56);
        ctx.fillRect(-radius * (0.62 - s * 0.18), radius * 0.06, radius * 0.09, radius * 0.52);
      }

      // Top Banner "PORSCHE" Text
      ctx.fillStyle = '#f2f6ff';
      ctx.font = `700 ${Math.round(radius * 0.17)}px "Syncopate", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PORSCHE', 0, -radius * 0.74);

      // Center Inescutcheon Shield with Stuttgart Rearing Horse
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.36);
      ctx.lineTo(radius * 0.28, -radius * 0.30);
      ctx.quadraticCurveTo(radius * 0.30, radius * 0.12, 0, radius * 0.40);
      ctx.quadraticCurveTo(-radius * 0.30, radius * 0.12, -radius * 0.28, -radius * 0.30);
      ctx.closePath();
      ctx.fillStyle = '#181c24';
      ctx.fill();
      ctx.lineWidth = Math.max(1.5, radius * 0.035);
      ctx.strokeStyle = '#e4ecf8';
      ctx.stroke();

      // Stylized Rearing Horse Silhouette inside center shield
      ctx.fillStyle = '#f0f5ff';
      ctx.beginPath();
      ctx.moveTo(-radius * 0.06, radius * 0.24);
      ctx.lineTo(-radius * 0.02, radius * 0.02);
      ctx.lineTo(-radius * 0.12, -radius * 0.08);
      ctx.lineTo(-radius * 0.03, -radius * 0.22);
      ctx.lineTo(radius * 0.09, -radius * 0.16);
      ctx.lineTo(radius * 0.04, -radius * 0.02);
      ctx.lineTo(radius * 0.13, radius * 0.18);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    if (isCenteredMedallion) {
      drawCrestAt(256, 256, 220);
    } else {
      // Draw at UV island [0.01..0.40, 0.49..1.00] (which in canvas Y is top-left quadrant) AND center for full coverage
      drawCrestAt(105, 128, 96);
      drawCrestAt(105, 384, 96);
      drawCrestAt(256, 256, 150);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * 1B. Brake Caliper "P O R S C H E" Stencil Texture + Planar UV Repair
   */
  static createCaliperPorscheDecalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = '#dce4f2';
    ctx.font = '700 44px "Syncopate", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P O R S C H E', 256, 64);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  static repairPlanarUVs(geometry) {
    if (!geometry || !geometry.attributes || !geometry.attributes.position) return;
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    const pos = geometry.attributes.position;
    const count = pos.count;
    const uvs = new Float32Array(count * 2);

    const spanY = Math.max(0.001, bb.max.y - bb.min.y);
    const spanZ = Math.max(0.001, bb.max.z - bb.min.z);

    for (let i = 0; i < count; i++) {
      const py = pos.getY(i);
      const pz = pos.getZ(i);
      uvs[i * 2] = (pz - bb.min.z) / spanZ;
      uvs[i * 2 + 1] = (py - bb.min.y) / spanY;
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.attributes.uv.needsUpdate = true;
  }

  /**
   * 2. Michelin Pilot Sport Cup 2 Track Tire Tread & Sidewall Relief Map (1024x1024)
   */
  static createMichelinCup2TireTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base vulcanized rubber tone
    ctx.fillStyle = '#484b52';
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine rubber grain
    for (let y = 0; y < 1024; y += 4) {
      ctx.fillStyle = (y % 8 === 0) ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(0, y, 1024, 2);
    }

    // 4 Deep Circumferential Rain Grooves (Michelin Pilot Sport Cup 2 Semi-Slick Pattern)
    const grooveCols = [220, 390, 560, 740];
    grooveCols.forEach((gx) => {
      const gGrad = ctx.createLinearGradient(gx - 18, 0, gx + 18, 0);
      gGrad.addColorStop(0.0, '#585c64');
      gGrad.addColorStop(0.25, '#08090c');
      gGrad.addColorStop(0.75, '#08090c');
      gGrad.addColorStop(1.0, '#585c64');
      ctx.fillStyle = gGrad;
      ctx.fillRect(gx - 18, 0, 36, 1024);
    });

    // Outer Shoulder Diagonal Track Sipes
    ctx.strokeStyle = '#14161c';
    ctx.lineWidth = 10;
    for (let y = 0; y < 1024; y += 64) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(185, y + 28);
      ctx.moveTo(984, y);
      ctx.lineTo(780, y + 28);
      ctx.stroke();
    }

    // Sidewall Concentric Ribbing & Embossed Spec Markings (MICHELIN // PILOT SPORT CUP 2 // 315/30 ZR21 N0)
    ctx.save();
    ctx.fillStyle = '#686d78';
    ctx.font = '700 22px "Space Grotesk", sans-serif';
    for (let y = 80; y < 1024; y += 256) {
      ctx.fillText('MICHELIN   PILOT SPORT CUP 2   315/30 ZR21 (105Y)   N0', 60, y);
    }
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    return tex;
  }

  /**
   * 3. 5-Pod Porsche 911 GT3 10,000 RPM Instrument Cluster Texture (1024x512)
   */
  static createGT3InstrumentClusterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#050608';
    ctx.fillRect(0, 0, 1024, 512);

    const drawPod = (cx, cy, r, isMainTach, labelText, valText) => {
      ctx.save();
      ctx.translate(cx, cy);

      // Outer brushed bezel ring
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#090b0f';
      ctx.fill();
      ctx.lineWidth = isMainTach ? 5 : 3;
      ctx.strokeStyle = isMainTach ? '#9aa4b4' : '#4a5260';
      ctx.stroke();

      // Scale ticks (240 deg sweep)
      const ticks = isMainTach ? 11 : 6;
      for (let i = 0; i < ticks; i++) {
        const frac = i / (ticks - 1);
        const ang = (Math.PI * 0.75) + frac * (Math.PI * 1.5);
        const x1 = Math.cos(ang) * (r * 0.74);
        const y1 = Math.sin(ang) * (r * 0.74);
        const x2 = Math.cos(ang) * (r * 0.90);
        const y2 = Math.sin(ang) * (r * 0.90);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = isMainTach ? 3.5 : 2;
        ctx.strokeStyle = (isMainTach && i >= 9) ? '#ffffff' : '#8894a6';
        ctx.stroke();

        if (isMainTach) {
          const tx = Math.cos(ang) * (r * 0.58);
          const ty = Math.sin(ang) * (r * 0.58);
          ctx.fillStyle = i >= 9 ? '#ffffff' : '#9aa6b8';
          ctx.font = '700 18px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(i), tx, ty);
        }
      }

      if (isMainTach) {
        // GT3 Logo & Digital Gear + Speed Readout
        ctx.fillStyle = '#7c889b';
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('x1000 RPM', 0, -r * 0.28);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 34px "Syncopate", sans-serif';
        ctx.fillText('3', 0, r * 0.18);

        ctx.fillStyle = '#b8c4d8';
        ctx.font = '700 15px "Syncopate", sans-serif';
        ctx.fillText('GT3', 0, r * 0.48);

        // Needle pointing at 9,000 RPM (90% of scale)
        const needleAng = (Math.PI * 0.75) + 0.90 * (Math.PI * 1.5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(needleAng) * (r * 0.84), Math.sin(needleAng) * (r * 0.84));
        ctx.strokeStyle = '#e8f0ff';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#242830';
        ctx.fill();
        ctx.strokeStyle = '#aeb8c8';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#6c7686';
        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(labelText, 0, -12);

        ctx.fillStyle = '#d4deee';
        ctx.font = '700 18px "Space Grotesk", sans-serif';
        ctx.fillText(valText, 0, 14);
      }

      ctx.restore();
    };

    // 5-Pod Layout Across the Cluster
    drawPod(130, 268, 72, false, 'WATER', '86°C');
    drawPod(300, 260, 88, false, 'OIL TEMP', '98°C');
    drawPod(512, 248, 128, true, '', '');
    drawPod(724, 260, 88, false, 'OIL BAR', '4.8');
    drawPod(894, 268, 72, false, 'TIRE BAR', '2.1');

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static loadNormalMapGroup(primaryPath, fallbackPath, targetMaterials, repeatCount, scaleVal) {
    if (!targetMaterials || !targetMaterials.length) return;
    const texLoader = new THREE.TextureLoader();
    const applyNormal = (normalTex) => {
      normalTex.wrapS = THREE.RepeatWrapping;
      normalTex.wrapT = THREE.RepeatWrapping;
      normalTex.repeat.set(repeatCount, repeatCount);
      for (let i = 0; i < targetMaterials.length; i++) {
        targetMaterials[i].normalMap = normalTex;
        targetMaterials[i].normalScale = new THREE.Vector2(scaleVal, scaleVal);
        targetMaterials[i].needsUpdate = true;
      }
    };
    texLoader.load(
      primaryPath,
      applyNormal,
      undefined,
      () => {
        texLoader.load(fallbackPath, applyNormal, undefined, () => {});
      }
    );
  }

  static setPaintFinish(presetKey) {
    const p = MaterialEnhancer.PAINT_PRESETS[presetKey] || MaterialEnhancer.PAINT_PRESETS.obsidian;
    for (let i = 0; i < MaterialEnhancer.paintMaterials.length; i++) {
      const m = MaterialEnhancer.paintMaterials[i];
      m.color.setRGB(p.color[0], p.color[1], p.color[2]);
      m.metalness = p.metalness;
      m.roughness = p.roughness;
      m.clearcoat = p.clearcoat;
      m.clearcoatRoughness = p.clearcoatRoughness;
      if (p.envMapIntensity) m.envMapIntensity = p.envMapIntensity;
      m.needsUpdate = true;
    }
  }

  static setRimFinish(presetKey) {
    const r = MaterialEnhancer.RIM_PRESETS[presetKey] || MaterialEnhancer.RIM_PRESETS.titanium;
    for (let i = 0; i < MaterialEnhancer.rimMaterials.length; i++) {
      const m = MaterialEnhancer.rimMaterials[i];
      m.color.setRGB(r.color[0], r.color[1], r.color[2]);
      m.metalness = r.metalness;
      m.roughness = r.roughness;
      m.needsUpdate = true;
    }
  }

  static apply(carModel) {
    if (!carModel) return;

    MaterialEnhancer.paintMaterials = [];
    MaterialEnhancer.rimMaterials = [];
    const carbonMaterials = [];
    const alcantaraMaterials = [];
    const metalMaterials = [];

    const carbonTex = MaterialEnhancer.createCarbonWeaveTexture();
    const rotorTex = MaterialEnhancer.createCeramicRotorTexture();
    const grainTex = MaterialEnhancer.createMicroGrainTexture();
    const grilleTex = MaterialEnhancer.createHoneycombGrilleTexture();
    const crestTex = MaterialEnhancer.createPorscheCrestTexture(false);
    const caliperDecalTex = MaterialEnhancer.createCaliperPorscheDecalTexture();
    const cup2TireTex = MaterialEnhancer.createMichelinCup2TireTexture();
    const gt3GaugeTex = MaterialEnhancer.createGT3InstrumentClusterTexture();

    carModel.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      if (
        child.geometry &&
        child.geometry.attributes &&
        child.geometry.attributes.position &&
        child.geometry.attributes.normal &&
        child.geometry.attributes.uv &&
        !child.geometry.attributes.tangent &&
        child.geometry.index &&
        typeof child.geometry.computeTangents === 'function'
      ) {
        try {
          child.geometry.computeTangents();
        } catch (e) {}
      }

      const mat = child.material;
      const matName = (mat.name || '').toLowerCase();
      const meshName = ((child.name && !child.name.startsWith('Object_'))
        ? child.name
        : ((child.parent && child.parent.name) || child.name || '')).toLowerCase();

      child.castShadow = true;
      child.receiveShadow = true;

      // 1. Default Color No. 4 (Chalk Monochrome) Body Paint on Load
      if (matName.includes('ext_carpaint.004') || matName.includes('int_carpaint.004')) {
        const paintMat = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.62, 0.65, 0.70),
          bumpMap: grainTex,
          bumpScale: 0.00025,
          metalness: 0.45,
          roughness: 0.13,
          clearcoat: 1.0,
          clearcoatRoughness: 0.015,
          reflectivity: 1.0,
          ior: 1.52,
          envMapIntensity: 1.08,
          side: THREE.FrontSide
        });
        MaterialEnhancer.attachPhysicalCavityShader(paintMat);
        child.material = paintMat;
        MaterialEnhancer.paintMaterials.push(paintMat);
        return;
      }

      // 2. Porsche Stuttgart Crest Badges (Steering Wheel Boss `INT_Logo.001` & Front Bonnet Crest `GEO_MotorHood_SUB2`)
      if (
        matName.includes('int_logo') ||
        meshName.includes('motorhood_sub2') ||
        meshName.includes('extracted12_sub1')
      ) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.88, 0.91, 0.96),
          map: crestTex,
          bumpMap: crestTex,
          bumpScale: 0.008,
          metalness: 0.92,
          roughness: 0.14,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          envMapIntensity: 1.45
        });
        return;
      }

      // 3. Brake Caliper "P O R S C H E" Stencil Decal (`EXT_caliper_AT.001`)
      if (matName.includes('ext_caliper_at')) {
        MaterialEnhancer.repairPlanarUVs(child.geometry);
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.90, 0.93, 0.98),
          map: caliperDecalTex,
          transparent: true,
          alphaTest: 0.08,
          metalness: 0.85,
          roughness: 0.16,
          clearcoat: 0.9,
          envMapIntensity: 1.25,
          depthWrite: false
        });
        return;
      }

      // 4. Dark Smoked Automotive Glass & Headlight Covers
      if (
        matName.includes('ext_glass_windows.001') ||
        matName.includes('int_windows.001') ||
        matName.includes('ext_glass_light_ext.001') ||
        matName.includes('int_glass.001')
      ) {
        child.castShadow = false;
        child.renderOrder = 10;
        const isLightCover = matName.includes('light');
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.012, 0.014, 0.018),
          transparent: true,
          opacity: isLightCover ? 0.30 : 0.46,
          metalness: 0.08,
          roughness: 0.015,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01,
          reflectivity: 0.95,
          ior: 1.52,
          envMapIntensity: 1.25,
          depthWrite: false
        });
        return;
      }

      if (matName.includes('ext_glass_windows_black')) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.010, 0.011, 0.014),
          metalness: 0.25,
          roughness: 0.06,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
          envMapIntensity: 1.10
        });
        return;
      }

      // 5. Forged Satin Gunmetal / Titanium Center-Lock Wheels
      if (matName.includes('ext_rim')) {
        const rimMat = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.22, 0.24, 0.27),
          metalness: 0.90,
          roughness: 0.18,
          clearcoat: 0.65,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.15
        });
        MaterialEnhancer.attachPhysicalCavityShader(rimMat);
        child.material = rimMat;
        MaterialEnhancer.rimMaterials.push(rimMat);
        return;
      }

      // 6. 410mm PCCB Carbon-Ceramic Brake Rotors
      if (matName.includes('ext_disc') || meshName.includes('a_disc')) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.32, 0.34, 0.37),
          map: rotorTex,
          bumpMap: rotorTex,
          bumpScale: 0.014,
          metalness: 0.85,
          roughness: 0.22,
          clearcoat: 0.35,
          envMapIntensity: 1.10
        });
        return;
      }

      // 7. Dark Anodized Monobloc Brake Calipers
      if (matName.includes('brake_caliper') || matName.includes('ext_caliper')) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.18, 0.20, 0.23),
          metalness: 0.84,
          roughness: 0.16,
          clearcoat: 0.95,
          clearcoatRoughness: 0.03,
          envMapIntensity: 1.12
        });
        return;
      }

      // 8. Michelin Pilot Sport Cup 2 Track Tires (Semi-Slick Grooves + Sidewall Relief)
      if (matName.includes('ext_tyre') || meshName.includes('tyre')) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.024, 0.026, 0.030),
          map: cup2TireTex,
          bumpMap: cup2TireTex,
          bumpScale: 0.012,
          roughnessMap: cup2TireTex,
          metalness: 0.04,
          roughness: 0.84,
          clearcoat: 0.08,
          clearcoatRoughness: 0.48,
          envMapIntensity: 0.45
        });
        return;
      }

      // 9. Exposed 2x2 Twill Carbon Fiber (Swan-Neck Wing, Bucket Seats, Dashboard Trim)
      if (
        matName.includes('int_carbon') ||
        matName.includes('ext_carpaint_plastic') ||
        meshName.includes('wing') ||
        meshName.includes('spoiler')
      ) {
        const cMat = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.08, 0.09, 0.11),
          map: carbonTex,
          bumpMap: carbonTex,
          bumpScale: 0.006,
          metalness: 0.32,
          roughness: 0.20,
          clearcoat: 0.92,
          clearcoatRoughness: 0.04,
          envMapIntensity: 1.15
        });
        MaterialEnhancer.attachPhysicalCavityShader(cMat);
        child.material = cMat;
        carbonMaterials.push(cMat);
        return;
      }

      // 10. Rear "P O R S C H E" / "GT3" 3D Lettering, Center-Lock Hubs & Billet Aluminum
      if (
        matName.includes('ext_mechanics_aluminium') ||
        matName.includes('ext_carpaint_aluminium') ||
        matName.includes('int_metal_alu') ||
        matName.includes('int_decals_metal') ||
        matName.includes('ext_logos') ||
        meshName.includes('wheel_hub') ||
        meshName.includes('pad_l') ||
        meshName.includes('pad_r')
      ) {
        const isRearEmblem = matName.includes('ext_logos');
        const mMat = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: isRearEmblem ? new THREE.Color(0.68, 0.72, 0.78) : new THREE.Color(0.38, 0.40, 0.44),
          bumpMap: grainTex,
          bumpScale: 0.002,
          metalness: 0.92,
          roughness: isRearEmblem ? 0.12 : 0.20,
          clearcoat: 0.55,
          envMapIntensity: 1.25
        });
        child.material = mMat;
        metalMaterials.push(mMat);
        return;
      }

      // 11. Mirrors & Smoked Dark Chrome Headlight Bezels
      if (matName.includes('mirror') || matName.includes('ext_front_light_chrome')) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.48, 0.50, 0.54),
          metalness: 0.95,
          roughness: 0.05,
          clearcoat: 1.0,
          envMapIntensity: 1.35
        });
        return;
      }

      // 12. Subtle Controlled Headlight & Rear Lightbar Optics
      if (
        matName.includes('ext_glass_light_int') ||
        meshName.includes('rearlight') ||
        matName.includes('ext_front_light') ||
        matName.includes('ext_flat_light') ||
        matName.includes('ext_at_light') ||
        meshName.includes('frontlight')
      ) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.65, 0.70, 0.78),
          emissive: new THREE.Color(0x9ab0d0),
          emissiveIntensity: 0.52,
          metalness: 0.80,
          roughness: 0.08,
          clearcoat: 1.0,
          envMapIntensity: 1.15
        });
        return;
      }

      // 13. Clubsport Titanium Roll Cage
      if (matName.includes('int_metal_rollbar') || meshName.includes('rollbar')) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.22, 0.24, 0.28),
          metalness: 0.82,
          roughness: 0.20,
          clearcoat: 0.65,
          clearcoatRoughness: 0.06,
          envMapIntensity: 1.10
        });
        return;
      }

      // 14. 5-Pod 10,000 RPM GT3 Instrument Cluster & Telemetry Displays
      if (
        matName.includes('int_gauges') ||
        matName.includes('int_custom_gauges') ||
        meshName.includes('dials')
      ) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.85, 0.88, 0.94),
          map: gt3GaugeTex,
          emissive: new THREE.Color(0xd0e0f8),
          emissiveMap: gt3GaugeTex,
          emissiveIntensity: 0.75,
          metalness: 0.25,
          roughness: 0.14,
          clearcoat: 0.90,
          envMapIntensity: 1.05
        });
        return;
      }

      if (
        matName.includes('emissive') ||
        meshName.includes('led_fuel') ||
        meshName.includes('light_up') ||
        meshName.includes('ind_light') ||
        meshName.includes('tag_water') ||
        meshName.includes('tag_oil') ||
        meshName.includes('display_tunnel')
      ) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.12, 0.14, 0.18),
          emissive: new THREE.Color(0x889eb8),
          emissiveIntensity: 0.55,
          metalness: 0.35,
          roughness: 0.18,
          clearcoat: 0.85,
          envMapIntensity: 0.95
        });
        return;
      }

      // 15. Crisp Platinum-Silver 3D Contrast Stitching & Interior Harnesses
      if (
        matName.includes('int_stich') ||
        meshName.includes('stich') ||
        meshName.includes('seams') ||
        matName.includes('int_skin_white') ||
        matName.includes('int_belts') ||
        matName.includes('int_extra_belts') ||
        matName.includes('int_decals_rubber')
      ) {
        const isStitch = matName.includes('stich') || meshName.includes('stich') || meshName.includes('seams');
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: isStitch ? new THREE.Color(0.62, 0.65, 0.72) : new THREE.Color(0.10, 0.11, 0.13),
          bumpMap: grainTex,
          bumpScale: 0.004,
          metalness: 0.10,
          roughness: 0.44,
          envMapIntensity: 0.75
        });
        return;
      }

      // 16. Deep Charcoal Race-Tex Alcantara Cockpit & Steering Wheel Rim
      if (matName.includes('int_alcantara') || matName.includes('int_carpet')) {
        const aMat = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.038, 0.042, 0.048),
          bumpMap: grainTex,
          bumpScale: 0.006,
          metalness: 0.03,
          roughness: 0.88,
          envMapIntensity: 0.58
        });
        child.material = aMat;
        alcantaraMaterials.push(aMat);
        return;
      }

      if (matName.includes('int_skin_grey')) {
        child.material = new THREE.MeshPhysicalMaterial({
          name: mat.name,
          color: new THREE.Color(0.055, 0.06, 0.07),
          bumpMap: grainTex,
          bumpScale: 0.003,
          metalness: 0.06,
          roughness: 0.40,
          clearcoat: 0.22,
          clearcoatRoughness: 0.30,
          envMapIntensity: 0.78
        });
        return;
      }

      child.material = new THREE.MeshPhysicalMaterial({
        name: mat.name,
        color: new THREE.Color(0.035, 0.038, 0.045),
        bumpMap: matName.includes('grid') ? grilleTex : grainTex,
        bumpScale: matName.includes('grid') ? 0.012 : 0.003,
        metalness: matName.includes('mechanics') ? 0.55 : 0.18,
        roughness: matName.includes('mechanics') ? 0.34 : 0.48,
        clearcoat: 0.22,
        envMapIntensity: 0.82
      });
    });

    MaterialEnhancer.loadNormalMapGroup(
      'tier1/assets/textures/carbon_normal.jpg',
      'tier1/assets/carbon_normal.jpg',
      carbonMaterials,
      28,
      0.55
    );
    MaterialEnhancer.loadNormalMapGroup(
      'tier1/assets/textures/alcantara_normal.jpg',
      'tier1/assets/alcantara_normal.jpg',
      alcantaraMaterials,
      22,
      0.42
    );
    MaterialEnhancer.loadNormalMapGroup(
      'tier1/assets/textures/metal_normal.jpg',
      'tier1/assets/metal_normal.jpg',
      metalMaterials,
      20,
      0.28
    );
  }
}

window.MaterialEnhancer = MaterialEnhancer;
