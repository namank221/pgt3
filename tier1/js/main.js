/**
 * GT3 Exploded-View // Main Three.js Obsidian Showroom & Page 1 -> Page 2 -> Page 3 Engine (v=914)
 */

(function () {
  'use strict';

  window.isShowroomReady = true;
  const canvas = document.getElementById('webgl-canvas');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingBarFill = document.getElementById('loading-bar-fill');
  const autoTourBtn = document.getElementById('autotour-btn');
  const revAudioBtn = document.getElementById('rev-audio-btn');

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.90;
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

  // 1. Live 3D Paint & Wheel Finish Switcher Wiring
  const paintButtons = document.querySelectorAll('#paint-swatches .swatch-btn');
  paintButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      paintButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (window.MaterialEnhancer) {
        window.MaterialEnhancer.setPaintFinish(btn.getAttribute('data-paint'));
      }
    });
  });

  const rimButtons = document.querySelectorAll('#rim-swatches .swatch-btn');
  rimButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      rimButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (window.MaterialEnhancer) {
        window.MaterialEnhancer.setRimFinish(btn.getAttribute('data-rim'));
      }
    });
  });

  // 2. Auto-Tour Deconstruction & Collapse Playback
  let isAutoTour = false;
  let autoTourDir = 1;

  if (autoTourBtn) {
    autoTourBtn.addEventListener('click', () => {
      isAutoTour = !isAutoTour;
      autoTourBtn.classList.toggle('is-playing', isAutoTour);
      autoTourBtn.textContent = isAutoTour ? 'PAUSE' : 'AUTO-TOUR';
    });
    window.addEventListener('wheel', () => {
      if (isAutoTour) {
        isAutoTour = false;
        autoTourBtn.classList.remove('is-playing');
        autoTourBtn.textContent = 'AUTO-TOUR';
      }
    }, { passive: true });
  }

  // 3. Real Porsche 911 GT3 Acoustic Engine:
  //    - #page3-rev-btn ("Masters of the Air" Motion Porsche Card) -> Car In Motion 9,000 RPM Roar (gt3_rev.mp3)
  //    - #page3-idle-btn (Stuttgart Prancing Horse & Twin Arches Card) -> Car Starting / Mechanical Pulse (gt3_idle.mp3)
  let isRevving = false;
  let activeAudio = null;
  let activeMode = null;

  const page3RevBtn = document.getElementById('page3-rev-btn');
  const page3IdleBtn = document.getElementById('page3-idle-btn');

  function clearAudioUI() {
    isRevving = false;
    activeMode = null;
    if (revAudioBtn) revAudioBtn.classList.remove('is-active');
    if (page3RevBtn) page3RevBtn.classList.remove('is-playing');
    if (page3IdleBtn) page3IdleBtn.classList.remove('is-playing');
  }

  function playEngineAudio(mode) {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      const prevMode = activeMode;
      activeAudio = null;
      clearAudioUI();
      if (prevMode === mode) return;
    }

    const isRev = mode === 'rev';
    const primarySrc = isRev ? 'tier1/assets/audio/gt3_rev.mp3' : 'tier1/assets/audio/gt3_idle.mp3';
    const fallbackSrc = isRev ? 'tier1/assets/gt3_rev.mp3' : 'tier1/assets/gt3_idle.mp3';

    activeMode = mode;
    isRevving = isRev;
    if (isRev && revAudioBtn) revAudioBtn.classList.add('is-active');
    if (isRev && page3RevBtn) page3RevBtn.classList.add('is-playing');
    if (!isRev && page3IdleBtn) page3IdleBtn.classList.add('is-playing');

    const audio = new Audio(primarySrc);
    audio.volume = 0.88;
    activeAudio = audio;

    audio.addEventListener('ended', () => {
      if (activeAudio === audio) {
        activeAudio = null;
        clearAudioUI();
      }
    });

    audio.play().catch(() => {
      const fb = new Audio(fallbackSrc);
      fb.volume = 0.88;
      activeAudio = fb;
      fb.addEventListener('ended', () => {
        if (activeAudio === fb) {
          activeAudio = null;
          clearAudioUI();
        }
      });
      fb.play().catch(() => {
        clearAudioUI();
      });
    });
  }

  if (revAudioBtn) revAudioBtn.addEventListener('click', () => playEngineAudio('rev'));
  if (page3RevBtn) {
    page3RevBtn.addEventListener('click', () => playEngineAudio('rev'));
    page3RevBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playEngineAudio('rev');
      }
    });
  }
  if (page3IdleBtn) {
    page3IdleBtn.addEventListener('click', () => playEngineAudio('idle'));
    page3IdleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playEngineAudio('idle');
      }
    });
  }

  function computeExplodeFactor(s) {
    if (s <= 0.64) {
      return Math.min(1, Math.max(0, s / 0.64));
    }
    if (s <= 0.73) {
      return 1.0;
    }
    const collapseT = Math.min(1, Math.max(0, (s - 0.73) / 0.27));
    const smoothCollapse = collapseT * collapseT * (3 - 2 * collapseT);
    return 1.0 - smoothCollapse;
  }

  const MODEL_PATH = window.GT3_MODEL_PATH || 'tier1/assets/gt3.glb';

  loader.load(
    MODEL_PATH,
    function (gltf) {
      carModel = gltf.scene;
      scene.add(carModel);
      carModel.updateMatrixWorld(true);

      const bbox = new THREE.Box3().setFromObject(carModel);
      const center = bbox.getCenter(new THREE.Vector3());

      carModel.position.x = -center.x;
      carModel.position.y = -bbox.min.y;
      carModel.position.z = -center.z;
      baseCarY = carModel.position.y;
      carModel.updateMatrixWorld(true);

      if (window.MaterialEnhancer) {
        try {
          window.MaterialEnhancer.apply(carModel);
        } catch (err) {
          console.error('[GT3 MaterialEnhancer]', err);
        }
      }

      if (window.ExplodeEngine) {
        explodeEngine = new window.ExplodeEngine(carModel);
      }

      carModel.traverse(function (child) {
        if (child.isMesh && child.visible) {
          carParts.push(child);
        }
      });

      const initialScroll = scrollController.getProgress();
      const initialExplode = computeExplodeFactor(initialScroll);
      if (explodeEngine) explodeEngine.update(initialExplode);
      if (cameraController) cameraController.update(initialScroll, baseCarY, initialExplode);
      if (uiController) uiController.update(initialScroll, performance.now() * 0.001);

      if (loadingBarFill) {
        loadingBarFill.style.width = '100%';
      }

      if (loadingOverlay) {
        setTimeout(() => {
          loadingOverlay.classList.add('is-complete');
          window.isShowroomReady = true;
          setTimeout(() => {
            loadingOverlay.style.display = 'none';
          }, 1000);
        }, 300);
      } else {
        window.isShowroomReady = true;
      }
    },
    function (xhr) {
      if (xhr.lengthComputable && loadingOverlay) {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        if (loadingBarFill) {
          loadingBarFill.style.width = `${percent}%`;
        }
      }
    },
    function (error) {
      console.error('[GT3 Scene] Error loading GLB model:', error);
    }
  );

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', onWindowResize, false);

  function animate(now) {
    requestAnimationFrame(animate);

    const t = now * 0.001;

    if (isAutoTour) {
      let nextP = scrollController.getProgress() + autoTourDir * 0.0018;
      if (nextP >= 1) {
        nextP = 1;
        autoTourDir = -1;
      } else if (nextP <= 0) {
        nextP = 0;
        autoTourDir = 1;
      }
      const stageTop = scrollController.getStageOffsetTop();
      const stageRange = scrollController.getStageScrollRange();
      if (stageRange > 0) {
        window.scrollTo({ top: stageTop + nextP * stageRange, behavior: 'auto' });
      }
      scrollController.setProgress(nextP);
    } else {
      scrollController.update();
    }

    const scroll = scrollController.getProgress();
    const explodeFactor = computeExplodeFactor(scroll);

    const revVibration = isRevving ? Math.sin(t * 95) * 0.0025 : 0;
    const idleFloat = Math.sin(t * 1.5) * 0.010 + revVibration;
    const pathYOffset = -explodeFactor * 0.55;
    const currentCarY = baseCarY + pathYOffset + idleFloat;

    if (carModel) {
      carModel.position.y = currentCarY;
    }

    if (explodeEngine) {
      explodeEngine.update(explodeFactor);
    }

    if (window.studioEnvironment && carModel) {
      const env = window.studioEnvironment;
      env.floorGroup.position.y = pathYOffset + idleFloat;
      env.discMesh.material.opacity = Math.max(0.22, 0.94 * (1 - explodeFactor * 0.72));
      if (env.contactShadowMesh) env.contactShadowMesh.material.opacity = Math.max(0.08, 0.92 * (1 - explodeFactor * 0.85));
      if (env.floorGlowMesh) env.floorGlowMesh.material.opacity = Math.max(0.18, 0.85 * (1 - explodeFactor * 0.65));

      env.keyLight.position.x = 6 + Math.sin(t * 0.85) * 1.8;
      env.keyLight.position.z = 7 + Math.cos(t * 0.85) * 1.8;
    }

    if (window.studioShadowPlane && carModel) {
      window.studioShadowPlane.material.opacity = Math.max(0.05, 0.44 * (1 - explodeFactor * 0.85));
    }

    const rootStyle = document.documentElement.style;
    const spotX = 50 + Math.sin(scroll * Math.PI * 2 + t * 0.35) * 12;
    const spotY = 46 + explodeFactor * 8;
    rootStyle.setProperty('--spot-x', `${spotX.toFixed(1)}%`);
    rootStyle.setProperty('--spot-y', `${spotY.toFixed(1)}%`);
    rootStyle.setProperty('--aura-x', `${(100 - spotX).toFixed(1)}%`);
    rootStyle.setProperty('--aura-y', `${spotY.toFixed(1)}%`);
    rootStyle.setProperty('--wm-y', `${(-explodeFactor * 55).toFixed(1)}px`);
    rootStyle.setProperty('--wm-scale', (1 + explodeFactor * 0.10).toFixed(3));
    rootStyle.setProperty('--wm-opacity', Math.max(0.14, 0.45 - explodeFactor * 0.25).toFixed(2));

    if (cameraController) {
      if (scrollController.isPage2Active && !scrollController.isPage3Active) {
        if (window._page2RotationStart === undefined || window._page2RotationStart === null) {
          window._page2RotationStart = t;
        }
        cameraController.idleOffset = (t - window._page2RotationStart) * 0.16;
      } else {
        window._page2RotationStart = null;
        cameraController.idleOffset = 0;
      }
      cameraController.update(scroll, currentCarY, explodeFactor);
    }

    if (uiController) {
      uiController.update(scroll, t);
    }

    if (scrollController.isPage2Visible || !carModel) {
      renderer.render(scene, camera);
    }
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