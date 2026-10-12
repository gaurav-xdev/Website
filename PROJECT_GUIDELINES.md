# OSMOO Engineering & Development Guidelines

This document outlines the architecture, motion principles, 3D guidelines, and development workflow established for the OSMOO website.

---

## 1. Tech Stack & Architecture

- **Framework**: React 19 + TypeScript (ES2023, strict mode)
- **Bundler & Build**: Vite 8 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Motion & Animation**:
  - **GSAP 3.15 + ScrollTrigger**: Orchestration for scrubbed timelines, pinned chapters, layered parallax, and storytelling triggers.
  - **Lenis 1.3**: Inertial smooth scrolling integrated into GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`).
  - **Motion 14 (`motion/react`)**: Component-level enters/exits, layout animations, gestures, and state transitions.
- **3D & WebGL**:
  - **Three.js 0.186**: Core 3D engine, custom shaders, post-processing.
  - **@react-three/fiber 9.8 & @react-three/drei 10.7**: Declarative React canvas integration.
- **Icons**: Lucide React (`lucide-react`)
- **Testing & Quality**:
  - **Linter**: Oxlint (`npm run lint`)
  - **Tests**: Vitest 5 (`npm test`)
  - **Build**: TypeScript project reference + Vite (`npm run build`)

---

## 2. Motion Design Language & Tokens

Follow the `cinematic-gsap-lenis-motion-system` and `gsap-scrolltrigger-storytelling` guidelines:

- **Timing & Curves**:
  - Easing curves: `power3.out`, `power4.out`, `expo.out` (avoid bouncy, elastic, or playful easing).
  - Reveal durations: `0.75s` to `1.1s`.
  - Hover states: `0.35s` to `0.6s`.
  - Cursor / pointer lag: `0.25s` to `0.45s`.
- **ScrollTrigger Orchestration**:
  - Scrub delay: `0.8` to `1.4` for cinematic, weighted feel.
  - Section trigger standard: `start: "top 82%"`.
  - Pinning handoff: `anticipatePin: 1`.
  - Text stagger: words `0.035s` to `0.07s`, lines `0.08s` to `0.14s`.
  - Card stagger: `0.06s` to `0.1s`.
- **Lifecycle Discipline**:
  - Always encapsulate GSAP tweens and ScrollTriggers within `gsap.context()` inside `useEffect` / `useLayoutEffect`, and call `ctx.revert()` on unmount to prevent memory leaks and ghost triggers.

---

## 3. 3D & WebGL Guidelines

Follow `threejs-skills` best practices:

1. **Asset Optimization**:
   - Prefer Draco-compressed `.glb` or `.gltf` assets.
   - Restrict texture sizes to powers of two (max 2048x2048 for hero elements, 1024x1024 or smaller for secondary items).
   - Use mipmapping and appropriate filtering (`LinearMipmapLinearFilter`).
2. **Performance Constraints**:
   - Limit draw calls by batching meshes (`InstancedMesh`) where possible.
   - Dispose geometries, materials, and textures when components unmount.
   - Adjust `pixelRatio` to `Math.min(window.devicePixelRatio, 2)` to avoid performance bottlenecks on high-DPI screens.
3. **Progressive Enhancement**:
   - Provide visual fallbacks (CSS gradient / optimized poster image) when WebGL is unavailable or loading.

---

## 4. Accessibility & Reduced Motion

Follow `ui-a11y` standards:

- **Prefers-Reduced-Motion**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- In JavaScript/GSAP: Query `window.matchMedia("(prefers-reduced-motion: reduce)").matches` and skip smooth scrolling or scrubbed camera travel, displaying end-state static layouts directly.
- **Touch & Contrast**:
  - Minimum touch target: 44x44px.
  - WCAG 2.2 AA contrast: 4.5:1 for normal text, 3:1 for large text.

---

## 5. Development & Verification Workflow

Before completing any task:
1. Run `npm run lint` — Oxlint must pass with 0 errors and 0 warnings.
2. Run `npm test` — All unit and integration tests must pass.
3. Run `npm run build` — `tsc -b && vite build` must produce a clean build without TypeScript errors.
