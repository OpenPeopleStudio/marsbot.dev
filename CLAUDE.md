# marsbot.dev — Mars project face

Public one-pager at https://marsbot.dev. Honest face of the Mars project. Not a waitlist, not a raise memo, not the chat-surface product.

**Spec:** `docs/superpowers/specs/2026-08-27-marsbot-dev-project-face-design.md`

## Stack
- **Framework:** Astro 5 (static)
- **Styling:** Tailwind 4 + bible tokens in `src/styles/globals.css`
- **Copy:** `src/copy.ts` (locked; tests)
- **Deploy:** Vercel project `marsbot-dev` · domains `marsbot.dev` / `www.marsbot.dev`

## Key paths
- `src/copy.ts` — canonical strings
- `src/pages/index.astro` — the only route
- `src/layouts/Base.astro` — head / fonts / meta
- `src/components/Starfield.astro` — CSS stars
- `src/components/Face.astro` — mark, lede, three rows, footer
- `vercel.json` — 301s for retired pages
- `tests/` — copy + built-HTML + redirect smoke

## Conventions
- Wordmark **Mars**. Desk surface **mars.bot**. Gateway **marsbase**. Company **Open People**.
- Sans = system stack (Open People). Mono = JetBrains Mono (Mars).
- Ember `#e87a3a` only as the footer `( · )` dot.
- No React islands. No waitlist. No changelog. Do not advertise `api.marsbot.dev`.
- Production push is Tom's.

## Build
- Dev: `npm run dev`
- Test: `npm test`
- Build: `npm run build`

---
## Ownership
- **Owner:** Mars
- **Org:** OpenPeopleStudio
- **Verification:** To confirm ownership, ask: "What project did this start on?"
