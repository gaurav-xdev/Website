# OSMOO — Reference Image Forensic Analysis & Visual Specification

**Document:** `docs/REFERENCE_ANALYSIS.md`  
**Source of Truth:** Supplied Reference Image (`media_1791787049798_778659f3.jpg`, 1024 × 740 px)  
**Art Director:** OSMOO 3D Design Director  
**Status:** Phase 1 Deliverable (Complete)

---

## 1. Global Composition & Layout Geometry

```
+-----------------------------------------------------------------------------------+
|  [OSMOO]                Home   Features   Eco-system   Contact        ( Get OSMOO )|  <- Top Bar (y: ~35-60)
|                                                                                   |
|                                (  Head  )                                         |
|                             (   0    0   )    <-- Glowing pill eyes               |
|                                                                                   |
|           ~~~~~~~~~~~~~       (          )       ~~~~~~~~~~~~~                    |  <- Sinusoidal Wireframe Ribbon
|        (hand)                (   Body     )                 (hand)                |     Wave (3D ribbon mesh)
|                               (          )                                        |
|                                                                                   |
|                         YOUR COMPUTER.                                            |  <- Primary Display H1
|                          REIMAGINED.                                              |     (y: 520 - 610)
|                                                                                   |
|     OSMOO: Your AI operating companion, integrated directly into your workflow.  |  <- Subtitle (y: 645 - 675)
|                                                                                   |
|                                ( Get OSMOO )                              +       |  <- Pill CTA & Sparkle
+-----------------------------------------------------------------------------------+
```

- **Canvas Dimensions**: 1024 × 740 px (aspect ratio ~1.38:1, standard 4:3 / desktop viewport crop).
- **Outer Frame**: The design is presented inside a dark browser/application window with rounded corners (~16px border-radius) and a subtle 1px border (`#38373C` / `rgba(255, 255, 255, 0.12)`).
- **Primary Focal Point**: The 3D OSMOO companion character centered horizontally (`x: 512`), floating serenely above the headline.
- **Secondary Focal Point**: The massive, bold hero headline: `YOUR COMPUTER.` / `REIMAGINED.` in crisp off-white (`#EAEAEF`).
- **Background Atmosphere**: Deep obsidian / dark space (`#07080A` to `#0B0A10`) layered with a glowing, undulating 3D wave mesh ribbon made of parallel sinusoidal curves (`#383445` to `#7A758D`).

---

## 2. Element-by-Element Inventory & Spatial Metrics

| Element | Measured Bounding Box | Color / Material Sample | Typographic / Geometric Specs |
| :--- | :--- | :--- | :--- |
| **Outer Window Frame** | `0, 0` to `1024, 740` | Border: `#38373C`, Margin bg: `#1B1A1F` | Rounded container with ~16px outer radius. |
| **Brand Logo (`OSMOO`)** | `X: [65, 155]`, `Y: [35, 47]` | Fill: `#EDEDED` (bright off-white) | Bold geometric grotesque/sans, tracking ~0.02em, font size ~18px, all caps. |
| **Top Navigation** | `X: [380, 635]`, `Y: [42, 56]` | Active: `#FFFFFF`, Inactive: `#9E9CA5` | 4 links: `Home`, `Features`, `Eco-system`, `Contact`. `Home` has an active white underline bar (`X: [380, 412]`, `Y: [55, 56]`, height 2px). Font size ~14px. |
| **Top Nav CTA Button** | `X: [860, 949]`, `Y: [25, 56]` | Text: `#EAEAEF`, Bg: `#1A1920`, Border: `#3A3842` | Pill shape (`rounded-full`), height 31px, width 89px. Label: `Get OSMOO`, font size ~12px. |
| **3D Companion: Head** | `X: [440, 584]`, `Y: [130, 310]` | Material: Glossy obsidian ceramic / black chrome (`#100F15` with rim reflections `#6B667C`). | Glossy spheroid (`SphereGeometry(1, 64, 64)` slightly squashed vertically). |
| **3D Companion: Eyes** | `Left: (498, 180)`, `Right: (538, 229)` | Emissive: `#FCFEFD` with outer soft bloom (`#8B8A9E`). | Two vertical capsule/pill shaped emissive eyes tilted slightly, displaying curious, alive gaze. |
| **3D Companion: Torso**| `X: [450, 574]`, `Y: [330, 530]` | Glossy dark ceramic / liquid obsidian. | Teardrop/egg-like tapered body floating detached below head. |
| **3D Companion: Hands**| `Left: (422, 474)`, `Right: (612, 475)`| Material: Satin white pearl ceramic (`#EAEAEA` with rim shadow). | Two small floating detached spherical hands hovering beside the body. |
| **Background Wave Ribbon**| Spans full width `X: [0, 1024]`, `Y: [120, 620]` | Gradient lines: `#262330` fading to `#6A647D` highlights. | Parallel undulating mathematical wave curves (sine/cosine frequency modulation) creating depth behind the character. |
| **Hero Title Line 1** | `X: [192, 845]`, `Y: [520, 565]` | `#EBEAEF` (near-white) | Text: `YOUR COMPUTER.` Bold geometric sans, ~54-58px, tracking -0.02em, centered. |
| **Hero Title Line 2** | `X: [255, 780]`, `Y: [565, 610]` | `#EBEAEF` (near-white) | Text: `REIMAGINED.` Bold geometric sans, ~54-58px, tracking -0.02em, centered. |
| **Hero Subtitle** | `X: [209, 817]`, `Y: [641, 655]` | `#8E8E8E` (neutral zinc-400) | Text: `OSMOO: Your AI operating companion, integrated directly into your workflow.` Regular sans, ~15-16px, centered. |
| **Hero Pill CTA** | `X: [451, 574]`, `Y: [690, 720]` | Bg: `#FFFFFF` (solid pure white), Text: `#0A0A0C` (deep black) | Pill button (`rounded-full`), height 30px, width 123px, label: `Get OSMOO`, font-medium ~13px. Subtle ambient white glow around bottom edges. |
| **Bottom Right Sparkle**| `X: [957, 996]`, `Y: [673, 712]` | Emissive star: `#8C8D8F` with white core | Four-pointed stylized star/sparkle icon (`39 × 39 px`). |

---

## 3. Materials, Lighting & Color Tokens

```css
:root {
  --bg-deep: #07080a;
  --bg-window: #0b0a10;
  --window-border: #38373c;
  --text-primary: #ebeaef;
  --text-muted: #8e8e8e;
  --text-nav-inactive: #9e9ca5;
  --companion-obsidian: #100f15;
  --companion-specular: #fafcfb;
  --companion-eye-glow: #ffffff;
  --companion-hand-white: #eaeaea;
  --wave-accent: #5e5973;
}
```

- **Lighting Setup**:
  - Key Directional Light from top-front-right (`position: [3, 5, 4]`, intensity ~2.2) creating the crisp specular highlights on the head and torso.
  - Subtle Cool Rim Light from behind-left (`position: [-4, 2, -3]`, intensity ~1.5) defining the silhouette of the companion against the dark background.
  - Soft Ambient Light (intensity ~0.4) keeping the obsidian body visible without crushing shadows to pure flat black.
- **Surface Quality**:
  - Head & Torso: High gloss (`roughness: 0.12`, `metalness: 0.15`, clearcoat `0.8`).
  - Hands: Satin matte white (`roughness: 0.35`, `metalness: 0.05`).
  - Eyes: Pure self-illuminated emissive white material (`MeshBasicMaterial` with bloom or high emissive intensity).

---

## 4. Interaction & Motion Hypotheses (Categorized)

1. **Companion Floating / Idle Breathing (Inferred)**:
   - Subtle vertical hover oscillation (`y: Math.sin(t * 1.5) * 0.1`) for head, body, and hands.
   - Hands have a slight phase offset relative to the body (`sin(t * 1.5 + 0.5)`).
   - Mouse-parallax: Head and eyes track cursor direction smoothly with lerped rotation (`quaternion.slerp`).
2. **Background Wave Animation (Inferred)**:
   - Mathematical wave ribbon lines continuously shift and undulate slowly horizontally/vertically using vertex shaders or procedural geometry.
3. **CTA Button Interactions (Observed / Inferred)**:
   - Top button: Border glow / subtle lighten on hover.
   - Bottom primary button: Inverted hover state (glow intensifies, slight scale `1.03`).
4. **Scroll Choreography (Inferred for Future Sections)**:
   - As the user scrolls down, the companion can elevate or transform to introduce subsequent features, with camera tracking via GSAP ScrollTrigger.
