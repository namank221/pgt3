# PORSCHE 911 GT3 (992) — N Edition Digital Atelier

An interactive 3D WebGL digital showroom, mechanical deconstruction stage, and aerodynamic telemetry experience honoring the **Porsche 911 GT3 (992)**. Engineered for both **16:9 Desktop Workstations** and **9:16 Mobile Touchscreens** (`60 FPS` WebGL).

---

## Architecture & Interactive Stages

1. **Stage I — Overture (`#page1-overture`)**
   - Viewport-triggered `gt3_hero.mp4` dark studio overture with real-time aspect-ratio framing.
   - `4×3` transparent glassmorphic technical specification grid (`4.0L Flat-Six`, `9,000 RPM`, `375 kW / 510 PS`, `1,418 KG`, `6:55.34 Nürburgring Nordschleife`).
   - Full-bleed `N — P R E S E N T S —` editorial transition stage.

2. **Stage II — 3D WebGL Deconstruction Atelier (`#deconstruction-stage`)**
   - **239,088-Triangle CAD Assembly (`227` Sub-Meshes):** Real-time 6-stage scroll-driven exploded view (`0% → 100%` deconstruction) with outward radial, axial, and vertical separation vectors (`deconstruct.js`).
   - **Low-Key Dark Studio Calibration:** Custom HDRI (`studio.hdr`) environment reflection map paired with `ACESFilmicToneMapping` (`0.90` exposure) and custom GLSL curvature-cavity shaders (`materials.js`) that preserve sharp panel shutlines across all 6 PTS paint finishes.
   - **Default Paint Finish:** Color No. 4 — **Chalk Monochrome** (`RGB(0.62, 0.65, 0.70)`), switchable live across 6 bespoke finishes (`Obsidian Black`, `GT Silver Metallic`, `Shark Blue`, `Chalk Monochrome`, `Python Green`, `Gentian Blue`).
   - **Continuous 360° Studio Orbit:** Automatically initiates from the signature **Front-3/4 Hero Angle** (`baseTheta = 0.65`) when entering Stage II, with full touch/mouse drag override and automatic mobile portrait distance compensation (`camera-path.js`).
   - **Authentic Stuttgart Details:** Procedural canvas-baked Stuttgart Porsche Crests on the steering wheel hub and front bonnet, `P O R S C H E` ceramic brake caliper typography, Michelin Pilot Sport Cup 2 sidewall embossing, and a 5-pod `10,000 RPM` GT3 instrument cluster.

3. **Stage III — Beyond Mechanics (`#page3-beyond-mechanics`)**
   - **Asymmetric 4-Portrait Mechanical Gallery:** `1:1` Square (`01 // DOUBLE-WISHBONE FRONT AXLE`), `21:9` Wide (`02 // SWAN-NECK REAR WING`), `4:5` Tall (`03 // CARBON CERAMIC PCCB`), and `16:10` Cinema (`04 // 9,000 RPM FLAT-SIX ITB`) with magnetic cursor tracking and depth-of-field sibling blur.
   - **Aerodynamic Flow & Acoustic Resonance:** `1.8×` right-facing 911 GT3 silhouette paired with continuous SVG wind-tunnel streamlines (`EXPERIENCE THE WAVES`) and a `9,000 RPM` radial telemetry dial (`FEEL THE EXHAUST`).
   - **Supercar Atelier Footer:** 4-column architectural directory, live `ZUFFENHAUSEN // DE` UTC+1 telemetry clock, WLTP homologation bar, and an edge-to-edge `100vw` vector `P O R S C H E` floor wordmark.

---

## Deploying to GitHub Pages (Zero-Build Static Setup)

This project requires **no bundler or build step** to deploy on **GitHub Pages**, **Vercel**, or **Netlify**:

1. Create a new repository on GitHub and push all files in this folder to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial release: Porsche 911 GT3 (992) 3D WebGL Digital Atelier"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, choose **`main`** and **`/ (root)`**, and click **Save**.
4. The included `.nojekyll` file ensures GitHub Pages serves all `.glb`, `.hdr`, `.mp4`, and `.js` assets directly at full speed.

### Running Locally
You can launch the local static server using Node.js or Python:
```bash
# Option A: Included zero-dependency Node server (Port 3000)
node server.js

# Option B: Python 3 HTTP server (Port 8080)
python3 -m http.server 8080
```

---

## Credits, Sources & Open-Source Attribution

### 1. 3D Vehicle CAD Mesh (`CC-BY-4.0`)
* **Model:** [Porsche 911 GT3 (992)](https://sketchfab.com/3d-models/porsche-911-gt3-78d5c47ab2554c2592b7e499179a0792) (`tier1/assets/gt3.glb`)
* **Original Author:** [**ChevroletSS**](https://sketchfab.com/ChevroletSS) on Sketchfab
* **License:** [Creative Commons Attribution 4.0 International (`CC-BY-4.0`)](https://creativecommons.org/licenses/by/4.0/)
* **Modifications & Engineering Adaptation:** Adapted for real-time exploded mechanical deconstruction (`227` categorized sub-meshes across 6 mechanical groups), custom GLSL screen-space curvature cavity shaders, multi-coat clearcoat PBR material calibration, and procedural high-resolution canvas textures (Stuttgart crests, ceramic brake caliper script, Michelin Pilot Sport Cup 2 sidewall markings, and 5-pod `10,000 RPM` instrument cluster).

### 2. Design Language & Automotive Telemetry Inspiration
* **Vehicle Specifications & Motorsport Pedigree:** [Dr. Ing. h.c. F. Porsche AG — 911 GT3 (992)](https://www.porsche.com/usa/models/911/911-gt3-models/911-gt3/) (Flacht / Weissach Engineering & Zuffenhausen Assembly telemetry).
* **Aerodynamic Streamlines & Editorial Architecture:** Inspired by the [Bugatti Tourbillon](https://www.bugatti.com/en/models/tourbillon) (*"Masters of the Air"* aerodynamic flow visualization & dark obsidian luxury typography) and [Maserati MC20](https://www.maserati.com/us/en/models/mc20).

### 3. Open-Source Libraries & Typography
* **3D WebGL Rendering Engine:** [Three.js (`r128`)](https://threejs.org/) (`GLTFLoader`, `RGBELoader`, `PMREMGenerator`) — Licensed under the [MIT License](https://github.com/mrdoob/three.js/blob/dev/LICENSE).
* **Typography:** [Google Fonts](https://fonts.google.com/) — `Syncopate`, `Space Grotesk`, `JetBrains Mono`, and `Cormorant Garamond` under the [SIL Open Font License 1.1](https://openfontlicense.org/).

---

## Disclaimer
This project is an independent, non-commercial interactive 3D WebGL engineering showcase and portfolio piece created for educational and artistic demonstration. **Porsche**, **911**, **GT3**, **Weissach**, the **Porsche Crest**, and the **Porsche Wordmark** are registered trademarks of **Dr. Ing. h.c. F. Porsche AG**. This project is not affiliated with, endorsed by, or sponsored by Dr. Ing. h.c. F. Porsche AG.
