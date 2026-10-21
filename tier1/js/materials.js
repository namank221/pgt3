/**
 * GT3 Exploded-View // Phase 4 Automotive Material Enhancer
 * Tunes clearcoat paint, optical glass, forged rims, carbon, and ceramic discs.
 */

class MaterialEnhancer {
  static apply(carModel) {
    if (!carModel) return;

    carModel.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      const mat = child.material;
      const matName = (mat.name || '').toLowerCase();

      // Default shadow configuration: opaque meshes cast & receive shadows
      child.castShadow = true;
      child.receiveShadow = true;

      // 1. Exterior & Interior Body Paint (Porsche Deep Gloss Jet Black Metallic)
      if (matName.includes('ext_carpaint.004') || matName.includes('int_carpaint.004')) {
        // Deep obsidian black tone with high-clarity specular clearcoat
        mat.color.setRGB(0.012, 0.012, 0.014);
        mat.metalness = 0.22;
        mat.roughness = 0.09;
        if ('clearcoat' in mat) {
          mat.clearcoat = 1.0;
          mat.clearcoatRoughness = 0.02;
        }
        mat.envMapIntensity = 2.4;
        mat.side = THREE.FrontSide;
        mat.needsUpdate = true;
        return;
      }

      // 2. Optical Windows & Headlight Lenses (Prevent opaque shadow casting & depth sorting glitches)
      if (
        matName.includes('ext_glass_windows.001') ||
        matName.includes('int_windows.001') ||
        matName.includes('ext_glass_light_ext.001')
      ) {
        mat.transparent = true;
        mat.opacity = matName.includes('light') ? 0.32 : 0.28;
        mat.roughness = 0.04;
        mat.metalness = 0.15;
        mat.depthWrite = false;
        mat.envMapIntensity = 2.0;
        child.castShadow = false;
        child.renderOrder = 10;
        mat.needsUpdate = true;
        return;
      }

      // 3. Forged Satin Alloy Rims
      if (matName.includes('ext_rim')) {
        mat.color.setRGB(0.14, 0.14, 0.16);
        mat.metalness = 0.85;
        mat.roughness = 0.24;
        mat.envMapIntensity = 1.5;
        mat.needsUpdate = true;
        return;
      }

      // 4. Michelin Sidewall & Tread Rubber
      if (matName.includes('ext_tyre')) {
        mat.color.setRGB(0.08, 0.08, 0.09);
        mat.metalness = 0.05;
        mat.roughness = 0.82;
        mat.needsUpdate = true;
        return;
      }

      // 5. Ceramic Brake Discs & Calipers
      if (matName.includes('ext_disc')) {
        mat.color.setRGB(0.55, 0.56, 0.58);
        mat.metalness = 0.88;
        mat.roughness = 0.22;
        mat.envMapIntensity = 1.6;
        mat.needsUpdate = true;
        return;
      }

      if (matName.includes('brake_caliper')) {
        mat.color.setRGB(0.96, 0.74, 0.04);
        mat.metalness = 0.28;
        mat.roughness = 0.18;
        mat.envMapIntensity = 1.6;
        mat.needsUpdate = true;
        return;
      }

      // 6. Exterior Carbon / Satin Trim & Aluminium Wing Uprights
      if (matName.includes('carpaint_plastic') || matName.includes('carpaint_aluminium') || matName.includes('int_carbon')) {
        mat.roughness = 0.32;
        mat.metalness = 0.35;
        mat.envMapIntensity = 1.25;
        mat.needsUpdate = true;
      }
    });
  }
}

window.MaterialEnhancer = MaterialEnhancer;
