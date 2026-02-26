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
