# PROJECT EMERALD — Mohammed Viquaruddin, immersive 3D portfolio

A complete React + TypeScript + Vite rebuild of the portfolio as one continuous 3D world:
a cinematic **Emerald Gateway** entrance, a **Project Universe** of five distinct environments,
and a **Spatial Education Timeline**, all driven by scroll.

> **Read this first — verification status.**
> This project was written in an environment where the npm registry was blocked, so it could **not**
> be installed, type-checked against the real libraries, built, or run in a browser there.
> What *was* verified: every source file parses, all local imports and exports resolve and the 3D world
> splits into its own lazy chunk (esbuild bundle pass), the internal logic type-checks against stubbed
> library typings, the 3D typeface was generated and its winding validated, and all five project URLs respond.
> **You are the first person to run it.** Please follow the checklist in [First run](#first-run-checklist);
> if anything fails, the error text is all that is needed to fix it.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
npm run typecheck  # strict TypeScript check against the real library types
npm run build:strict   # typecheck + build
```

Requires Node 20+ (Node 22 recommended). `npm run build` is `vite build`; the strict variant also runs `tsc`.

## First run checklist

1. `npm install` completes.
2. `npm run typecheck` — fix anything it reports (library typings were not available when this was written).
3. `npm run build` completes; open `npm run preview`.
4. Watch the browser console while scrolling through every section. Scene errors are isolated by error
   boundaries and logged as `[emerald] scene "…" failed to render`, so one broken scene never blanks the page.
5. If a scene looks too dark / bright / bloomy on your screen, change the numbers in `src/config/tuning.ts`
   (lights, fog, bloom, camera damping). The lighting was authored without a visual feedback loop.

## The three signature experiences

| Experience | Where | How it works |
|---|---|---|
| **01 Emerald Gateway** | `src/scenes/EmeraldGateway`, `src/components/intro`, `src/lib/intro.ts` | Pylons, lintel, counter-rotating ring arcs, a GLSL portal veil, volumetric-style light shafts, refracting emerald crystals. Nearly-black reveal → name → **Enter experience** → the camera flies straight through the opening (flash at the threshold). **Skip intro** (button or <kbd>Esc</kbd>); <kbd>Enter</kbd> enters. Returning visitors in the same session, `#hash` links and reduced-motion users skip it automatically. |
| **02 Project Universe** | `src/scenes/ProjectsScene` | Five environments on a ring, each authored facing +Z and yawed outward so the camera always meets it head-on: **AETHER** (glass spire, square frames, floating slabs), **COSMOS** (churning star shader, atmospheres, ringed giant, asteroid belt), **Password Security Lab** (vault rings, golden padlock, shield, data-rain), **Student Finance Manager** (bar-chart towers, coins, trend line with travelling pulse), **Personal Portfolio** (MV monolith). Select via the rail, arrow keys, swipe, or by clicking a structure; the camera sweeps along an arc between environments. Hover wakes an environment. |
| **03 Spatial Education Timeline** | `src/scenes/EducationScene` | Three octagonal platforms on an ascending path with bridges, refracting milestone crystals and **extruded metallic numerals** (82%, 95%, 2027). Scrolling travels platform to platform; the active one lights up. |

## Architecture

```
src/
  config/      tuning.ts (look & feel) · quality.ts (Cinematic/Balanced/Lite tiers) · layout.ts (world coordinates)
  state/       world.ts (mutable per-frame state, never React) · ui.ts (zustand) · actions.ts (tweened selections)
  lib/         scroll.ts (Lenis + ScrollTrigger) · intro.ts (state machine) · math.ts · dom.ts
  scenes/      World.tsx (single fixed Canvas, lazy chunk)
    common/    CameraRig · poses · Atmosphere · DustField · PostFX · shaders (GLSL) · primitives (ShardField, GridFloor, Beam, MetalText, PillarField)
    EmeraldGateway · HeroScene · AboutScene · EducationScene · SkillsScene · ProjectsScene (+environments/) · JourneyScene · ContactScene
  sections/    Hero · About · Education · Skills · Projects · Journey · Contact   (DOM layer)
  components/  layout · navigation (SpatialNav) · intro · ui
  data/        projects.ts · education.ts · skills.ts · journey.ts · profile.ts   ← edit content here
  styles/      tokens.css · base.css · components.css · sections.css
public/fonts/  lora-medium.typeface.json (generated 3D typeface; see scripts/make-typeface.py)
```

**One world, one context.** A single fixed `<Canvas>` sits behind the page. Each section owns a *zone* along a corridor
(`config/layout.ts`). `CameraRig` is the **only** thing that moves the camera; it samples a pose per zone
(`scenes/common/poses.ts`) and smooths it. Zones are only rendered and animated while the camera is near them.

**No animation system fights another.** Ownership is documented in `state/world.ts`: the intro timeline owns
`introT/dolly/ambience/portal`; ScrollTrigger owns `scrollT/edu/journey`; tweens in `actions.ts` own
`projectFocus/skill`; Framer Motion only animates DOM mount/unmount (panels, menu, toast); GSAP animates DOM
reveals via `[data-reveal]`. Per-frame values live in a plain object, so scrolling never triggers React renders.

**Scroll → camera.** Each section after the first contributes one "segment" (its top travelling from the bottom of
the viewport to the top) during which the camera flies to the next zone, then dwells. Education and Journey are tall
sections with a sticky stage whose own 0–1 progress moves the camera *within* the zone.

## Performance

- 3D is a lazy chunk (`React.lazy`); `three`, `gsap`, `framer-motion` are split via `manualChunks`.
- Instanced rendering for all repeated geometry (shards, pillars, bars, coins, belts); one-draw-call dust lattice that wraps around the camera inside the vertex shader.
- Quality tiers (`config/quality.ts`): **Cinematic** (transmission glass, planar reflections, bloom/MSAA, shadows), **Balanced**, **Lite** (no post, no shadows, cheap glass, ~35% instance counts, DPR ≤ 1.25). Chosen from input type / viewport / cores / memory, user-overridable in the header, and automatically stepped down by `PerformanceMonitor` if FPS collapses (only after entering).
- Zones off-screen are `visible=false` and their frame callbacks are skipped. Rendering pauses when the tab is hidden.
- All shaders are pre-compiled before the loader finishes. Shared materials are disposed on unmount; geometries created in `useMemo` are disposed in effect cleanup. Procedural environment lighting — no HDR download.
- Reduced motion: no intro cinematic, no ambient animation, no Lenis smoothing, no parallax.
- No WebGL / context loss / scene crash: the full DOM portfolio remains usable on a CSS backdrop.

## Accuracy of content

Everything is data in `src/data/`. Facts were carried from your original portfolio and brief; nothing was invented.

- **Education:** Grace Excel High School (SSC / 10th, 82%) → Gyanam Junior College (Intermediate MPC, TGBIE, 95%). A third, *upcoming* milestone — Bachelor of IT, Auckland Institute of Studies, Feb 2027–Dec 2029 expected — is kept from your original page and clearly marked "Incoming". Delete the third entry (and one platform in `config/layout.ts`) if you prefer only the two completed records.
- **Projects:** AETHER and COSMOS show **LIVE**; no "Upcoming/Coming soon" text remains. COSMOS lists no tech stack because none was provided. No GitHub repository links exist in the source, so none are shown (a button appears automatically if you add `repoUrl`).
- **Skills:** conservative — only technologies from your original page, AETHER's stack, and your deployments. Backend is honestly marked "exploring". Add items in `src/data/skills.ts`.
- **Phone number:** your original page displayed `+91 79950 62018` but its `tel:` link dialled `+917995762018`. The site uses the dialled number (`+91 79957 62018`). **Please confirm which is right** in `src/data/profile.ts`.

## Deploying

Both configs are included and need no changes.

- **Netlify:** connect the repo (or drag the project). `netlify.toml` sets `npm run build`, publish `dist`, Node 22, SPA fallback and cache headers. Your existing Netlify site `mohammedviquaruddin` will simply be replaced by the new build.
- **Vercel:** import the repo; `vercel.json` sets the Vite framework, `dist` output, rewrites and headers. Or `npx vercel --prod`.

The Open Graph/canonical URLs in `index.html` assume `https://mohammedviquaruddin.netlify.app/`; change them if you deploy elsewhere.

## Accessibility & SEO

Semantic landmarks, skip link, visible focus styles, a labelled tablist/segmented controls with arrow-key support, `aria-live` panels,
`aria-current` navigation, descriptive link labels for new-tab links, reduced-motion support, text contrast ≥ 7:1 on the body palette,
`<noscript>` content, JSON-LD Person data, Open Graph/Twitter cards, favicon. The page is fully usable without touching the 3D scene.

## Credits

3D numerals use **Lora** (SIL OFL 1.1). Web fonts: Instrument Serif, Inter Tight, JetBrains Mono via Fontsource (SIL OFL).
