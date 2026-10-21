/**
 * GT3 Exploded-View // Phase 5 Studio Lighting & Procedural Softbox Reflections
 */

class StudioLighting {
  static setup(scene, renderer) {
    // 1. Procedural Studio Softbox Environment Map for Crisp Paint Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xd8d8e0);

    // Overhead main softbox strip
    const topBox = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    topBox.position.set(0, 9, 0);
    topBox.rotation.x = Math.PI / 2;
    envScene.add(topBox);

    // Left & Right studio reflection strips
    const sideMat = new THREE.MeshBasicMaterial({ color: 0xf4f6ff, side: THREE.DoubleSide });
    const leftStrip = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.5), sideMat);
    leftStrip.position.set(9, 3.5, 0);
    leftStrip.rotation.y = -Math.PI / 2;
    envScene.add(leftStrip);

    const rightStrip = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.5), sideMat);
    rightStrip.position.set(-9, 3.5, 0);
    rightStrip.rotation.y = Math.PI / 2;
    envScene.add(rightStrip);

    // Dark studio floor in env map for realistic lower-body horizon contrast
    const envFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshBasicMaterial({ color: 0x3a3a42, side: THREE.DoubleSide })
    );
    envFloor.position.set(0, -2, 0);
    envFloor.rotation.x = -Math.PI / 2;
    envScene.add(envFloor);

    const envMap = pmremGenerator.fromScene(envScene, 0.035).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();

    // 2. Direct Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(6, 10, 7);
    keyLight.castShadow = true;
    const isMobile = window.innerWidth < 768;
    const shadowRes = isMobile ? 1024 : 2048;
    keyLight.shadow.mapSize.width = shadowRes;
    keyLight.shadow.mapSize.height = shadowRes;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 5.5;
    keyLight.shadow.camera.bottom = -5.5;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xeef2ff, 0.85);
    fillLight.position.set(-8, 5, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.25);
    rimLight.position.set(0, 8, -8);
    scene.add(rimLight);

    // 3. Soft Shadow-Catching Studio Floor
    const shadowGeo = new THREE.PlaneGeometry(18, 18);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.22 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    window.studioShadowPlane = shadowPlane;
  }
}

window.StudioLighting = StudioLighting;
