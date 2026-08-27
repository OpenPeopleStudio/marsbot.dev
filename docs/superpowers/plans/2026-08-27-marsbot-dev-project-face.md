# Mars project-face Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace marsbot.dev with a static one-pager that is the honest public face of Mars.

**Architecture:** Keep Astro 5 + Tailwind 4, drop React/MDX/islands. Canonical copy lives in `src/copy.ts` (tested). One layout, one starfield, one face component. Old routes 301 in `vercel.json`; API files are deleted (404). No waitlist, no changelog, no docs.

**Tech Stack:** Astro 5, Tailwind 4, TypeScript, Node test runner (`tsx --test`), Vercel static.

**Spec:** `docs/superpowers/specs/2026-08-27-marsbot-dev-project-face-design.md`

---

## File map

| File | Job |
|------|-----|
| `src/copy.ts` | Canonical strings. Page imports these. Tests lock them. |
| `src/layouts/Base.astro` | html/head, void, fonts (system sans + JetBrains Mono), starfield slot |
| `src/components/Starfield.astro` | CSS stars, glacial drift, `prefers-reduced-motion` |
| `src/components/Face.astro` | Mark, lede, three-row panel, refusal, Open People footer |
| `src/pages/index.astro` | Base + Starfield + Face |
| `src/styles/globals.css` | Bible tokens only |
| `astro.config.mjs` | Astro + Tailwind. No React, no MDX |
| `vercel.json` | 301s for retired pages |
| `tests/copy.test.ts` | Copy exactness |
| `tests/face.build.test.ts` | Built HTML + vercel.json + no islands |
| `public/og-default.png` | Mars share card |
| `VERSION` `CHANGELOG.md` `ACTIONS` | First stamp `0.2.0` |

---

### Task 1: Copy module (TDD)

**Files:**
- Create: `src/copy.ts`
- Create: `tests/copy.test.ts`
- Modify: `package.json` (add `"test": "tsx --test tests/*.test.ts"`)

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { COPY } from "../src/copy.ts";

test("lede is the locked sentence", () => {
  assert.equal(
    COPY.lede,
    "A sovereign personal AI platform. One plant: phone, desk, gateway.",
  );
});

test("three surfaces", () => {
  assert.equal(COPY.sol.name, "Sol");
  assert.equal(COPY.sol.line, "the phone. Where you go for an answer.");
  assert.equal(COPY.desk.name, "mars.bot");
  assert.equal(COPY.desk.line, "the Mac. Where you decide and do.");
  assert.equal(COPY.gateway.name, "marsbase");
  assert.equal(COPY.gateway.line, "the gateway. Every surface hits this edge.");
});

test("marks", () => {
  assert.equal(COPY.marks.mars, ">");
  assert.equal(COPY.marks.sol, "╭·╮");
  assert.equal(COPY.marks.openPeople, "( · )");
});

test("refusal and layers", () => {
  assert.equal(
    COPY.layers,
    "Open People is the company. Sol is who you talk to. Mars is what you touch.",
  );
  assert.equal(
    COPY.refusal,
    "Not a product you can sign up for. Not a dataset you export. Not on GitHub.",
  );
});

test("footer", () => {
  assert.equal(COPY.wordmark, "Mars");
  assert.equal(COPY.footer.studio, "Open People · est. 2024");
  assert.equal(COPY.footer.copyright, "© 2026 Open People");
  assert.equal(COPY.footer.href, "https://openpeople.ai");
});

test("meta uses lede, not waitlist pitch", () => {
  assert.equal(COPY.title, "Mars");
  assert.equal(COPY.description, COPY.lede);
  assert.doesNotMatch(COPY.description, /waitlist|your data|early access/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ~/mars/marsbot.dev && npx tsx --test tests/copy.test.ts
```

Expected: FAIL — `src/copy.ts` not found.

- [ ] **Step 3: Write `src/copy.ts`**

```ts
export const COPY = {
  wordmark: "Mars",
  title: "Mars",
  lede: "A sovereign personal AI platform. One plant: phone, desk, gateway.",
  layers:
    "Open People is the company. Sol is who you talk to. Mars is what you touch.",
  refusal:
    "Not a product you can sign up for. Not a dataset you export. Not on GitHub.",
  marks: {
    mars: ">",
    sol: "╭·╮",
    openPeople: "( · )",
  },
  sol: {
    name: "Sol",
    line: "the phone. Where you go for an answer.",
  },
  desk: {
    name: "mars.bot",
    line: "the Mac. Where you decide and do.",
  },
  gateway: {
    name: "marsbase",
    line: "the gateway. Every surface hits this edge.",
  },
  footer: {
    studio: "Open People · est. 2024",
    copyright: "© 2026 Open People",
    href: "https://openpeople.ai",
  },
} as const;

export const COPY_DESCRIPTION = COPY.lede;
```

Set `COPY.description` as alias: add `description: COPY.lede` — can't self-ref in object literal easily. Use:

```ts
const lede = "A sovereign personal AI platform. One plant: phone, desk, gateway.";
export const COPY = { ..., lede, description: lede, title: "Mars", ...}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx tsx --test tests/copy.test.ts
```

Expected: PASS (6 tests).

- [ ] **Step 5: Add npm test script. Commit**

```bash
git add src/copy.ts tests/copy.test.ts package.json
git commit -m "test: lock Mars project-face copy"
```

---

### Task 2: Redirect + build smoke tests (TDD, fail on current site)

**Files:**
- Create: `tests/face.build.test.ts`

- [ ] **Step 1: Write failing build tests**

```ts
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { COPY } from "../src/copy.ts";

const html = () => readFileSync("dist/index.html", "utf8");

test("index contains locked copy", () => {
  const page = html();
  assert.match(page, new RegExp(COPY.lede.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(page, /mars\.bot/);
  assert.match(page, /marsbase/);
  assert.match(page, /╭·╮/);
  assert.match(page, /\( · \)/);
  assert.match(page, new RegExp(COPY.refusal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("index is not the waitlist pitch", () => {
  const page = html();
  assert.doesNotMatch(page, /Join waitlist/i);
  assert.doesNotMatch(page, /early access/i);
  assert.doesNotMatch(page, /your data, your agent/i);
  assert.doesNotMatch(page, /client:load/);
  assert.doesNotMatch(page, /HeroInversion/);
});

test("vercel.json 301s retired pages, not APIs", () => {
  const cfg = JSON.parse(readFileSync("vercel.json", "utf8"));
  const sources = (cfg.redirects ?? []).map((r: { source: string }) => r.source);
  for (const s of ["/coach", "/ecosystem", "/lean-canvas", "/docs", "/docs/:path*"]) {
    assert.ok(sources.includes(s), `missing redirect ${s}`);
  }
  const apis = (cfg.redirects ?? []).map((r: { source: string }) => r.source);
  assert.ok(!apis.includes("/api/waitlist"));
  assert.ok(!apis.includes("/api/chat"));
});

test("retired API files are gone", () => {
  assert.equal(existsSync("api/waitlist.ts"), false);
  assert.equal(existsSync("api/chat.ts"), false);
  assert.equal(existsSync("src/pages/api/chat.ts"), false);
});
```

- [ ] **Step 2: `npm test` — copy tests pass; build tests fail** (no dist or old HTML / old vercel.json).

- [ ] **Step 3: Do not fix yet.** Next tasks make them green.

---

### Task 3: Tokens, Base, Starfield, Face, index

**Files:**
- Modify: `src/styles/globals.css` (replace)
- Modify: `src/layouts/Base.astro` (replace)
- Create: `src/components/Starfield.astro`
- Create: `src/components/Face.astro`
- Modify: `src/pages/index.astro` (replace)

Tokens:

```css
:root {
  --void: #030305;
  --label: rgba(255, 255, 255, 0.86);
  --label-muted: rgba(255, 255, 255, 0.55);
  --ember: #e87a3a;
  --stroke: rgba(255, 255, 255, 0.075);
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

Base: title/description from `COPY`. Fonts: JetBrains Mono from Google only (no Inter). Body: void, sans default.

Starfield: absolute inset-0, pointer-events none, ~80 stars via box-shadow on two pseudo-elements, animation `star-drift 180s linear infinite`, `@media (prefers-reduced-motion: reduce) { animation: none }`.

Face: import COPY. Structure:

```
<header> > Mars </header>
<p class="lede">COPY.lede</p>
<div class="panel">
  ╭·╮ Sol — line
  mars.bot — line
  marsbase — line
</div>
<p class="layers">COPY.layers</p>
<p class="refusal">COPY.refusal</p>
<footer>
  <a href=footer.href>( · )  Open People · est. 2024</a>
  <span>© 2026 Open People</span>
</footer>
```

One hairline panel around the three rows. Ember only on the footer middle dot (span.ember inside the parens). Phone-first: max-width ~36rem, padding, padding-bottom 6rem. Type: lede/layers/refusal/footer sans; header + panel rows mono.

index.astro:

```astro
---
import Base from "../layouts/Base.astro";
import Starfield from "../components/Starfield.astro";
import Face from "../components/Face.astro";
import { COPY } from "../copy.ts";
---
<Base title={COPY.title} description={COPY.description}>
  <Starfield />
  <Face />
</Base>
```

- [ ] **Step: Implement the five files. No other routes yet.**

---

### Task 4: Strip the old site

**Delete:**

- `api/waitlist.ts`, `api/chat.ts`, `src/pages/api/chat.ts`, `scripts/index-knowledge.ts`
- `src/pages/coach.astro`, `ecosystem.astro`, `lean-canvas.astro`, `src/pages/docs/**`
- `src/layouts/Docs.astro`
- `src/content/**`
- All unused components (Nav, Hero, HeroInversion, HeroDemo, Problem, HowItWorks, DataOwnership, EarlyAccess, Roadmap, Changelog, LongerArc, Footer, Features, Mission, Platforms, TrustLevels, BreathingLine, CoachChat, EcosystemMap, LeanerCanvas, docs/*)
- `src/styles/global.css` if unused
- `public/og-canvas.png`
- `docs/COACH-CHAT-HANDOFF.md` and old hero/ecosystem plans (optional; leave if not blocking)

`astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://marsbot.dev",
  vite: {
    plugins: [tailwindcss()],
    cacheDir: "/tmp/vite-marsbot-cache",
  },
});
```

`vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "redirects": [
    { "source": "/coach", "destination": "/", "statusCode": 301 },
    { "source": "/ecosystem", "destination": "/", "statusCode": 301 },
    { "source": "/lean-canvas", "destination": "/", "statusCode": 301 },
    { "source": "/docs", "destination": "/", "statusCode": 301 },
    { "source": "/docs/:path*", "destination": "/", "statusCode": 301 }
  ]
}
```

`package.json` dependencies: astro, @tailwindcss/vite, tailwindcss, typescript. Dev: tsx, @types/node. Remove react, framer-motion, lucide, mermaid, mdx, anthropic, openai, supabase, dotenv.

- [ ] **Step: Delete + config. `npm install`. `npx astro build`. `npm test` all green.**

- [ ] **Commit:** `feat: Mars project-face one-pager`

---

### Task 5: OG image + meta

Replace `public/og-default.png` with a 1200×630 void card: wordmark Mars, no waitlist headline. Generate or draw. Confirm Base og:title is Mars, og:description is the lede.

- [ ] **Commit:** `feat: Mars OG card for project face`

---

### Task 6: Stamp + repo docs

- `VERSION` → `0.2.0`
- `CHANGELOG.md` prepend 0.2.0
- `ACTIONS` prepend `0.2.0 tools=<n>`
- Rewrite `CLAUDE.md` and `README.md` for the one-pager
- Spec status → Approved, landed

- [ ] **Commit:** `docs: stamp 0.2.0 project face`

---

### Task 7: Sister docs (other git roots)

- `~/mars/mars-docs/marsbot/README.md` — What's NOT marsbot: marketing site line becomes “`marsbot.dev` is the project face, not the chat-surface product”
- `~/CLAUDE.md` path `openstudio/marsbot.dev` → `~/mars/marsbot.dev`

Separate commits per git root. Do not `git add -A` from the hub.

---

### Task 8: Verify

```bash
npm test
npx astro build
```

Check `dist/index.html` by eye: two voices, one ember, no waitlist, no React. Preview is Tom’s (Vercel preview after he pushes). Do not production-deploy.

---

## Spec coverage

| Spec § | Task |
|--------|------|
| Copy canonical | 1, 3 |
| Chrome / tokens / marks / stillness | 3 |
| Architecture files | 3 |
| Redirects vs API 404 | 2, 4 |
| Delete list | 4 |
| Leave api.marsbot.dev / vision-site / digital-brain | 4 (no touch) |
| OG + favicon | 5 (favicon keep) |
| VERSION trio + CLAUDE/README | 6 |
| mars-docs + ~/CLAUDE.md | 7 |
| Verify list | 8 |
