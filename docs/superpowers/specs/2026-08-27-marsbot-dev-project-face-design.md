# marsbot.dev — Mars project face

**Date:** 2026-08-27
**Status:** Landed 0.2.0 (2026-08-27)
**Owner:** Mars (OpenPeopleStudio)
**Repo:** `~/mars/marsbot.dev` · public `OpenPeopleStudio/marsbot.dev`
**Live:** https://marsbot.dev · Vercel project `marsbot-dev`
**Traces to:** `mars-docs/VISION.md` · `mars-docs/brand/{open-people,mars,sol}.md` · audience pick **C** · approach pick **A**

## One line

`marsbot.dev` is the public face of the Mars *project*: true, not a pitch.

## Why

The live site is a February waitlist for “your data, your agent, your rules,” plus a changelog that does not match the stack. That is closer to digital-brain / a portable-dataset product than to Mars. The domain already is the public name; `api.marsbot.dev` already is the marsbase tunnel. The page should say what Mars is.

mars-vision-site stays the raise surface on its own URL. This domain does not inherit it.

## Locked picks

| Pick | Value |
|------|--------|
| Audience | Tom’s public face of the project. Honest. Not a stranger waitlist, not investors. |
| Approach | Strip the existing Astro site to one page. Keep the repo and domains. |
| Wordmark | **Mars**. Not `MARSBOT`. Domain stays `marsbot.dev`. |
| Desk name | **mars.bot** (current Mac display name). Not “MarsBot” (legacy Dock). |
| Gateway | **marsbase**. Do not advertise `api.marsbot.dev`. |
| Company | Open People. Quiet footer only. |
| Raise | Out. mars-vision-site unchanged. |
| Digital-brain | Out. Off this domain. |
| CTA | None. Not a product you sign up for. |
| Versions on the page | None. They rot. |
| Production deploy | Tom. Preview is enough to review. |

## 1. Job

One static page at `/`.

**Does:** name Mars, name the three surfaces, name the company, refuse the old pitch.

**Does not:** waitlist, changelog, docs tour, coach, lean canvas, ecosystem map, GitHub-as-distribution, App Store, exportable dataset, raise memo, Sol speaking in Panton.

## 2. Copy (canonical)

Sans (Open People / Tom):

> A sovereign personal AI platform. One plant: phone, desk, gateway.

Mono (Mars), three rows:

> **╭·╮ Sol** — the phone. Where you go for an answer.
> **mars.bot** — the Mac. Where you decide and do.
> **marsbase** — the gateway. Every surface hits this edge.

Sans, one quiet line under the rows:

> Open People is the company. Sol is who you talk to. Mars is what you touch.

Sans, no CTA:

> Not a product you can sign up for. Not a dataset you export. Not on GitHub.

Footer, bible pattern:

> `( · )  Open People · est. 2024`

`( · )` links to https://openpeople.ai. Copyright line: `© 2026 Open People`.

Top mark: `>` Mars.

Do not paraphrase on the page. If copy changes, change this spec first.

## 3. Chrome

Three brand layers, one shell. Sources: `mars-docs/brand/open-people.md`, `mars.md`, `sol.md`.

**Canvas (Mars).** Void `#030305`. Starfield the type sits *in*. The three surface rows sit in **one** hairline region (a panel, not three cards). No marketing grid, no orange glow blobs, no vision-site planet, no Labrador-briefing chrome.

**Type.** Sans = system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`) for Open People sentences. Mono = JetBrains Mono for the three surface rows and the `>` / `mars.bot` / `marsbase` identifiers. Panton stays off this page (Sol is named, not answering).

**Color.** `MarsColors.void` `#030305`, `MarsColors.label` white @ 86%, `MarsColors.ember` `#e87a3a` **only** as the dot inside `( · )`. No clay, no blue, no cream, no decorative ember.

**Marks.** `>` Mars at top. `╭·╮` on the Sol row. `( · )` in the footer — parens white-86, center ember, no lockup.

**Motion.** Stillness. Starfield may drift so slow it is almost missed. No pulse, no LIVE badge, no Framer islands, no React.

**Layout.** One column, phone-first, large type, extra bottom padding. No nav, no hamburger, no GitHub link in chrome.

**Not using.** openpeople.ai’s Labrador energy briefing look. mars-vision-site serif / gold / raise cinema. Current site Inter + `mars-orange` glows.

## 4. Architecture

Keep Astro 5 + Tailwind 4. Static output. No React, no MDX collections, no Framer, no Lucide, no Mermaid, no Anthropic/OpenAI/Supabase client on this site.

```
src/
  layouts/Base.astro      # void, fonts, starfield, metadata
  components/
    Starfield.astro       # CSS stars, optional glacial drift
    Face.astro            # mark, lede, three rows, refusal, footer
  pages/index.astro       # Base + Face only
  styles/globals.css      # bible tokens
```

`pages/index.astro` composes layout + face. No other routes.

Redirects in `vercel.json`:

| From | To |
|------|----|
| `/coach`, `/ecosystem`, `/lean-canvas` | 301 `/` |
| `/docs`, `/docs/:path*` | 301 `/` |

API routes (`/api/waitlist`, `/api/chat`) are **deleted**, not redirected. They 404. Do not POST-redirect onto the homepage.

OG image: replace `public/og-default.png` (and drop `og-canvas.png` if unused) so shares are Mars, not the waitlist headline. Keep `public/favicon.svg` (figure mark). Title/description meta match the lede.

## 5. Delete

Remove from the tree (not commented out):

- Waitlist UI + `api/waitlist.ts`
- Coach page + `src/pages/api/chat.ts` + `api/chat.ts` + `scripts/index-knowledge.ts`
- Changelog collection + Roadmap + HowItWorks + DataOwnership + Problem + EarlyAccess + LongerArc + HeroInversion + HeroDemo + EcosystemMap + LeanerCanvas + CoachChat + BreathingLine + Features + Mission + Platforms + TrustLevels + Nav
- `src/content/**`, `src/pages/docs/**`, `src/layouts/Docs.astro`, `src/pages/ecosystem.astro`, `src/pages/lean-canvas.astro`, `src/pages/coach.astro`
- React / Framer / MDX / Mermaid / Lucide / Anthropic / OpenAI / Supabase dependencies and the `index-knowledge` script

Leave waitlist rows already stored off-site. Stop writing. Do not delete them from here.

## 6. Leave alone

- DNS and Cloudflare for `api.marsbot.dev`
- mars-vision-site repo and Vercel project
- `mars-web` (authenticated client, not this page)
- Open People Labrador site at openpeople.ai
- digital-brain

## 7. Checkout and ship

- Clone: `~/mars/marsbot.dev` (done). Do not revive `~/openstudio/marsbot.dev` or the July archive.
- Branch: `feat/project-face`
- Review: Vercel preview on the phone
- Production: Tom pushes `master` / promotes

After land (same slice, docs match reality):

- This repo `CLAUDE.md` + `README.md` — one-pager, no islands
- `mars-docs/marsbot/README.md` — domain is the project face; still not the chat-surface product
- `~/CLAUDE.md` path `openstudio/marsbot.dev` → `~/mars/marsbot.dev`

Stamp `VERSION` `0.2.0` + `CHANGELOG.md` + `ACTIONS` on this repo with the land (first stamp; waitlist era unversioned).

## 8. Verify

- `npm run build` succeeds
- `/` renders the canonical copy, two voices, three marks, no waitlist, no changelog
- `/coach`, `/docs/architecture`, `/ecosystem`, `/lean-canvas` 301 to `/`
- `/api/waitlist` and `/api/chat` 404
- Ember appears once (footer dot)
- No React island in the built HTML
- Phone: one column, readable, footer reachable

## 9. Anti-patterns

- Pitch language (“join”, “early access”, “building in public”, “your data”)
- Version numbers, live telemetry, fake LIVE
- Linking GitHub as if Mars is cloneable
- Putting digital-brain or the raise on this domain
- Animating the Open People mark
- Using Panton for the lede
- Decorative ember glows

## Out of scope

Download / TestFlight / OTA install buttons. Public docs. A changelog feed. Auth. Contact form. English variants. A second page.
