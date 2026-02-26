# Hero + Docs Rich Text Revamp — Design

## Goal

Revamp the hero section so the intricate visualization tells the marsbot product story (not just abstract animation), and overhaul docs typography for readability and brand consistency.

## Hero Revamp

### Problem

The current HeroDemo is visually rich (SVG + Canvas + Framer Motion, 773 lines) but visitors can't tell what it means. Abstract shapes orbit and flow without context. The 5-phase auto-cycle has no narrative — it's animation for animation's sake.

### Solution: "Product story in motion"

Keep all the visual intricacy (canvas particles, SVG arcs, Framer Motion nodes) but make each phase narrate a product concept with visible captions.

**Messaging:**
- Title: "Your personal OS for AI agents" (gradient text)
- Subtitle: "One gateway on your hardware. Every surface connected. Agents that earn trust."
- CTAs: Get Started (primary) + View Architecture (secondary)

**5 phases, each ~4s with caption crossfade:**

| Phase | Visual | Caption |
|-------|--------|---------|
| 1. Your Gateway | Gateway node appears with glow | "runs on your hardware" |
| 2. Every Surface | 4 surface nodes animate in with lines | "one agent, every device" |
| 3. Live Data Flow | Particles flow surface↔gateway | "real-time across all surfaces" |
| 4. Trust Ladder | Trust ring arcs appear (L1→L5) | "agents earn access through competence" |
| 5. Your Stack | Tech stats flash | "22 packages. 95 tools. fully open." |

**Additional features:**
- Phase indicator dots at bottom (clickable to jump)
- Clickable nodes show capability panels (existing behavior, improved)
- Node labels include one-liner (e.g., "Desktop — Native macOS · SwiftUI")
- Reduced motion: all elements static, captions as stacked list

**Code:** Rewrite HeroDemo.tsx (~700-800 lines). Same visual density, narrative structure added.

## Docs Rich Text System

### Problem

Docs use `prose prose-invert prose-sm` which falls back to generic Tailwind prose defaults. On the void-dark background, headings are bland, code blocks are unstyled, tables look default, and there's no visual hierarchy for scanning.

### Solution: Custom `.docs-prose` in globals.css + MDX components

**Typography:**
- h1: 1.75rem, JetBrains Mono, mars-orange left border (3px)
- h2: 1.35rem, JetBrains Mono bold, top margin 2.5rem, subtle bottom border
- h3: 1.1rem, font-medium
- h4: 0.95rem, uppercase tracking, text-muted
- All headings get hover-reveal `#` anchor links
- Body: 15px Inter, text-secondary, 1.75 line-height

**Code blocks** (`pre > code`):
- Background: surface-2, border-subtle, rounded-lg
- Left accent: 3px mars-orange
- JetBrains Mono 13px, horizontal scroll, padding 1.25rem

**Inline code:** surface-2 bg, mars-orange text, rounded, small padding

**Tables:**
- Full width, header: surface-2 bg + uppercase small text
- Body: border-bottom, hover bg highlight
- Comfortable cell padding

**Blockquotes:** mars-orange left border, surface-1 bg with orange tint, italic

**Lists:** Orange dots (ul) / orange numbers (ol), proper indent, 0.5rem gap

**Horizontal rules:** Gradient line (transparent → border-medium → transparent)

**Links:** Mars-orange, underline on hover

**Custom MDX components (3):**
1. `<Callout type="info|warning|tip">` — colored left-border box with icon
2. `<CodeTitle>` — filename label above code blocks
3. `<StepList>` — numbered steps with orange circle indicators

**Layout updates to Docs.astro:**
- Replace `prose prose-invert prose-sm` with `docs-prose`
- Mobile sidebar toggle (hamburger → slide-in)
- "On this page" ToC in right column on xl screens

## Tech Stack

- Same: Astro 5, React 19, Framer Motion, Tailwind 4, Lucide React
- No new dependencies

## Not Building

- Starlight or any third-party docs theme
- Video/GIF hero
- Server-side rendering (stays static)
- Search (future scope)
