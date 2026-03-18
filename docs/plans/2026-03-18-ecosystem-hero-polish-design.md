# Ecosystem Map + HeroInversion Polish

## Context

Two UI improvements for the investor-ready marsbot.dev site:
1. **Ecosystem Map** — detail panels clip out of the viewport when edge/bottom nodes are selected
2. **HeroInversion copy** — scenes are structurally good but copy is generic; needs sharper investor-facing language

---

## Part 1: Ecosystem Map — Bottom Sheet Panel

### Problem

`DetailPanel` is absolutely positioned inside the map container using `top: ${project.y + 10}%`. Nodes at y=85 (personal-space) render their panel at y=95% — outside the container. Edge nodes clip on small screens despite x-clamping.

### Solution

Remove `DetailPanel` from inside the map. Render a `BottomSheet` component in a separate DOM section directly below the map container. Never clips. More room for content.

### Spec

- `EcosystemMap` returns a wrapping `<div>` containing: the map (unchanged) + `<AnimatePresence>` bottom sheet
- Bottom sheet: `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, spring transition
- Layout: full-width on mobile, `max-w-2xl mx-auto` on desktop
- Content: same as current DetailPanel — name, status badge, role, description, tech tags
- Interaction: selecting a different node swaps content; clicking same node or × collapses
- Map container: remove `overflow-hidden` so nodes near edge don't clip either (keep `overflow: visible`)

### Critical Files

| File | Action |
|------|--------|
| `src/components/EcosystemMap.tsx` | Refactor DetailPanel → BottomSheet, move outside map div |

---

## Part 2: HeroInversion — Sharper Copy

### Problem

Current copy is structurally correct but generic. "What if your AI actually worked for you?" could be any AI product. Sublabels in The Stack are technical, not benefit-first. The Proof has no framing headline.

### Solution

Update copy in each scene to be specific, investor-facing, and benefit-first.

### Scene-by-Scene Changes

**Scene 1 — The Void (typewriter)**
- Old: `"What if your AI actually worked for you?"`
- New: `"Your AI should run on your hardware, speak your language, and answer to you alone."`

**Scene 2 — The Awakening**
- Old subtitle: `"personal OS for AI agents"`
- New subtitle: `"hardware-native · trust-gated · fully yours"`

**Scene 3 — The Stack (layer sublabels)**
| Layer | Old | New |
|-------|-----|-----|
| Gateway | `"JSON-RPC daemon · your hardware"` | `"always-on · never leaves home"` |
| Runtime | `"22 skill packs · tool router"` | `"budget-aware · skill-routed"` |
| Channels | `"Telegram · Slack · Discord · iMessage"` | `"meets you where you are"` |
| Surfaces | `"macOS · iOS · Web · CLI"` | `"native on every screen"` |

**Scene 4 — The Proof**
- Add headline above stats: `"Not a wrapper. A runtime."` in `var(--text-secondary)`, font-mono
- CTA: `"Try the Coach"` → `"Talk to the Coach"`

### Critical Files

| File | Action |
|------|--------|
| `src/components/HeroInversion.tsx` | Update TYPEWRITER_TEXT, STACK_LAYERS sublabels, SceneAwakening subtitle, SceneProof headline + CTA |

---

## Verification

- [ ] `npm run build` — clean
- [ ] Ecosystem: click all 7 nodes, panel always fully visible, no clipping
- [ ] Ecosystem: mobile at 375px, bottom sheet readable
- [ ] Hero: all 4 scenes render with updated copy
- [ ] Hero: reduced motion fallback shows new copy

## Commits

1. `fix: ecosystem map — bottom sheet panel replaces clipping detail panel`
2. `fix: HeroInversion — sharper investor-facing copy across all 4 scenes`
