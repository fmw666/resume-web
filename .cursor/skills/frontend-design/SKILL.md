---
name: frontend-design
description: >-
  Create distinctive, production-grade frontend interfaces with high design
  quality. Use when building web components, pages, redesigning UI, or making
  visual design decisions (typography, color, layout, motion, atmosphere).
  Generates creative, polished output that avoids generic AI aesthetics.
---

# Frontend Design

Create distinctive, production-grade frontend interfaces that avoid
generic "AI slop" aesthetics. Ship real working code with exceptional
attention to aesthetic detail and creative choices.

## When to apply this skill

Trigger whenever the task is **visual / UX-shaped**, for example:

- "redesign this section / card / page"
- "the colors/layout/style aren't good, fix them"
- "build a landing page / hero / pricing component"
- any brief that includes words like *design*, *style*, *look*, *feel*,
  *pretty*, *polish*, *不好看*, *重新设计*, *再好好设计一下*

Do **not** apply for pure bug fixes, refactors without visual intent, or
back-end/API tasks.

## Design thinking (do this before writing code)

Commit to a **bold aesthetic direction** before you touch CSS:

- **Purpose**: what problem does this interface solve? Who uses it?
- **Tone**: pick an extreme — brutally minimal, maximalist chaos,
  retro-futuristic, organic/natural, luxury/refined, playful/toy-like,
  editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel,
  industrial/utilitarian, neumorphic/tactile, glassmorphic/atmospheric.
- **Constraints**: framework, performance budget, accessibility baseline.
- **Differentiation**: what makes this *unforgettable*? What's the one
  thing someone will remember?

**CRITICAL**: pick a clear direction and execute it with precision.
Bold maximalism and refined minimalism both work — the key is
intentionality, not intensity. Half-committed "safe" designs are the
worst outcome.

## Aesthetic guidelines

### Typography

Pick fonts that are beautiful, unique, and interesting. **Avoid** Arial,
Inter, Roboto, generic system stacks. Pair a distinctive display font
with a refined body font. Let type scale, weight, and letter-spacing do
real narrative work — not just "headings bigger".

### Color & theme

Commit to a cohesive palette. Use CSS variables. **Dominant colors with
sharp accents outperform timid evenly-distributed palettes.** If you
find yourself using 5 muted greys, stop: pick a hero color and let the
rest support it.

### Motion

Use animation for *effects* and *micro-interactions*, not decoration.
Prefer CSS-only when the platform is plain HTML/CSS. Use a motion
library (Motion / Framer Motion) when React is available. Focus on
high-impact moments: one well-orchestrated page load with staggered
reveals creates more delight than twenty scattered hover effects.

Always respect `prefers-reduced-motion: reduce`. Disable decorative
loops; keep structural transitions short (<150ms) or off.

### Spatial composition

Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking
elements. Generous negative space **or** controlled density — pick one,
don't straddle.

### Backgrounds & visual detail

Create atmosphere, don't default to flat solid colors. Tools in the
toolbox: gradient meshes, noise textures, geometric patterns, layered
transparencies, dramatic shadows, decorative borders, custom cursors,
grain overlays, subtle film-grain, conic gradients, mesh gradients.

Mix two or three. One is rarely enough; five is chaos.

## Anti-patterns (what NOT to do)

**Never use:**

- Overused font families: Inter, Roboto, Arial, system defaults, Space
  Grotesk as a reflex choice.
- Cliched schemes: purple gradient on white, Stripe-teal-on-navy,
  "generic SaaS lavender".
- Predictable layouts: hero + 3 columns + CTA + footer with no
  surprise anywhere.
- Cookie-cutter components that carry no trace of the product's voice.

**Never converge** on common AI choices across generations. If the last
five things you produced all used `#6366F1` purple and Space Grotesk,
that's a smell — deliberately break the pattern.

## Implementation

Match implementation complexity to aesthetic vision:

- **Maximalist** designs need elaborate code with extensive animations,
  layered effects, and orchestrated choreography.
- **Minimalist** designs need restraint, precision, and careful
  attention to spacing, type, and subtle details (1px matters).

Elegance comes from executing the vision well, not from which end of
the spectrum you chose.

## Output requirements

Produce working code (HTML/CSS/JS, React, Vue, Svelte, …) that is:

- Production-grade and functional (no placeholder `// TODO: style`).
- Visually striking and memorable.
- Cohesive with a clear aesthetic point-of-view.
- Meticulously refined in every detail (shadow stops, letter spacing,
  hover states, empty states, error states).

Vary between light and dark themes, different font pairings, different
aesthetics across sessions. **No two designs should feel the same.**

---

## Adapting to an existing codebase

When dropping into a mature project (not a greenfield), the above
principles still apply, but **read the room first**:

1. **Inventory the existing design language.** Before proposing
   anything, identify the project's:
   - Palette (CSS variables, hero color, accent colors).
   - Type system (font stack, scale, weight conventions).
   - Material/shadow vocabulary (flat? neumorphic? glassmorphic?
     brutalist borders?).
   - Motion vocabulary (spring / ease-out / linear / none?).
   - Layout rhythm (card-heavy? full-bleed? asymmetric?).
2. **Match the vocabulary** for the *chrome* (containers, spacing,
   shadows) so your new work feels native.
3. **Introduce novelty inside the vocabulary.** Within a card, a
   section, an icon — that's where you push the distinctive,
   memorable choices from the guidelines above.
4. **Don't cross-contaminate themes.** If the site has a light
   neumorphic base and a dark deep-space base, give each its own
   vocabulary rather than forcing one metaphor to stretch across.
   (Example: a "terminal card" rendered as a black rectangle on a
   light neumorphic parent card will always look glued-on — render
   it as a light neumorphic well in the light theme and as dark
   glass in the dark theme.)
5. **Respect the rails.** Config-first projects, module-per-concern
   projects, design-token projects — follow the existing discipline.
   Your design change should be a new value inside the system, not
   an escape hatch around it.

## Case study: this repo (resume-web)

A concrete application of the principles above, so the abstract rules
have a real anchor. Treat as an *example* of the skill applied, not a
style lock-in — when the surrounding project changes, the case study
adapts too.

**Vocabulary inventory:**

- **Material**: neumorphism. Cards use `.bg-surface` (`#e0e5ec` in
  light, `#353353` in dark) + `.shadow-dark` (paired `+x+y` dark and
  `-x-y` light insets). Everything feels tactile and pressed.
- **Palette**: brand purple `#6C6CE5` + coral `#FF4C60` as the CTA duo;
  support greens `#44D7B6` / yellow `#FFD15C`; deep ink `#1D1B3A` for
  dark theme.
- **Type**: Rubik for body + "Sora-ish" bold display; monospaced
  `Rubik mono / SF Mono / Menlo` inside the terminal/prompt surfaces.
- **Motion**: short CSS transitions + scattered wow.js `fadeInUp`
  reveals. No JS animation libraries.
- **Rails** (from `.cursor/rules/core.mdc`):
  - config-first: URLs / timeouts / vendor paths live in
    `src/config/index.js`, not inline magic values;
  - boot through the lifecycle pipeline, never inline `await` chains
    in `main.js`;
  - error isolation via `safeRun` — no top-level throws;
  - CSS shards live under `public/assets/css/style/NN-name.css`,
    ≤ 500 lines each, dark mode centralized in `18-dark-mode.css`
    (but section-scoped dark rules, like `27-agent.css`'s
    `body.dark section.agent ...`, are allowed for tight coupling).

**Design moves that worked well here:**

- The agent card's top rainbow ribbon (`#10A37F → #D97757 → #4285F4
  → #9168C0 → #E8416F → #F5B84A → #6C6CE5`) — a single 3px anchor
  that instantly tells readers "this card is for AI agents". One
  memorable detail beats five forgettable ones.
- The brand logo strip replacing a 140×140 avatar block — filling
  horizontal space with signal instead of leaving 65% empty.
- Theme-split materials for the prompt card: light neumorphic well
  in light theme, deep-space glass in dark theme. The metaphor is
  *nested*, not *transplanted*.
- Color-mix chip backgrounds (`color-mix(in srgb, var(--brand-bg)
  12%, #ffffff)`) so nine brand chips feel "of the same family"
  even with nine different hero colors.

**Moves to avoid in this repo:**

- Swapping neumorphism for flat Material — would fight the entire
  site's voice.
- Introducing a new JS animation library — violates the "no new
  runtime deps without strong reason" rail.
- Adding `body.dark` overrides in random shards instead of
  centralizing in `18-dark-mode.css` (or cleanly scoping to a
  section shard).

---

*Claude is capable of extraordinary creative work. Don't hold back —
show what can truly be created when you commit fully to a distinctive
vision.*
