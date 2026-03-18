# Ecosystem Map + HeroInversion Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix ecosystem map detail panels clipping out of view, and sharpen HeroInversion copy to be investor-facing across all 4 scenes.

**Architecture:** Two isolated component edits. EcosystemMap.tsx gets the DetailPanel moved outside the map container into a BottomSheet below it. HeroInversion.tsx gets copy-only changes to constants and inline strings — no structural changes.

**Tech Stack:** React 19, Framer Motion 12, Astro 5, Tailwind CSS 4, TypeScript

---

### Task 1: Ecosystem Map — Move DetailPanel to BottomSheet

**Files:**
- Modify: `src/components/EcosystemMap.tsx`

**Step 1: Remove `overflow-hidden` from the map container**

In `EcosystemMap`, change:
```tsx
className="relative w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] overflow-hidden"
```
to:
```tsx
className="relative w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)]"
```
This prevents nodes near edges from being clipped.

**Step 2: Replace `DetailPanel` component with `BottomSheet`**

Delete the entire `DetailPanel` function (lines 233–302) and replace with:

```tsx
function BottomSheet({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const color = STATUS_COLORS[project.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="w-full max-w-2xl mx-auto mt-3"
    >
      <div
        className="rounded-xl border p-4 sm:p-5"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-medium)",
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              {project.name}
            </span>
            <span
              className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                color,
                background: `color-mix(in srgb, ${color} 12%, transparent)`,
              }}
            >
              {project.status}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="shrink-0 text-xs font-mono transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            ✕
          </button>
        </div>

        <p className="text-[11px] font-mono mb-2" style={{ color: "var(--mars-orange)" }}>
          {project.role}
        </p>
        <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-[9px] font-mono px-2 py-0.5 rounded"
              style={{
                color: "var(--text-muted)",
                background: "var(--surface-2)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
```

**Step 3: Update `EcosystemMap` return to wrap map + BottomSheet**

Replace the current return with:

```tsx
export default function EcosystemMap() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedProject = PROJECTS.find((p) => p.id === selected);

  return (
    <div>
      {/* Map */}
      <div
        className="relative w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)]"
        style={{ minHeight: "500px" }}
        onClick={() => setSelected(null)}
      >
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none rounded-xl" />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--mars-orange)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

        {/* Connection lines */}
        <ConnectionLines selected={selected} />

        {/* Project nodes */}
        {PROJECTS.map((project) => (
          <ProjectNode
            key={project.id}
            project={project}
            isSelected={selected === project.id}
            onClick={(e) => {
              (e as unknown as Event).stopPropagation();
              setSelected(selected === project.id ? null : project.id);
            }}
          />
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[9px] font-mono text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
            Shipped
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--mars-orange)" }} />
            Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--warning)" }} />
            Beta
          </span>
        </div>
      </div>

      {/* Bottom sheet — outside map, never clips */}
      <AnimatePresence>
        {selectedProject && (
          <BottomSheet
            key={selectedProject.id}
            project={selectedProject}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 4: Build and verify**

```bash
cd ~/openstudio/marsbot.dev && npm run build
```
Expected: `[build] Complete!` with no errors.

**Step 5: Commit**

```bash
git add src/components/EcosystemMap.tsx
git commit -m "fix: ecosystem map — bottom sheet replaces clipping detail panel"
```

---

### Task 2: HeroInversion — Sharper Copy

**Files:**
- Modify: `src/components/HeroInversion.tsx`

**Step 1: Update TYPEWRITER_TEXT constant**

```tsx
// Old
const TYPEWRITER_TEXT = "What if your AI actually worked for you?";

// New
const TYPEWRITER_TEXT = "Your AI should run on your hardware, speak your language, and answer to you alone.";
```

**Step 2: Update STACK_LAYERS sublabels**

```tsx
const STACK_LAYERS = [
  { label: "Gateway", sublabel: "always-on · never leaves home" },
  { label: "Runtime", sublabel: "budget-aware · skill-routed" },
  { label: "Channels", sublabel: "meets you where you are" },
  { label: "Surfaces", sublabel: "native on every screen" },
];
```

**Step 3: Update SceneAwakening subtitle**

In `SceneAwakening`, find:
```tsx
<span className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
  personal OS for AI agents
</span>
```
Change to:
```tsx
<span className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
  hardware-native · trust-gated · fully yours
</span>
```

**Step 4: Update SceneProof — add headline and update CTA**

In `SceneProof`, add a headline above the stats grid:
```tsx
function SceneProof() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-5">
      <motion.p
        className="font-mono font-bold text-sm sm:text-base text-center"
        style={{ color: "var(--text-secondary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        Not a wrapper. A runtime.
      </motion.p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-lg">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} value={stat.value} label={stat.label} delayMs={i * 130} />
        ))}
      </div>
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <a href="/coach" className="btn-primary text-sm">Talk to the Coach</a>
        <a href="/docs" className="btn-secondary text-sm">Read the Docs</a>
      </motion.div>
    </div>
  );
}
```

**Step 5: Update ReducedMotionView CTA to match**

Find `"Try the Coach"` in `ReducedMotionView` and change to `"Talk to the Coach"`.

**Step 6: Build and verify**

```bash
npm run build
```
Expected: `[build] Complete!` with no errors.

**Step 7: Commit**

```bash
git add src/components/HeroInversion.tsx
git commit -m "fix: HeroInversion — sharper investor-facing copy across all 4 scenes"
```

---

### Task 3: Push

```bash
git push origin master
```

---

## Verification Checklist

- [ ] `npm run build` — clean, no errors
- [ ] Ecosystem: click all 7 nodes — panel appears below map, always fully visible
- [ ] Ecosystem: mobile 375px — bottom sheet readable, no overflow
- [ ] Hero: Scene 1 typewriter shows new text
- [ ] Hero: Scene 2 subtitle shows "hardware-native · trust-gated · fully yours"
- [ ] Hero: Scene 3 sublabels are benefit-first
- [ ] Hero: Scene 4 shows "Not a wrapper. A runtime." headline + "Talk to the Coach" CTA
- [ ] Hero: reduced motion fallback shows new CTA text
