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
  icon: ReactNode;
  /** Orbital position as angle in degrees (0 = top) */
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
    icon: <Monitor size={20} strokeWidth={1.5} />,
    angle: 315, // top-left
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
    icon: <Smartphone size={20} strokeWidth={1.5} />,
    angle: 45, // top-right
    capabilities: [
      "Native iOS",
      "99 MCP tools",
      "Witness capture",
      "Outpost mode",
    ],
  },
  {
    id: "marsbot-dev",
    label: "Web",
    icon: <Globe size={20} strokeWidth={1.5} />,
    angle: 225, // bottom-left
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
    icon: <Terminal size={20} strokeWidth={1.5} />,
    angle: 135, // bottom-right
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
  { level: "L1", color: "#505b6b", label: "Stranger" },
  { level: "L2", color: "#5b8abf", label: "Known" },
  { level: "L3", color: "#d4a033", label: "Trusted" },
  { level: "L4", color: "#d47833", label: "Inner" },
  { level: "L5", color: "#d45c5c", label: "Core" },
];

const MARS_ORANGE = "#e8622a";
const MARS_ORANGE_DIM = "rgba(232, 98, 42, 0.4)";

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
  const rad = degToRad(angle - 90); // offset so 0 = top
  return {
    x: cx + radiusX * Math.cos(rad),
    y: cy + radiusY * Math.sin(rad),
  };
}

/** SVG arc path for a segment of a circle */
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
   Auto-play phase enum
   ──────────────────────────────────────────── */

const enum Phase {
  GatewayIn = 0,
  SurfacesIn = 1,
  LinesIn = 2,
  ParticleFlow = 3,
  TrustRing = 4,
}

const PHASE_DURATIONS = [500, 1500, 800, 12000, 3000]; // ms per phase
const TOTAL_CYCLE = PHASE_DURATIONS.reduce((a, b) => a + b, 0);

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
    // Delay listener so the opening click doesn't immediately close
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

    // Seed particles
    const particles: { t: number; src: number; speed: number; offset: number }[] = [];
    for (let i = 0; i < 6; i++) {
      particles.push({
        t: Math.random(),
        src: activeSourceIdx,
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
        // Fade in/out near endpoints
        const alpha = Math.sin(p.t * Math.PI) * 0.9;

        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 98, 42, ${alpha})`;
        ctx.fill();

        // Glow
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
   Main component
   ──────────────────────────────────────────── */

export default function HeroDemo() {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>(Phase.GatewayIn);
  const [cycleTime, setCycleTime] = useState(0);
  const [activeSurfaceIdx, setActiveSurfaceIdx] = useState(0);
  const [activeTrustLevel, setActiveTrustLevel] = useState(-1);
  const phaseTimerRef = useRef(0);

  // Intersection observer — pause when off-screen
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

  // Computed layout
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

  // Auto-play cycle
  useEffect(() => {
    if (!isVisible || prefersReduced) return;

    let elapsed = 0;
    let lastTs = performance.now();

    function tick(ts: number) {
      const dt = Math.min(ts - lastTs, 100);
      lastTs = ts;
      elapsed += dt;

      // Compute which phase we're in
      let acc = 0;
      let currentPhase = Phase.GatewayIn;
      for (let i = 0; i < PHASE_DURATIONS.length; i++) {
        acc += PHASE_DURATIONS[i];
        if (elapsed < acc) {
          currentPhase = i as Phase;
          break;
        }
        if (i === PHASE_DURATIONS.length - 1) {
          // Loop
          elapsed = elapsed % TOTAL_CYCLE;
          currentPhase = Phase.GatewayIn;
        }
      }

      setPhase(currentPhase);
      setCycleTime(elapsed / TOTAL_CYCLE);

      // Particle source cycling during ParticleFlow phase
      if (currentPhase === Phase.ParticleFlow) {
        const flowStart =
          PHASE_DURATIONS[0] + PHASE_DURATIONS[1] + PHASE_DURATIONS[2];
        const flowElapsed = elapsed - flowStart;
        const idx = Math.floor(flowElapsed / 3000) % SURFACES.length;
        setActiveSurfaceIdx(idx);
      }

      // Trust ring illumination
      if (currentPhase === Phase.TrustRing) {
        const trustStart = TOTAL_CYCLE - PHASE_DURATIONS[4];
        const trustElapsed = elapsed - trustStart;
        const lvl = Math.min(
          Math.floor((trustElapsed / PHASE_DURATIONS[4]) * 5),
          4
        );
        setActiveTrustLevel(lvl);
      } else if (currentPhase >= Phase.ParticleFlow) {
        // Keep all trust levels lit after trust ring phase until reset
      } else {
        setActiveTrustLevel(-1);
      }

      phaseTimerRef.current = requestAnimationFrame(tick);
    }

    phaseTimerRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(phaseTimerRef.current);
  }, [isVisible, prefersReduced]);

  // Particle canvas
  useParticleCanvas(
    canvasRef,
    surfacePositions,
    center,
    activeSurfaceIdx,
    isVisible && phase >= Phase.ParticleFlow,
    { width: containerSize.width, height: svgH }
  );

  // Click handlers
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
    },
    []
  );

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

  // Reduced motion: skip to fully visible
  const showGateway = prefersReduced || phase >= Phase.GatewayIn;
  const showSurfaces = prefersReduced || phase >= Phase.SurfacesIn;
  const showLines = prefersReduced || phase >= Phase.LinesIn;

  return (
    <div
      ref={containerRef}
      className="glass-card rounded-2xl border border-[var(--border-medium)] overflow-hidden max-w-3xl mx-auto"
    >
      {/* TUI header */}
      <TUIHeader />

      {/* Top breathing line */}
      <BreathingLine />

      {/* Main visualization area */}
      <div
        className="relative select-none"
        style={{ height: svgH }}
      >
        {/* SVG layer — lines, trust ring, gateway circle */}
        <svg
          className="absolute inset-0 w-full"
          style={{ height: svgH }}
          viewBox={`0 0 ${containerSize.width || 600} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glow filter for gateway */}
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
                  animate={{ opacity: lit ? 0.9 : 0.15 }}
                  transition={{ duration: 0.4 }}
                />
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

        {/* HTML overlay — node labels + icons */}
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
              {/* Pulse ring */}
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
              const isActive = activeSurfaceIdx === i && phase >= Phase.ParticleFlow;
              return (
                <motion.button
                  key={surface.id}
                  className="absolute pointer-events-auto flex flex-col items-center gap-1.5 cursor-pointer group"
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
        </div>
      </div>

      {/* Bottom breathing line */}
      <BreathingLine />

      {/* Progress bar */}
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
