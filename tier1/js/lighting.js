/**
 * GT3 Exploded-View // Low-Key Dark Studio Lighting & Ground Contact Shadow Engine (v=939)
 * - 92% Pitch-Black negative space in the environment map with only 3 razor-thin softbox ribbons
 * - Low-key directional lighting (cut by 75% vs v=927) so the car stays deep, moody, and physical
 * - Pure dark obsidian floor with 4-tire contact shadow AO (no bright white floor glow)
 */

class StudioLighting {
  static createGroundContactShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 1024, 1024);

    // 1. Deep Aerodynamic Underbody & Diffuser Occlusion Shadow
    const underbodyGrad = ctx.createRadialGradient(512, 512, 90, 512, 512, 390);
    underbodyGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.98)');
    underbodyGrad.addColorStop(0.50, 'rgba(0, 0, 0, 0.84)');
    underbodyGrad.addColorStop(0.80, 'rgba(0, 0, 0, 0.34)');
    underbodyGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = underbodyGrad;
    ctx.beginPath();
    ctx.ellipse(512, 512, 235, 415, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Four Dense Tire Contact Patches (Front 255/35 R20, Rear 315/30 R21)
    const tirePositions = [
      { x: 338, y: 256, rx: 46, ry: 92 },
      { x: 686, y: 256, rx: 46, ry: 92 },
      { x: 318, y: 744, rx: 60, ry: 108 },
      { x: 706, y: 744, rx: 60, ry: 108 },
    ];

    tirePositions.forEach((pos) => {
      const tireGrad = ctx.createRadialGradient(pos.x, pos.y, 8, pos.x, pos.y, pos.ry * 1.5);
      tireGrad.addColorStop(0.0, 'rgba(0, 0, 0, 1.0)');
      tireGrad.addColorStop(0.45, 'rgba(0, 0, 0, 0.95)');
      tireGrad.addColorStop(0.78, 'rgba(0, 0, 0, 0.38)');
      tireGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

      ctx.fillStyle = tireGrad;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, pos.rx * 1.45, pos.ry * 1.45, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  static setup(scene, renderer) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();

    // Fallback dark room with 3 thin specular strips (92% pitch black)
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x020304);

    const stripMat = new THREE.MeshBasicMaterial({ color: 0xd8e0ec, side: THREE.DoubleSide });

    // Thin overhead ribbon
    const topStrip = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.1), stripMat);
    topStrip.position.set(0, 9.2, 0);
    topStrip.rotation.x = Math.PI / 2;
    envScene.add(topStrip);

    // Thin left & right grazing ribbons
    const leftStrip = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.75), stripMat);
    leftStrip.position.set(8.8, 2.2, 0);
    leftStrip.rotation.y = -Math.PI / 2;
    envScene.add(leftStrip);

    const rightStrip = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.75), stripMat);
    rightStrip.position.set(-8.8, 2.2, 0);
    rightStrip.rotation.y = Math.PI / 2;
    envScene.add(rightStrip);

    const fallbackEnvMap = pmremGenerator.fromScene(envScene, 0.02).texture;
    scene.environment = fallbackEnvMap;

    // Load the new Low-Key Dark Studio HDRI (92% pitch-black room + 3 razor-thin strips, mean=0.109)
    if (THREE.RGBELoader) {
      const rgbeLoader = new THREE.RGBELoader();
      const applyHdr = (hdrTex) => {
        const hdrEnv = pmremGenerator.fromEquirectangular(hdrTex).texture;
        scene.environment = hdrEnv;
        hdrTex.dispose();
      };
      rgbeLoader.load(
        'tier1/assets/env/studio.hdr?v=939',
        applyHdr,
        undefined,
        () => {
          rgbeLoader.load('tier1/assets/studio.hdr?v=939', applyHdr, undefined, () => {});
        }
      );
    }

    // Low-Key Controlled Studio Lighting (No white wash!)
    const ambientLight = new THREE.AmbientLight(0xc8d2e2, 0.12);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf2f6ff, 0.78);
    keyLight.position.set(5.8, 10.5, 6.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 26;
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 5.5;
    keyLight.shadow.camera.bottom = -5.5;
    keyLight.shadow.bias = -0.00035;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb8c6dc, 0.24);
    fillLight.position.set(-8.2, 4.5, -6.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe4ecf8, 0.62);
    rimLight.position.set(0, 8.5, -9.2);
    scene.add(rimLight);

    const underLight = new THREE.DirectionalLight(0x9aa8bc, 0.18);
    underLight.position.set(0, -6.0, 1.5);
    scene.add(underLight);

    // Pure Dark Obsidian Studio Floor + 4-Tire Contact Shadow AO
    const floorGroup = new THREE.Group();

    const discGeo = new THREE.CircleGeometry(5.6, 128);
    const discMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.008, 0.009, 0.012),
      metalness: 0.75,
      roughness: 0.14,
      clearcoat: 0.85,
      clearcoatRoughness: 0.05,
      envMapIntensity: 0.45,
      transparent: true,
      opacity: 0.94
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.x = -Math.PI / 2;
    discMesh.position.y = -0.018;
    discMesh.receiveShadow = true;
    floorGroup.add(discMesh);

    const contactShadowTex = StudioLighting.createGroundContactShadowTexture();
    const contactShadowGeo = new THREE.PlaneGeometry(3.2, 5.2);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    const contactShadowMesh = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.set(0, 0.002, 0);
    floorGroup.add(contactShadowMesh);

    const shadowGeo = new THREE.PlaneGeometry(18, 18);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.54 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.001;
    shadowPlane.receiveShadow = true;
    floorGroup.add(shadowPlane);

    scene.add(floorGroup);

    window.studioShadowPlane = shadowPlane;
    window.studioContactShadow = contactShadowMesh;
    window.studioEnvironment = {
      floorGroup,
      discMesh,
      contactShadowMesh,
      keyLight,
      rimLight
    };
  }
}

window.StudioLighting = StudioLighting;
