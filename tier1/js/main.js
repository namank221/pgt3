/**
 * GT3 Exploded-View // Main Three.js Scene Engine
 * Direct per-frame execution:
 * - Slides car model down by 1.20m across the 400vh scroll runway
 * - Sequential deconstruction of 220 component meshes outward
 * - Orbits camera at locked 6.80m radius with realistic car scale
 */

(function () {
  'use strict';

  const canvas = document.getElementById('webgl-canvas');
  const hudFps = document.getElementById('hud-fps-val');
  const hudParts = document.getElementById('hud-parts-val');
  const loadingOverlay = document.getElementById('loading-overlay');

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  if (window.StudioLighting) {
    window.StudioLighting.setup(scene, renderer);
  }

  const scrollController = new window.ScrollController();
  const cameraController = window.CameraPathController ? new window.CameraPathController(camera) : null;
  const uiController = window.UIController ? new window.UIController() : null;

  let carModel = null;
  let explodeEngine = null;
  let baseCarY = 0;
  const carParts = [];
  const loader = new THREE.GLTFLoader();

  const MODEL_PATH = window.GT3_MODEL_PATH || 'tier1/assets/gt3.glb';

  loader.load(
    MODEL_PATH,
    function (gltf) {
      carModel = gltf.scene;
      scene.add(carModel);
      carModel.updateMatrixWorld(true);

      // Center car geometry around origin with tires grounded at Y = 0
      const bbox = new THREE.Box3().setFromObject(carModel);
      const center = bbox.getCenter(new THREE.Vector3());

      carModel.position.x = -center.x;
      carModel.position.y = -bbox.min.y;
      carModel.position.z = -center.z;
      baseCarY = carModel.position.y;
      carModel.updateMatrixWorld(true);

      if (window.MaterialEnhancer) {
        window.MaterialEnhancer.apply(carModel);
      }

      if (window.ExplodeEngine) {
        explodeEngine = new window.ExplodeEngine(carModel);
      }

      let meshCount = 0;
      carModel.traverse(function (child) {
        if (child.isMesh && child.visible) {
          meshCount++;
          carParts.push(child);
        }
      });

      if (hudParts) {
        hudParts.textContent = meshCount;
      }

      const initialScroll = scrollController.getProgress();
      if (carModel) carModel.position.y = baseCarY - (initialScroll * 1.20);
      if (explodeEngine) explodeEngine.update(initialScroll);
      if (cameraController) cameraController.update(initialScroll);
      if (uiController) uiController.update(initialScroll);

      if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 400);
      }

      console.log(`[GT3 Scene] Ready: ${meshCount} active meshes.`);
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

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
  }
  window.addEventListener('resize', onWindowResize, false);

  let frameCount = 0;
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    frameCount++;
    if (now - lastTime >= 500) {
      const currentFps = Math.round((frameCount * 1000) / (now - lastTime));
      if (hudFps) hudFps.textContent = currentFps;
      frameCount = 0;
      lastTime = now;
    }

    scrollController.update();
    const scroll = scrollController.getProgress();

    // 1. CAR DOWNWARD SLIDE:
    // Drop by 1.20m across the 400vh runway
    if (carModel) {
      carModel.position.y = baseCarY - (scroll * 1.20);
    }

    // 2. EXPLODED-VIEW ENGINE:
    // Sequential deconstruction across the 4 stages
    if (explodeEngine) {
      explodeEngine.update(scroll);
    }

    // 3. SHADOW FLOOR:
    if (window.studioShadowPlane && carModel) {
      window.studioShadowPlane.position.y = carModel.position.y - 0.01;
      window.studioShadowPlane.material.opacity = Math.max(0, 0.22 * (1 - scroll * 1.2));
    }

    // 4. CAMERA CHOREOGRAPHY:
    // Constant radius 6.80m, realistic scale, zero foreshortening
    if (cameraController) {
      cameraController.update(scroll);
    }

    // 5. CALLOUT CARDS UI:
    if (uiController) {
      uiController.update(scroll);
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  window.GT3_APP = {
    scene,
    camera,
    renderer,
    scrollController,
    getCarModel: () => carModel,
    getCarParts: () => carParts
  };
})();
