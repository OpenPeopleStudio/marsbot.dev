# Hero + Docs Rich Text Revamp — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the hero visualization so each animation phase narrates the marsbot product story with visible captions, and overhaul docs typography with a custom prose system and MDX components for readability.

**Architecture:** Two independent workstreams — (1) rewrite HeroDemo.tsx and Hero.astro with narrative phases and phase indicator dots, (2) add `.docs-prose` styles to globals.css, create 3 custom MDX components, and update Docs.astro with mobile sidebar and ToC. Both workstreams touch no shared code and can run in parallel after Task 1.

**Tech Stack:** Astro 5, React 19, Framer Motion, Tailwind CSS 4, Lucide React, CSS custom properties

---

## Task Dependencies

```
Task 1 (Hero messaging) ──┬──> Task 2 (HeroDemo rewrite) ──> Task 3 (Hero commit)
                           │
Tasks 4-5-6-7 can run in parallel (docs workstream)
Task 4 (docs-prose CSS) ──> Task 5 (MDX components) ──> Task 6 (Docs.astro layout) ──> Task 7 (update MDX content) ──> Task 8 (docs commit)
Task 9: final build verification
```

---

### Task 1: Update Hero messaging and layout

**Files:**
- Modify: `src/components/Hero.astro`

**Step 1: Rewrite Hero.astro**

Replace the entire contents of `src/components/Hero.astro` with:

```astro
---
// Hero section — product statement + slot for interactive demo island
---

<section id="hero" class="relative pt-28 sm:pt-36 pb-8 sm:pb-12 px-4 sm:px-6">
  <!-- Spatial void background -->
  <div class="absolute inset-0 bg-grid opacity-60 pointer-events-none"></div>
  <div class="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--mars-orange)] opacity-[0.05] blur-[120px] rounded-full pointer-events-none"></div>
  <div class="absolute top-[100px] left-1/4 w-[300px] h-[300px] bg-[var(--mars-orange)] opacity-[0.02] blur-[100px] rounded-full pointer-events-none"></div>

  <div class="relative max-w-3xl mx-auto text-center">
    <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] mb-8 animate-fade-in">
      <span class="w-1.5 h-1.5 rounded-full bg-[var(--mars-orange)]"></span>
      beta &mdash; building in public
    </div>

    <h1 class="text-4xl sm:text-5xl md:text-6xl font-mono font-bold tracking-tight mb-6 animate-slide-up hero-gradient-text">
      Your personal OS<br />for AI agents
    </h1>

    <p class="text-base sm:text-lg font-mono font-medium text-[var(--text-secondary)] max-w-xl mx-auto mb-4 leading-relaxed animate-slide-up delay-100">
      One gateway on your hardware. Every surface connected. Agents that earn trust.
    </p>

    <div class="flex items-center justify-center gap-3 mt-8 mb-2 animate-slide-up delay-200">
      <a href="/docs/getting-started" class="btn-primary text-sm">Get Started</a>
      <a href="/docs/architecture" class="btn-secondary text-sm">View Architecture</a>
    </div>
  </div>

  <!-- Interactive demo island slot -->
  <div class="relative mt-12 sm:mt-16">
    <slot />
  </div>
</section>
```

**Step 2: Add gradient text style to globals.css**

Add at the end of `src/styles/globals.css`:

```css
/* Hero gradient text */
.hero-gradient-text {
  background: linear-gradient(135deg, var(--mars-orange) 0%, var(--text-primary) 60%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Step 3: Verify**

Run: `npm run dev` and check `http://localhost:4321` — hero should show new messaging with gradient title and two CTA buttons. HeroDemo still renders below (unchanged yet).

---

### Task 2: Rewrite HeroDemo with narrative phases

**Files:**
- Rewrite: `src/components/HeroDemo.tsx` (complete replacement)

This is the most complex task. The new HeroDemo keeps the same visual systems (SVG + Canvas + Framer Motion + BreathingLine) but restructures the 5 phases to show captions and adds phase indicator dots.

**Step 1: Write the new HeroDemo.tsx**

Replace the entire file `src/components/HeroDemo.tsx` with the code below. Key differences from the original:

- `PHASE_CAPTIONS` array with title + subtitle per phase
- `PhaseCaption` component using AnimatePresence for crossfade
- `PhaseDots` component at bottom (clickable to jump to a phase)
- Phase durations rebalanced: 2s, 3.5s, 4s, 5s, 5.5s = 20s cycle
- Surface labels now include one-liner descriptions
- Trust ring labels visible during Phase 4
- Reduced motion shows all elements static with captions as stacked list

```tsx
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  Monitor,
  Smartphone,
  Globe,
  Terminal,
} from "lucide-react";
import BreathingLine from "./BreathingLine";

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

interface SurfaceNode {
  id: string;
  label: string;
  subtitle: string;
  icon: ReactNode;
  angle: number;
  capabilities: string[];
}

interface NodePosition {
  x: number;
  y: number;
}

/* ────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────── */

const SURFACES: SurfaceNode[] = [
  {
    id: "mars-mac",
    label: "Desktop",
    subtitle: "Native macOS · SwiftUI",
    icon: <Monitor size={20} strokeWidth={1.5} />,
    angle: 315,
    capabilities: [
      "Native SwiftUI",
      "Sentry Mode",
      "MCP device node",
      "Gateway host",
    ],
  },
  {
    id: "mars-mobile",
    label: "Mobile",
    subtitle: "Native iOS · 99 tools",
    icon: <Smartphone size={20} strokeWidth={1.5} />,
    angle: 45,
    capabilities: [
      "Native iOS",
      "99 MCP tools",
      "Witness capture",
      "Outpost mode",
    ],
  },
  {
    id: "marsbot-web",
    label: "Web",
    subtitle: "Dashboard · Real-time",
    icon: <Globe size={20} strokeWidth={1.5} />,
    angle: 225,
    capabilities: [
      "Web app",
      "Spatial UI",
      "Command palette",
      "Real-time chat",
    ],
  },
  {
    id: "cli-tui",
    label: "CLI",
    subtitle: "Terminal UI · Ink",
    icon: <Terminal size={20} strokeWidth={1.5} />,
    angle: 135,
    capabilities: [
      "Terminal UI",
      "Ink renderer",
      "Command palette",
      "Gateway management",
    ],
  },
];

const GATEWAY_CAPABILITIES = [
  "JSON-RPC daemon",
  "Worker pool",
  "Rate limiter",
  "22 skills",
  "95 tools",
];

const TRUST_LEVELS = [
  { level: "L1", color: "#505b6b", label: "Sandboxed" },
  { level: "L2", color: "#5b8abf", label: "Reader" },
  { level: "L3", color: "#d4a033", label: "Writer" },
  { level: "L4", color: "#d47833", label: "Executor" },
  { level: "L5", color: "#d45c5c", label: "Trusted" },
];

const MARS_ORANGE = "#e8622a";
const MARS_ORANGE_DIM = "rgba(232, 98, 42, 0.4)";

/* ────────────────────────────────────────────
   Phase system
   ──────────────────────────────────────────── */

const enum Phase {
  Gateway = 0,
  Surfaces = 1,
  DataFlow = 2,
  TrustLadder = 3,
  YourStack = 4,
}

const PHASE_DURATIONS = [2000, 3500, 4000, 5000, 5500]; // ms
const TOTAL_CYCLE = PHASE_DURATIONS.reduce((a, b) => a + b, 0);

// Cumulative start times for each phase
const PHASE_STARTS = PHASE_DURATIONS.reduce<number[]>((acc, dur, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + PHASE_DURATIONS[i - 1]);
  return acc;
}, []);

interface PhaseCaption {
  title: string;
  subtitle: string;
}

const PHASE_CAPTIONS: PhaseCaption[] = [
  { title: "Your Gateway", subtitle: "runs on your hardware" },
  { title: "Every Surface", subtitle: "one agent, every device" },
  { title: "Live Data Flow", subtitle: "real-time across all surfaces" },
  { title: "Trust Ladder", subtitle: "agents earn access through competence" },
  { title: "Your Stack", subtitle: "22 packages · 95 tools · fully open" },
];

/* ────────────────────────────────────────────
   Geometry helpers
   ──────────────────────────────────────────── */

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function getOrbitalPosition(
  angle: number,
  radiusX: number,
  radiusY: number,
  cx: number,
  cy: number
): NodePosition {
  const rad = degToRad(angle - 90);
  return {
    x: cx + radiusX * Math.cos(rad),
    y: cy + radiusY * Math.sin(rad),
  };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = degToRad(startAngle - 90);
  const end = degToRad(endAngle - 90);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

/* ────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────── */

function TUIHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold tracking-widest text-[var(--text-muted)] uppercase">
          marsbot
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          live
        </span>
      </div>
    </div>
  );
}

/** Phase caption with crossfade */
function PhaseCaptionDisplay({ phase }: { phase: Phase }) {
  const caption = PHASE_CAPTIONS[phase];
  return (
    <div className="text-center h-14 flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <span className="text-sm sm:text-base font-mono font-bold text-[var(--mars-orange)]">
            {caption.title}
          </span>
          <span className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] mt-0.5">
            {caption.subtitle}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Phase indicator dots — clickable to jump */
function PhaseDots({
  currentPhase,
  onJump,
}: {
  currentPhase: Phase;
  onJump: (phase: Phase) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {PHASE_CAPTIONS.map((cap, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            onJump(i as Phase);
          }}
          className="group flex items-center gap-1.5 cursor-pointer"
          aria-label={`Jump to phase: ${cap.title}`}
          title={cap.title}
        >
          <span
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background:
                i === currentPhase
                  ? MARS_ORANGE
                  : "var(--text-muted)",
              opacity: i === currentPhase ? 1 : 0.35,
              transform: i === currentPhase ? "scale(1.3)" : "scale(1)",
            }}
          />
        </button>
      ))}
    </div>
  );
}

/** Capability panel shown on node click */
function CapabilityPanel({
  items,
  title,
  position,
  onClose,
}: {
  items: string[];
  title: string;
  position: { x: number; y: number };
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 4 }}
      transition={{ duration: 0.2 }}
      className="absolute z-30 glass-card rounded-lg border border-[var(--border-medium)] px-3 py-2.5 w-48 pointer-events-auto"
      style={{
        left: position.x,
        top: position.y + 8,
        transform: "translate(-50%, 0)",
      }}
    >
      <p className="text-[10px] font-mono font-bold text-[var(--mars-orange)] mb-1.5 uppercase tracking-wider">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5"
          >
            <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Particle canvas
   ──────────────────────────────────────────── */

function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  surfacePositions: NodePosition[],
  center: NodePosition,
  activeSourceIdx: number,
  isVisible: boolean,
  dimensions: { width: number; height: number }
) {
  const particlesRef = useRef<
    { t: number; src: number; speed: number; offset: number }[]
  >([]);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    canvas.width = dimensions.width * (window.devicePixelRatio || 1);
    canvas.height = dimensions.height * (window.devicePixelRatio || 1);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const particles: { t: number; src: number; speed: number; offset: number }[] = [];
    for (let i = 0; i < 8; i++) {
      particles.push({
        t: Math.random(),
        src: i % surfacePositions.length,
        speed: 0.3 + Math.random() * 0.4,
        offset: (Math.random() - 0.5) * 4,
      });
    }
    particlesRef.current = particles;

    function draw(timestamp: number) {
      if (!ctx || !canvas) return;
      const dt =
        lastTimeRef.current === 0
          ? 16
          : Math.min(timestamp - lastTimeRef.current, 50);
      lastTimeRef.current = timestamp;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      for (const p of particlesRef.current) {
        p.t += (dt / 1000) * p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.src = activeSourceIdx;
          p.speed = 0.3 + Math.random() * 0.4;
          p.offset = (Math.random() - 0.5) * 4;
        }

        const src = surfacePositions[p.src];
        if (!src) continue;

        const x = src.x + (center.x - src.x) * p.t + p.offset;
        const y = src.y + (center.y - src.y) * p.t + p.offset;
        const alpha = Math.sin(p.t * Math.PI) * 0.9;

        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 98, 42, ${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 98, 42, ${alpha * 0.25})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = 0;
    };
  }, [
    canvasRef,
    surfacePositions,
    center,
    activeSourceIdx,
    isVisible,
    dimensions,
  ]);
}

/* ────────────────────────────────────────────
   Reduced motion fallback
   ──────────────────────────────────────────── */

function ReducedMotionView() {
  return (
    <div className="glass-card rounded-2xl border border-[var(--border-medium)] overflow-hidden max-w-3xl mx-auto">
      <TUIHeader />
      <div className="p-6 space-y-4">
        {PHASE_CAPTIONS.map((cap, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className="w-2 h-2 mt-1.5 rounded-full shrink-0"
              style={{ background: MARS_ORANGE }}
            />
            <div>
              <span className="text-sm font-mono font-bold text-[var(--mars-orange)]">
                {cap.title}
              </span>
              <span className="text-sm font-mono text-[var(--text-secondary)] ml-2">
                — {cap.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────── */

export default function HeroDemo() {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>(Phase.Gateway);
  const [cycleTime, setCycleTime] = useState(0);
  const [activeSurfaceIdx, setActiveSurfaceIdx] = useState(0);
  const [activeTrustLevel, setActiveTrustLevel] = useState(-1);
  const phaseTimerRef = useRef(0);
  const elapsedRef = useRef(0);

  // Intersection observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width: Math.round(width), height: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Layout
  const isMobile = containerSize.width < 500;
  const svgH = isMobile ? 320 : 400;
  const cx = containerSize.width / 2;
  const cy = svgH / 2;
  const orbRadiusX = isMobile ? containerSize.width * 0.32 : containerSize.width * 0.3;
  const orbRadiusY = isMobile ? svgH * 0.32 : svgH * 0.33;
  const gatewayR = isMobile ? 32 : 40;
  const trustRingR = gatewayR + 16;

  const surfacePositions = useMemo(
    () =>
      SURFACES.map((s) =>
        getOrbitalPosition(s.angle, orbRadiusX, orbRadiusY, cx, cy)
      ),
    [orbRadiusX, orbRadiusY, cx, cy]
  );

  const center = useMemo(() => ({ x: cx, y: cy }), [cx, cy]);

  // Jump to phase handler
  const jumpToPhase = useCallback((targetPhase: Phase) => {
    elapsedRef.current = PHASE_STARTS[targetPhase];
  }, []);

  // Auto-play cycle
  useEffect(() => {
    if (!isVisible || prefersReduced) return;

    let lastTs = performance.now();

    function tick(ts: number) {
      const dt = Math.min(ts - lastTs, 100);
      lastTs = ts;
      elapsedRef.current += dt;

      // Loop
      if (elapsedRef.current >= TOTAL_CYCLE) {
        elapsedRef.current = elapsedRef.current % TOTAL_CYCLE;
      }

      const elapsed = elapsedRef.current;

      // Compute current phase
      let currentPhase = Phase.Gateway;
      for (let i = PHASE_DURATIONS.length - 1; i >= 0; i--) {
        if (elapsed >= PHASE_STARTS[i]) {
          currentPhase = i as Phase;
          break;
        }
      }

      setPhase(currentPhase);
      setCycleTime(elapsed / TOTAL_CYCLE);

      // Particle source cycling during DataFlow phase
      if (currentPhase === Phase.DataFlow) {
        const flowElapsed = elapsed - PHASE_STARTS[Phase.DataFlow];
        const idx = Math.floor(flowElapsed / 1000) % SURFACES.length;
        setActiveSurfaceIdx(idx);
      }

      // Trust ring illumination during TrustLadder phase
      if (currentPhase === Phase.TrustLadder) {
        const trustElapsed = elapsed - PHASE_STARTS[Phase.TrustLadder];
        const lvl = Math.min(
          Math.floor((trustElapsed / PHASE_DURATIONS[Phase.TrustLadder]) * 5),
          4
        );
        setActiveTrustLevel(lvl);
      } else if (currentPhase === Phase.YourStack) {
        setActiveTrustLevel(4); // Keep all lit
      } else {
        setActiveTrustLevel(-1);
      }

      phaseTimerRef.current = requestAnimationFrame(tick);
    }

    phaseTimerRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(phaseTimerRef.current);
  }, [isVisible, prefersReduced]);

  // Particles
  useParticleCanvas(
    canvasRef,
    surfacePositions,
    center,
    activeSurfaceIdx,
    isVisible && phase >= Phase.DataFlow,
    { width: containerSize.width, height: svgH }
  );

  // Click handlers
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const getCapabilityPanelData = useCallback((): {
    items: string[];
    title: string;
    position: NodePosition;
  } | null => {
    if (!selectedNode) return null;
    if (selectedNode === "gateway") {
      return {
        items: GATEWAY_CAPABILITIES,
        title: "Gateway",
        position: { x: cx, y: cy + gatewayR + 8 },
      };
    }
    const idx = SURFACES.findIndex((s) => s.id === selectedNode);
    if (idx === -1) return null;
    return {
      items: SURFACES[idx].capabilities,
      title: SURFACES[idx].label,
      position: surfacePositions[idx],
    };
  }, [selectedNode, cx, cy, gatewayR, surfacePositions]);

  const panelData = getCapabilityPanelData();

  // Phase visibility flags
  const showGateway = phase >= Phase.Gateway;
  const showSurfaces = phase >= Phase.Surfaces;
  const showLines = phase >= Phase.Surfaces;

  if (prefersReduced) {
    return <ReducedMotionView />;
  }

  return (
    <div
      ref={containerRef}
      className="glass-card rounded-2xl border border-[var(--border-medium)] overflow-hidden max-w-3xl mx-auto"
    >
      <TUIHeader />
      <BreathingLine />

      {/* Phase caption */}
      <PhaseCaptionDisplay phase={phase} />

      {/* Main visualization area */}
      <div className="relative select-none" style={{ height: svgH }}>
        {/* SVG layer */}
        <svg
          className="absolute inset-0 w-full"
          style={{ height: svgH }}
          viewBox={`0 0 ${containerSize.width || 600} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="gatewayGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
              <feFlood floodColor={MARS_ORANGE} floodOpacity="0.35" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          {showLines &&
            surfacePositions.map((pos, i) => (
              <motion.line
                key={`line-${i}`}
                x1={pos.x}
                y1={pos.y}
                x2={cx}
                y2={cy}
                stroke="var(--text-muted)"
                strokeWidth={1}
                strokeDasharray="4 6"
                strokeOpacity={0.35}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-20"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </motion.line>
            ))}

          {/* Trust ring arcs */}
          {showGateway &&
            TRUST_LEVELS.map((tl, i) => {
              const segAngle = 360 / TRUST_LEVELS.length;
              const gap = 6;
              const startA = i * segAngle + gap / 2;
              const endA = (i + 1) * segAngle - gap / 2;
              const lit = activeTrustLevel >= i;
              return (
                <motion.path
                  key={`trust-${i}`}
                  d={arcPath(cx, cy, trustRingR, startA, endA)}
                  fill="none"
                  stroke={tl.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: lit ? 0.9 : 0.12 }}
                  transition={{ duration: 0.4 }}
                />
              );
            })}

          {/* Trust level labels (visible during TrustLadder phase) */}
          {phase >= Phase.TrustLadder &&
            TRUST_LEVELS.map((tl, i) => {
              const segAngle = 360 / TRUST_LEVELS.length;
              const midAngle = i * segAngle + segAngle / 2;
              const labelR = trustRingR + 14;
              const rad = degToRad(midAngle - 90);
              const lx = cx + labelR * Math.cos(rad);
              const ly = cy + labelR * Math.sin(rad);
              const lit = activeTrustLevel >= i;
              return (
                <motion.text
                  key={`trust-label-${i}`}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={tl.color}
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: lit ? 0.85 : 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  {tl.level}
                </motion.text>
              );
            })}

          {/* Gateway circle */}
          {showGateway && (
            <motion.circle
              cx={cx}
              cy={cy}
              r={gatewayR}
              fill="var(--surface-2)"
              stroke={MARS_ORANGE}
              strokeWidth={2}
              filter="url(#gatewayGlow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          )}
        </svg>

        {/* Canvas layer — particles */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: containerSize.width, height: svgH }}
        />

        {/* HTML overlay — nodes */}
        <div className="absolute inset-0 pointer-events-none" style={{ height: svgH }}>
          {/* Gateway label */}
          {showGateway && (
            <motion.button
              className="absolute pointer-events-auto flex flex-col items-center cursor-pointer group"
              style={{
                left: cx,
                top: cy,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              onClick={() => handleNodeClick("gateway")}
              title="JSON-RPC daemon"
              aria-label="Gateway node — click for details"
            >
              <motion.div
                className="absolute rounded-full border border-[var(--mars-orange)]"
                style={{
                  width: gatewayR * 2 + 8,
                  height: gatewayR * 2 + 8,
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.1, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span
                className="text-[var(--mars-orange)] font-mono text-xs font-bold"
                style={{ marginTop: gatewayR + 10 }}
              >
                Gateway
              </span>
            </motion.button>
          )}

          {/* Surface nodes */}
          {showSurfaces &&
            SURFACES.map((surface, i) => {
              const pos = surfacePositions[i];
              if (!pos) return null;
              const isActive = activeSurfaceIdx === i && phase >= Phase.DataFlow;
              return (
                <motion.button
                  key={surface.id}
                  className="absolute pointer-events-auto flex flex-col items-center gap-1 cursor-pointer group"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0, scale: 0.5, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNodeClick(surface.id)}
                  aria-label={`${surface.label} node — click for details`}
                >
                  <motion.div
                    className="rounded-xl border p-2.5 transition-colors"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: isActive
                        ? MARS_ORANGE
                        : "var(--border-medium)",
                      boxShadow: isActive
                        ? `0 0 16px ${MARS_ORANGE_DIM}`
                        : "none",
                    }}
                    animate={
                      isActive
                        ? { borderColor: MARS_ORANGE }
                        : { borderColor: "rgba(136,147,164,0.13)" }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <span
                      className="block transition-colors"
                      style={{
                        color: isActive
                          ? MARS_ORANGE
                          : "var(--text-secondary)",
                      }}
                    >
                      {surface.icon}
                    </span>
                  </motion.div>
                  <span
                    className="text-[10px] font-mono font-medium transition-colors"
                    style={{
                      color: isActive
                        ? MARS_ORANGE
                        : "var(--text-muted)",
                    }}
                  >
                    {surface.label}
                  </span>
                  <span
                    className="text-[8px] font-mono transition-colors hidden sm:block"
                    style={{
                      color: isActive
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    {surface.subtitle}
                  </span>
                </motion.button>
              );
            })}

          {/* Capability panel */}
          <AnimatePresence>
            {panelData && (
              <CapabilityPanel
                key={selectedNode}
                items={panelData.items}
                title={panelData.title}
                position={panelData.position}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </AnimatePresence>

          {/* YourStack phase overlay */}
          <AnimatePresence>
            {phase === Phase.YourStack && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="flex gap-6 sm:gap-10">
                  {[
                    { value: "22", label: "packages" },
                    { value: "95", label: "tools" },
                    { value: "6", label: "providers" },
                    { value: "5", label: "surfaces" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-2xl sm:text-3xl font-mono font-bold text-[var(--mars-orange)]">
                        {stat.value}
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono text-[var(--text-muted)] mt-1">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BreathingLine />

      {/* Phase dots + progress bar */}
      <PhaseDots currentPhase={phase} onJump={jumpToPhase} />

      <div className="h-[2px] bg-[var(--surface-2)]">
        <motion.div
          className="h-full"
          style={{ background: MARS_ORANGE }}
          animate={{ width: `${cycleTime * 100}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Verify**

Run: `npm run build`
Expected: Build succeeds with 6 pages, no errors.

**Step 3: Visual check**

Run: `npm run dev` — visit `http://localhost:4321`. The hero should:
- Show "Your Gateway" caption first, gateway node appears
- After 2s: "Every Surface" + 4 nodes animate in
- After 5.5s: "Live Data Flow" + particles flowing
- After 9.5s: "Trust Ladder" + trust ring arcs light up with L1-L5 labels
- After 14.5s: "Your Stack" + stat counters overlay
- Phase dots at bottom should be clickable
- Clicking a node shows capability panel

**Step 4: Commit**

```bash
git add src/components/Hero.astro src/components/HeroDemo.tsx src/styles/globals.css
git commit -m "feat: rewrite hero with narrative phases and product messaging

Each animation phase now narrates a product concept with visible captions.
Phase indicator dots allow jumping between phases. Surface nodes show
subtitles. Trust ring labels appear during trust phase. Stats overlay
in final phase. Reduced motion shows all captions as a static list."
```

---

### Task 3: Add docs-prose stylesheet to globals.css

**Files:**
- Modify: `src/styles/globals.css` (append new styles)

**Step 1: Add docs-prose styles**

Append the following to the end of `src/styles/globals.css`:

```css
/* ═══════════════════════════════════════════
   Docs prose system
   ═══════════════════════════════════════════ */

.docs-prose {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  line-height: 1.75;
  color: var(--text-secondary);
}

/* Headings */
.docs-prose h1 {
  font-family: var(--font-mono);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 1rem;
  padding-left: 0.75rem;
  border-left: 3px solid var(--mars-orange);
  line-height: 1.3;
}

.docs-prose h2 {
  font-family: var(--font-mono);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 2.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
  line-height: 1.3;
}

.docs-prose h3 {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.docs-prose h4 {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

/* Anchor links on headings */
.docs-prose :is(h1, h2, h3, h4) {
  position: relative;
  scroll-margin-top: 5rem;
}

.docs-prose :is(h2, h3, h4):hover::before {
  content: "#";
  position: absolute;
  left: -1.25rem;
  color: var(--mars-orange);
  opacity: 0.5;
  font-weight: 400;
}

/* Paragraphs */
.docs-prose p {
  margin-bottom: 1rem;
}

.docs-prose p + p {
  margin-top: 0;
}

/* Links */
.docs-prose a {
  color: var(--mars-orange);
  text-decoration: none;
  transition: text-decoration-color 0.2s;
}

.docs-prose a:hover {
  text-decoration: underline;
  text-decoration-color: var(--mars-orange-dim);
  text-underline-offset: 2px;
}

/* Bold + italic */
.docs-prose strong {
  color: var(--text-primary);
  font-weight: 600;
}

.docs-prose em {
  color: var(--text-secondary);
  font-style: italic;
}

/* Code blocks */
.docs-prose pre {
  background: var(--surface-2);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--mars-orange);
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin: 1.25rem 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.docs-prose pre code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-primary);
  background: none;
  padding: 0;
  border-radius: 0;
}

/* Inline code */
.docs-prose :not(pre) > code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  color: var(--mars-orange);
  background: var(--surface-2);
  padding: 0.15em 0.35em;
  border-radius: 0.25rem;
}

/* Lists */
.docs-prose ul {
  list-style: none;
  padding-left: 1.25rem;
  margin: 1rem 0;
}

.docs-prose ul li {
  position: relative;
  padding-left: 0;
  margin-bottom: 0.5rem;
}

.docs-prose ul li::before {
  content: "";
  position: absolute;
  left: -1rem;
  top: 0.6em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--mars-orange);
  opacity: 0.7;
}

.docs-prose ol {
  list-style: none;
  padding-left: 1.25rem;
  margin: 1rem 0;
  counter-reset: docs-counter;
}

.docs-prose ol li {
  position: relative;
  padding-left: 0.25rem;
  margin-bottom: 0.5rem;
  counter-increment: docs-counter;
}

.docs-prose ol li::before {
  content: counter(docs-counter) ".";
  position: absolute;
  left: -1.25rem;
  color: var(--mars-orange);
  font-family: var(--font-mono);
  font-size: 0.85em;
  font-weight: 600;
}

/* Nested lists */
.docs-prose li > ul,
.docs-prose li > ol {
  margin-top: 0.25rem;
  margin-bottom: 0;
}

/* Tables */
.docs-prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.25rem 0;
  font-size: 0.875rem;
}

.docs-prose thead th {
  background: var(--surface-2);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.625rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-medium);
}

.docs-prose tbody td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.docs-prose tbody tr:hover {
  background: rgba(136, 147, 164, 0.03);
}

/* Blockquotes */
.docs-prose blockquote {
  border-left: 3px solid var(--mars-orange);
  background: color-mix(in srgb, var(--mars-orange) 3%, var(--surface-1));
  padding: 0.75rem 1rem;
  margin: 1.25rem 0;
  border-radius: 0 0.5rem 0.5rem 0;
}

.docs-prose blockquote p {
  font-style: italic;
  color: var(--text-secondary);
  margin: 0;
}

/* Horizontal rules */
.docs-prose hr {
  border: none;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--border-medium),
    transparent
  );
  margin: 2rem 0;
}

/* Images */
.docs-prose img {
  max-width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--border-subtle);
  margin: 1rem 0;
}
```

**Step 2: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: add docs-prose typography system

Custom prose styles for docs: branded headings with anchor hints,
orange-accented code blocks, styled tables, blockquotes, lists with
orange markers, and gradient horizontal rules."
```

---

### Task 4: Create custom MDX components

**Files:**
- Create: `src/components/docs/Callout.astro`
- Create: `src/components/docs/CodeTitle.astro`
- Create: `src/components/docs/StepList.astro`

**Step 1: Create Callout component**

Create `src/components/docs/Callout.astro`:

```astro
---
interface Props {
  type?: "info" | "warning" | "tip";
  title?: string;
}

const { type = "info", title } = Astro.props;

const config = {
  info: {
    border: "var(--text-muted)",
    bg: "color-mix(in srgb, #5b8abf 5%, var(--surface-1))",
    icon: "ℹ",
    defaultTitle: "Note",
  },
  warning: {
    border: "var(--warning)",
    bg: "color-mix(in srgb, var(--warning) 5%, var(--surface-1))",
    icon: "⚠",
    defaultTitle: "Warning",
  },
  tip: {
    border: "var(--success)",
    bg: "color-mix(in srgb, var(--success) 5%, var(--surface-1))",
    icon: "✓",
    defaultTitle: "Tip",
  },
};

const c = config[type];
const displayTitle = title || c.defaultTitle;
---

<div
  class="callout rounded-lg my-5 px-4 py-3"
  style={`border-left: 3px solid ${c.border}; background: ${c.bg};`}
>
  <p class="text-xs font-mono font-bold uppercase tracking-wider mb-1.5" style={`color: ${c.border};`}>
    <span class="mr-1.5">{c.icon}</span>{displayTitle}
  </p>
  <div class="text-sm text-[var(--text-secondary)] leading-relaxed [&>p]:mb-0">
    <slot />
  </div>
</div>
```

**Step 2: Create CodeTitle component**

Create `src/components/docs/CodeTitle.astro`:

```astro
---
interface Props {
  filename: string;
}
const { filename } = Astro.props;
---

<div class="code-title -mb-3 mt-5">
  <span class="inline-block text-[10px] font-mono font-medium text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border-subtle)] border-b-0 rounded-t-md px-3 py-1.5">
    {filename}
  </span>
</div>
```

**Step 3: Create StepList component**

Create `src/components/docs/StepList.astro`:

```astro
---
// StepList wraps its children (expected to be <li> elements or similar)
// and renders them with numbered orange step indicators.
// Usage in MDX: <StepList steps={["Clone the repo", "Install deps", "Start gateway"]} />
interface Props {
  steps: string[];
}
const { steps } = Astro.props;
---

<div class="step-list my-6 space-y-4">
  {steps.map((step, i) => (
    <div class="flex items-start gap-3">
      <span class="shrink-0 w-6 h-6 rounded-full bg-[var(--mars-orange)] text-[var(--text-inverse)] text-xs font-mono font-bold flex items-center justify-center mt-0.5">
        {i + 1}
      </span>
      <p class="text-sm text-[var(--text-secondary)] leading-relaxed pt-0.5">{step}</p>
    </div>
  ))}
</div>
```

**Step 4: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/components/docs/
git commit -m "feat: add Callout, CodeTitle, StepList MDX components

Three reusable docs components: Callout (info/warning/tip boxes),
CodeTitle (filename labels above code blocks), StepList (numbered
steps with orange indicators)."
```

---

### Task 5: Update Docs.astro layout

**Files:**
- Modify: `src/layouts/Docs.astro`

**Step 1: Rewrite Docs.astro**

Replace the entire contents of `src/layouts/Docs.astro` with:

```astro
---
import Base from "./Base.astro";
import Nav from "../components/Nav.astro";
import Footer from "../components/Footer.astro";
import { getCollection } from "astro:content";

interface Props {
  title: string;
  description: string;
  headings?: { depth: number; slug: string; text: string }[];
}

const { title, description, headings = [] } = Astro.props;
const docs = (await getCollection("docs")).sort((a, b) => a.data.order - b.data.order);
const currentPath = Astro.url.pathname;
const tocHeadings = headings.filter((h) => h.depth === 2 || h.depth === 3);
---

<Base title={`${title} — marsbot docs`} description={description}>
  <Nav />
  <div class="pt-14 min-h-screen flex">
    <!-- Mobile sidebar toggle -->
    <input type="checkbox" id="docs-sidebar-toggle" class="hidden peer" />
    <label
      for="docs-sidebar-toggle"
      class="lg:hidden fixed top-16 left-4 z-40 w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border-medium)] cursor-pointer"
      aria-label="Toggle sidebar"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h12M2 12h12" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </label>

    <!-- Sidebar backdrop (mobile) -->
    <label
      for="docs-sidebar-toggle"
      class="hidden peer-checked:block fixed inset-0 z-30 bg-black/50 lg:!hidden"
    ></label>

    <!-- Sidebar -->
    <aside class="fixed lg:sticky top-14 left-0 z-30 w-64 shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--void)] p-6 pt-10 -translate-x-full lg:translate-x-0 transition-transform peer-checked:translate-x-0">
      <h3 class="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Documentation</h3>
      <nav class="space-y-1">
        {docs.map((doc) => {
          const href = `/docs/${doc.id}`;
          const isActive = currentPath === href || currentPath === `${href}/`;
          return (
            <a
              href={href}
              class:list={[
                "block px-3 py-1.5 rounded text-sm transition-colors",
                isActive ? "text-[var(--mars-orange)] bg-[var(--surface-2)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              ]}
            >
              {doc.data.title}
            </a>
          );
        })}
      </nav>
    </aside>

    <!-- Content -->
    <main class="flex-1 max-w-3xl px-6 sm:px-10 py-10 lg:ml-0">
      <h1 class="text-2xl font-mono font-bold text-[var(--text-primary)] mb-2">{title}</h1>
      <p class="text-sm text-[var(--text-muted)] mb-8">{description}</p>
      <article class="docs-prose">
        <slot />
      </article>
    </main>

    <!-- Table of contents (xl screens) -->
    {tocHeadings.length > 0 && (
      <aside class="hidden xl:block w-48 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-10 pr-4">
        <h4 class="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">On this page</h4>
        <nav class="space-y-1">
          {tocHeadings.map((h) => (
            <a
              href={`#${h.slug}`}
              class:list={[
                "block text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors",
                h.depth === 3 ? "pl-3" : ""
              ]}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </aside>
    )}
  </div>
  <Footer />
</Base>
```

**Step 2: Update docs/[...slug].astro to pass headings**

Modify `src/pages/docs/[...slug].astro` to pass headings to the layout:

```astro
---
import { getCollection, render } from "astro:content";
import Docs from "../../layouts/Docs.astro";

export async function getStaticPaths() {
  const docs = await getCollection("docs");
  return docs.map((doc) => ({
    params: { slug: doc.id },
    props: { doc },
  }));
}

const { doc } = Astro.props;
const { Content, headings } = await render(doc);
---

<Docs title={doc.data.title} description={doc.data.description} headings={headings}>
  <Content />
</Docs>
```

**Step 3: Verify**

Run: `npm run build`
Expected: Build succeeds with 6 pages.

Run: `npm run dev` — visit `http://localhost:4321/docs/architecture`. Check:
- Left sidebar with navigation (mobile: hamburger toggle)
- Content uses docs-prose styling (orange code block borders, styled tables, etc.)
- Right sidebar "On this page" ToC on xl screens

**Step 4: Commit**

```bash
git add src/layouts/Docs.astro src/pages/docs/
git commit -m "feat: update docs layout with mobile sidebar, docs-prose, and ToC

Replace prose-invert with custom docs-prose class. Add mobile sidebar
toggle with CSS checkbox hack. Add On This Page ToC sidebar on xl screens.
Pass headings from render() to layout."
```

---

### Task 6: Enhance MDX content with new components

**Files:**
- Modify: `src/content/docs/architecture.mdx`
- Modify: `src/content/docs/trust-model.mdx`
- Modify: `src/content/docs/getting-started.mdx`

**Step 1: Add callouts to architecture.mdx**

Add at line 8 (after the opening paragraph), and before the Gateway section:

```mdx
import Callout from '../../components/docs/Callout.astro';
import CodeTitle from '../../components/docs/CodeTitle.astro';
```

Then add callouts at strategic points. Example — after the "Gateway Daemon" intro paragraph:

```mdx
<Callout type="tip" title="Quick start">
  The gateway starts with a single command: `marsbot gateway start`. See the [Getting Started](/docs/getting-started) guide.
</Callout>
```

Add a `<CodeTitle filename="~/.marsbot/config.json" />` before any config JSON blocks where applicable.

**Step 2: Add callouts to trust-model.mdx**

Add imports at line 7, then add:
- A `<Callout type="info">` after the "Why a Trust Ladder Matters" section explaining this is enforced at the gateway, not in prompts
- A `<Callout type="warning">` in the L5 section about vault access being scoped

**Step 3: Add callouts to getting-started.mdx**

Add imports at line 7, then add:
- A `<Callout type="info">` after prerequisites explaining the free tier is enough
- `<CodeTitle>` before each code block that shows a file (like `config.json`, `my-first-agent.yaml`)

**Step 4: Verify**

Run: `npm run build`
Expected: Build succeeds with 6 pages.

**Step 5: Commit**

```bash
git add src/content/docs/
git commit -m "feat: enhance docs MDX with Callout and CodeTitle components

Add info/warning/tip callouts and filename labels to architecture,
trust-model, and getting-started docs for improved readability."
```

---

### Task 7: Final build verification

**Step 1: Full build**

Run: `npm run build`
Expected: 6 pages built, no errors, no warnings.

**Step 2: Visual spot-check**

Run: `npm run dev` and check:
- [ ] Hero: gradient title, new copy, CTAs, 5 narrative phases with captions, phase dots
- [ ] Hero: clicking a node shows capability panel
- [ ] Hero: clicking a phase dot jumps to that phase
- [ ] Docs /docs/architecture: docs-prose styling, orange code block borders, styled tables
- [ ] Docs /docs/trust-model: callout boxes render correctly
- [ ] Docs /docs/getting-started: CodeTitle labels appear above code blocks
- [ ] Docs mobile: hamburger toggle opens sidebar
- [ ] Docs xl: "On this page" ToC appears in right column

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: polish hero and docs after visual review"
```

**Step 4: Push**

```bash
git push origin master
```
