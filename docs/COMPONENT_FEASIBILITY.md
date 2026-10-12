# OSMOO — Component Feasibility & Implementation Strategy Matrix

**Document:** `docs/COMPONENT_FEASIBILITY.md`  
**Reference:** Supplied Hero Reference (`media_1791787049798_778659f3.jpg`)  
**Status:** Phase 2 Deliverable (Complete)

---

## 1. Per-Component Implementation Feasibility Matrix

| Component | Reference Appearance | Required Fidelity | Classification | Implementation Method | Fallback Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Window Frame & Shell** | Dark container (`#0B0A10`), subtle 1px border (`#38373C`), rounded corners (~16px). | 100% Exact | **BUILD** | Semantic HTML container + Tailwind CSS utility styling + responsive max-width wrapper. | Native full-width on mobile viewports (< 768px). |
| **Navigation Header** | Left logo (`OSMOO`), center links (`Home`, `Features`, `Eco-system`, `Contact`), active bar, right pill button (`Get OSMOO`). | 100% Exact | **BUILD** | React component + Tailwind CSS + Lucide React for mobile hamburger toggle. | Collapsible responsive sheet / drawer on mobile. |
| **3D Companion Character** | Glossy obsidian head with two emissive pill eyes, detached torso, two floating white sphere hands. | High Craft 3D | **BUILD / IMPORT** | Three.js + React Three Fiber procedurally crafted compound mesh (squashed spheres, lathe torso, emissive pill eyes, satin hand spheres) with studio PBR materials + cursor lerp tracking. | High-resolution transparent PNG reference crop ([osmoo_character_reference.png](file:///c:/Users/gaurav/Downloads/OSMOO/public/osmoo_character_reference.png)) seamlessly renders if WebGL is disabled/lost. |
| **Undulating Wave Mesh Ribbon** | Parallel sinusoidal flowing lines across center background (`#262330` to `#6A647D`). | High Craft 3D / Shader | **BUILD** | Three.js custom instanced line geometry / GLSL ribbon shader with harmonic sine waves or optimized SVG canvas lines synced to time. | SVG animated background path. |
| **Hero Typography** | `YOUR COMPUTER.`<br>`REIMAGINED.` (Bold off-white, tracking -0.02em, ~56px). | 100% Exact | **BUILD** | Inter / Geist / Plus Jakarta Sans display font with exact letter-spacing, line-height, and responsive clamp. | Standard system sans-serif font stack. |
| **Hero Subtitle** | `OSMOO: Your AI operating companion, integrated directly into your workflow.` (Zinc-400, ~15px). | 100% Exact | **BUILD** | Tailwind CSS `text-zinc-400 font-normal leading-relaxed`. | Clean wrapped text. |
| **Primary Pill CTA** | Pure white pill button (`rounded-full`), dark text, subtle radiant glow. | 100% Exact | **BUILD** | Button component with subtle box-shadow glow, accessible focus rings, Motion hover scale. | Solid high-contrast button. |
| **Bottom-Right Sparkle** | Four-pointed stylized star icon (~39px). | 100% Exact | **BUILD** | Custom SVG four-pointed star with subtle pulse / float animation. | Static SVG icon. |

---

## 2. Classification Definitions
- **BUILD**: Component can be engineered with 100% fidelity using existing verified tools (`React 19`, `Three.js`, `R3F`, `Tailwind CSS 4`, `Motion`).
- **IMPORT / HYBRID**: 3D scene combines real-time procedural Three.js PBR geometry with interactive cursor tracking and an exact fallback image asset already extracted to `public/osmoo_character_reference.png`.
- **SOURCE**: Not required for this hero; all components are self-contained without external paid model dependencies.
