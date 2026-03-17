# Coach Chat — Claude Code Handoff Prompt

Paste the entire block below into a new Claude Code session inside `marsbot.dev/`.

---

```
You are continuing the implementation of the OpenPeople coach chat feature on marsbot.dev.

## What has been built

The foundation is complete and the Astro build passes cleanly. Here is exactly what exists:

**`api/chat.ts`** (root-level Vercel Edge Function)
- Full system prompt with three-tier accuracy model (project facts / reasoned inference / AI thesis)
- Complete project context: lean canvas, technical architecture, traction roadmap, restaurant proof case, Andrew Collingwood opportunity
- 10 pre-built Mermaid diagrams embedded in the system prompt (data flywheel, trust architecture, competitive positioning, system architecture, etc.)
- Streaming response via Anthropic claude-sonnet-4-6
- Uses `process.env.ANTHROPIC_API_KEY`

**`src/components/CoachChat.tsx`** (React island)
- Full streaming chat UI matching the void aesthetic (dark palette, mars-orange accents, JetBrains Mono)
- Mermaid diagram rendering via dynamic import (client-side only, thème sombre)
- Message content parser: handles mermaid blocks, code blocks, bold, inline code, headings, bullets
- 6 suggested prompts on empty state
- Streaming cursor, abort on reset, auto-resize textarea
- Sends to `/api/chat`

**`src/pages/coach.astro`**
- Static Astro page at `/coach`
- Full-height chat layout (100vh - nav)
- Header with context tags (canvas / architecture / thesis / traction)
- Loads `<CoachChat client:load />`

## What still needs to be done

### 1. Polish the CoachChat component
- The streaming dots animation uses an inline style `animation: pulse...` but the `@keyframes pulse` is defined in `coach.astro`. Move the keyframes into `globals.css` OR define them inline in the component with a `<style>` tag injected via `useEffect` so they work regardless of page.
- The scroll-to-bottom button uses `absolute` positioning but the parent is `flex flex-col`. Fix to use `sticky bottom-4 self-end` within the messages area instead.
- On mobile, the suggestion grid should be 1 column (it already is with `grid-cols-1 sm:grid-cols-2` but verify it looks right at 375px).
- Add a subtle gradient fade at the top of the message area when scrolled down (so it's clear there are messages above).

### 2. Add the chat to the main site navigation
In `src/components/Nav.astro`, add a "Coach" or "Ask" link to the nav that points to `/coach`. Match the existing nav link style. Keep it subtle — this isn't a primary nav item.

### 3. Add a `vercel.json` at project root to ensure the edge function is picked up correctly:
```json
{
  "functions": {
    "api/chat.ts": {
      "runtime": "edge"
    }
  }
}
```

### 4. Environment variable
The API route reads `process.env.ANTHROPIC_API_KEY`. Add this to:
- Vercel project settings → Environment Variables → `ANTHROPIC_API_KEY`
- Local dev: create `.env.local` in the project root with `ANTHROPIC_API_KEY=sk-ant-...`

### 5. Test locally
Run `npx vercel dev` (not `astro dev`) to test the edge function locally. The Astro static pages will serve fine; the `/api/chat` endpoint needs the Vercel dev runtime to test the streaming.

### 6. Context database (Phase 2 — separate task)
This is NOT required for the initial coach deployment. The current system prompt already contains the full project context and will answer accurately. Phase 2 is:
- Create a Supabase table `coach_knowledge` with pgvector
- Chunk and embed all project documents (lean-canvas-working.md, business plan, CLAUDE.md files from mars-hq/mac/mobile/open-people)
- Replace the static `PROJECT_CONTEXT` constant in `api/chat.ts` with a dynamic retrieval step using cosine similarity
- Add a script `scripts/index-knowledge.ts` that runs the chunking + embedding pipeline

## Design constraints to respect
- Void palette: `--void: #020304`, `--surface-1: #070a0e`, `--surface-2: #0c1017`, `--surface-elevated: #171e28`
- Brand accent: `--mars-orange: #e8622a`
- Text: `--text-primary: #e8ecf1`, `--text-secondary: #8893a4`, `--text-muted: #505b6b`
- Fonts: JetBrains Mono (display/mono), Inter (body)
- Borders: `--border-subtle`, `--border-medium`, `--border-strong`
- All interactive components are `.tsx` React islands with `client:load` or `client:visible`
- Never use unicode bullets in docx — not relevant here but worth noting for consistency
- The site deploys to Vercel. Do not introduce server-side Astro rendering (no adapter needed).

## File locations
- `marsbot.dev/api/chat.ts` — Vercel edge function (the brain)
- `marsbot.dev/src/components/CoachChat.tsx` — React chat island
- `marsbot.dev/src/pages/coach.astro` — The page
- `marsbot.dev/src/components/Nav.astro` — Add the nav link here
- `marsbot.dev/src/styles/globals.css` — Add keyframes here if moving from coach.astro

## Build command
```bash
npx astro build
```
Build should complete with no errors. Current output: `/coach/index.html` generated, all other pages static.
```

---

## Notes for the session

- The build currently passes cleanly with `npx astro build`
- The `api/chat.ts` root-level file is the Vercel serverless function — Astro does not touch it
- The `src/pages/api/chat.ts` file has `export const prerender = true` and is effectively a stub — it can be cleaned up or left as-is
- `mermaid` is installed as an npm dependency and dynamically imported client-side
- `@anthropic-ai/sdk` is installed
- `@astrojs/vercel` is installed but NOT used in `astro.config.mjs` (we removed it to avoid the version incompatibility with Astro 5.18)
