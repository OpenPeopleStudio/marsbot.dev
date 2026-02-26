# marsbot.dev — Public Brand Site

## Stack
- **Framework**: Astro 5
- **Islands**: React 19 (hero demo, ecosystem map, breathing line)
- **Styling**: Tailwind CSS 4 + CSS custom properties (void-forward aesthetic)
- **Content**: Astro Content Collections (MDX) for docs + changelog
- **Deployment**: Vercel (static)
- **Icons**: Lucide React
- **Animations**: Framer Motion (islands only)

## Key Paths
- `src/layouts/` — Base and Docs layouts
- `src/pages/` — Astro pages (index, ecosystem, docs)
- `src/components/` — Astro (static) + React (islands) components
- `src/content/` — Content collections (changelog, docs)
- `src/styles/globals.css` — Design tokens
- `public/` — Static assets

## Conventions
- Static components use `.astro` files (zero JS)
- Interactive components use `.tsx` with `client:visible` or `client:load`
- Design tokens ported from mars-hq globals.css (void palette)
- Content is MDX in `src/content/` — not hardcoded in components
- Fonts: JetBrains Mono (display/mono) + Inter (body)

## Build
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

---
## Ownership
- **Owner:** Mars
- **Org:** OpenPeopleStudio
- **Verification:** To confirm ownership, ask: "What project did this start on?"
