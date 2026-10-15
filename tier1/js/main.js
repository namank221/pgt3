/**
 * GT3 Exploded-View // Phase 1 Main Three.js Scene Engine
 */

(function () {
  'use strict';

  // 1. Canvas & Engine Setup
  const canvas = document.getElementById('webgl-canvas');
  const hudFps = document.getElementById('hud-fps-val');
  const hudParts = document.getElementById('hud-parts-val');
  const loadingOverlay = document.getElementById('loading-overlay');

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  // Hero 3/4 Front View
  camera.position.set(4.6, 1.9, 5.2);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 2. Studio Lighting Rig
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(6, 10, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 25;
  keyLight.shadow.camera.left = -6;
  keyLight.shadow.camera.right = 6;
  keyLight.shadow.camera.top = 6;
  keyLight.shadow.camera.bottom = -6;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xeef2ff, 1.0);
  fillLight.position.set(-8, 5, -5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
  rimLight.position.set(0, 8, -8);
  scene.add(rimLight);

  // Soft Contact Shadow Plane under Car
  const shadowGeo = new THREE.PlaneGeometry(16, 16);
  const shadowMat = new THREE.ShadowMaterial({ opacity: 0.22 });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // 3. Scroll Controller
  const scrollController = new window.ScrollController();

  // 4. Model Loading & Auto-Centering
  let carModel = null;
  let explodeEngine = null;
  const carParts = [];
  const loader = new THREE.GLTFLoader();

  const MODEL_PATH = 'tier1/assets/gt3.glb';

  loader.load(
    MODEL_PATH,
    function (gltf) {
      carModel = gltf.scene;

      // Compute precise bounding box to center the car at (0, 0, 0)
      const bbox = new THREE.Box3().setFromObject(carModel);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());

      // Center car and ground its wheels on Y = 0
      carModel.position.x = -center.x;
      carModel.position.y = -bbox.min.y;
      carModel.position.z = -center.z;

      // Traverse meshes: enable shadows, count parts
      let meshCount = 0;
      carModel.traverse(function (child) {
        if (child.isMesh) {
          meshCount++;
          child.castShadow = true;
          child.receiveShadow = true;
          carParts.push(child);
        }
      });

      scene.add(carModel);

      // Phase 2: Initialize Explosion Engine with loaded parts
      if (window.ExplodeEngine) {
        explodeEngine = new window.ExplodeEngine(carModel);
      }

      // Point camera at center of car
      camera.lookAt(0, size.y * 0.4, 0);

      if (hudParts) {
        hudParts.textContent = meshCount + ' parts';
      }

      if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 400);
      }

      console.log(`[GT3 Scene] Model loaded successfully: ${meshCount} parts detected.`);
    },
    function (xhr) {
      if (xhr.lengthComputable && loadingOverlay) {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        const loadText = document.getElementById('loading-text');
        if (loadText) loadText.textContent = `LOADING ASSETS // ${percent}%`;
      }
    },
    function (error) {
      console.error('[GT3 Scene] Error loading GLB model:', error);
      const loadText = document.getElementById('loading-text');
      if (loadText) {
        loadText.textContent = 'ERROR LOADING MODEL (Check path)';
        loadText.style.color = '#ff3b30';
      }
    }
  );

  // 5. Phase 3: Camera Choreography Controller
  let cameraController = null;
  if (window.CameraPathController) {
    cameraController = new window.CameraPathController(camera);
  }

  // 6. Window Resize Handler
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', onWindowResize, false);

  // 7. FPS Counter & Render Loop
  let frameCount = 0;
  let lastTime = performance.now();
  let currentFps = 60;

  function animate(now) {
    requestAnimationFrame(animate);

    // FPS calculation
    frameCount++;
    if (now - lastTime >= 500) {
      currentFps = Math.round((frameCount * 1000) / (now - lastTime));
      if (hudFps) {
        hudFps.textContent = currentFps + ' FPS';
      }
      frameCount = 0;
      lastTime = now;
    }

    // Update scroll controller
    scrollController.update();
    const scroll = scrollController.getProgress();

    // Phase 2: Drive explosion physics
    if (explodeEngine) {
      explodeEngine.update(scroll);
    }

    // Phase 3: Drive camera choreography along keyframe spline
    if (cameraController) {
      cameraController.update(scroll);
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  // Expose to window for subsequent phases
  window.GT3_APP = {
    scene,
    camera,
    renderer,
    controls,
    scrollController,
    getCarModel: () => carModel,
    getCarParts: () => carParts
  };
})();
