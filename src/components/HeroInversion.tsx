import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ─── Constants ─── */

const TYPEWRITER_TEXT = "Your AI should run on your hardware, speak your language, and answer to you alone.";
const SCENE_DURATIONS = [4500, 4000, 4500]; // ms; scene 3 (Proof) holds

const STACK_LAYERS = [
  { label: "Gateway", sublabel: "always-on · never leaves home" },
  { label: "Runtime", sublabel: "budget-aware · skill-routed" },
  { label: "Channels", sublabel: "meets you where you are" },
  { label: "Surfaces", sublabel: "native on every screen" },
];

const STATS = [
  { value: 99, label: "tools" },
  { value: 6, label: "providers" },
  { value: 22, label: "skill packs" },
  { value: 6, label: "channels" },
];

const SCENE_NAMES = ["The Void", "The Awakening", "The Stack", "The Proof"];
const MARS_ORANGE = "#e8622a";

/* ─── Scene 0: The Void ─── */

function SceneVoid() {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < TYPEWRITER_TEXT.length) {
        setDisplayed(TYPEWRITER_TEXT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full px-8">
      <p
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--text-primary)",
          fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        {displayed}
        <span
          className="spotlight-cursor ml-1 inline-block align-middle"
          style={{
            width: "0.125em",
            height: "1.1em",
            background: "var(--text-primary)",
            verticalAlign: "middle",
          }}
        />
      </p>
    </div>
  );
}

/* ─── Scene 1: The Awakening ─── */

function SceneAwakening() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const W = parent?.offsetWidth ?? 600;
    const H = parent?.offsetHeight ?? 360;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H / 2;
    const N = 40;
    const ORBIT_R = 52;
    const startTime = performance.now();

    const particles = Array.from({ length: N }, (_, i) => {
      const targetAngle = (i / N) * Math.PI * 2;
      return {
        x: (Math.random() - 0.5) * W * 0.85 + cx,
        y: (Math.random() - 0.5) * H * 0.85 + cy,
        tx: cx + ORBIT_R * Math.cos(targetAngle),
        ty: cy + ORBIT_R * Math.sin(targetAngle),
        angle: targetAngle,
        orbitSpeed: 0.25 + Math.random() * 0.2,
        size: 1.5 + Math.random() * 1.5,
      };
    });

    function draw(ts: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const elapsed = (ts - startTime) / 1000;
      const convergeProgress = Math.min(elapsed / 1.8, 1);
      const eased = 1 - Math.pow(1 - convergeProgress, 3);

      // Glow
      const glowR = 28 + eased * 28;
      const glowAlpha = eased * 0.45;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, `rgba(232, 98, 42, ${glowAlpha})`);
      glow.addColorStop(1, "rgba(232, 98, 42, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Core ring
      if (eased > 0.3) {
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * eased, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(232, 98, 42, ${eased * 0.85})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        let px: number, py: number;
        if (convergeProgress < 1) {
          px = p.x + (p.tx - p.x) * eased;
          py = p.y + (p.ty - p.y) * eased;
        } else {
          const orbitTime = elapsed - 1.8;
          px = cx + ORBIT_R * Math.cos(p.angle + orbitTime * p.orbitSpeed);
          py = cy + ORBIT_R * Math.sin(p.angle + orbitTime * p.orbitSpeed);
        }
        const alpha = 0.25 + eased * 0.65;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 98, 42, ${alpha})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.6 }}
      >
        <span
          className="font-mono font-bold text-2xl sm:text-3xl tracking-tight"
          style={{ color: MARS_ORANGE }}
        >
          marsbot
        </span>
        <span
          className="font-mono text-xs tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          hardware-native · trust-gated · fully yours
        </span>
      </motion.div>
    </div>
  );
}

/* ─── Scene 2: The Stack ─── */

function SceneStack() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="flex flex-col items-stretch w-full max-w-xs sm:max-w-sm gap-2 relative">
        {/* Vertical connector line */}
        <div
          className="absolute left-[1.125rem] top-4 bottom-4 w-px pointer-events-none"
          style={{ background: "var(--border-subtle)" }}
        />

        {STACK_LAYERS.map((layer, i) => (
          <motion.div
            key={layer.label}
            className="relative flex items-center gap-3 glass-card rounded-lg border px-4 py-3"
            style={{ borderColor: "var(--border-medium)" }}
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: i * 0.28, ease: "easeOut" }}
          >
            {/* Node dot */}
            <span
              className="relative z-10 w-2 h-2 rounded-full shrink-0"
              style={{ background: MARS_ORANGE }}
            />
            <div className="flex-1 min-w-0">
              <span
                className="font-mono font-bold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {layer.label}
              </span>
              <span
                className="font-mono text-xs ml-2 hidden sm:inline"
                style={{ color: "var(--text-muted)" }}
              >
                {layer.sublabel}
              </span>
              <div
                className="font-mono text-xs sm:hidden mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {layer.sublabel}
              </div>
            </div>

            {/* Animated data flow dot */}
            <motion.span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: MARS_ORANGE }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1.6,
                delay: i * 0.28 + 0.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Scene 3: The Proof ─── */

function useCountUp(target: number, durationMs: number, delayMs: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf: number;
    const timeout = setTimeout(() => {
      const start = performance.now();
      function step(ts: number) {
        const progress = Math.min((ts - start) / durationMs, 1);
        setValue(Math.round(progress * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs, delayMs]);

  return value;
}

function StatCard({
  value,
  label,
  delayMs,
}: {
  value: number;
  label: string;
  delayMs: number;
}) {
  const count = useCountUp(value, 800, delayMs);
  return (
    <motion.div
      className="glass-card rounded-xl border px-3 py-4 text-center flex-1"
      style={{ borderColor: "var(--border-medium)" }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayMs / 1000, duration: 0.4 }}
    >
      <div
        className="font-mono font-bold text-2xl sm:text-3xl"
        style={{ color: MARS_ORANGE }}
      >
        {count}
      </div>
      <div
        className="font-mono text-[10px] sm:text-xs mt-1"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
    </motion.div>
  );
}

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
          <StatCard
            key={stat.label}
            value={stat.value}
            label={stat.label}
            delayMs={i * 130}
          />
        ))}
      </div>
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <a href="/coach" className="btn-primary text-sm">
          Talk to the Coach
        </a>
        <a href="/docs" className="btn-secondary text-sm">
          Read the Docs
        </a>
      </motion.div>
    </div>
  );
}

/* ─── Reduced Motion Fallback ─── */

function ReducedMotionView() {
  return (
    <div className="glass-card rounded-2xl border border-[var(--border-medium)] overflow-hidden max-w-3xl mx-auto p-8 space-y-6">
      <p
        className="font-mono text-center"
        style={{
          color: "var(--text-primary)",
          fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
        }}
      >
        {TYPEWRITER_TEXT}
      </p>
      <div className="flex flex-col gap-2 max-w-sm mx-auto">
        {STACK_LAYERS.map((l) => (
          <div key={l.label} className="font-mono text-sm flex gap-2">
            <span style={{ color: MARS_ORANGE }}>→</span>
            <span style={{ color: "var(--text-secondary)" }}>
              {l.label} — {l.sublabel}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="glass-card rounded-lg border px-3 py-3 text-center"
            style={{ borderColor: "var(--border-medium)" }}
          >
            <div
              className="font-mono font-bold text-2xl"
              style={{ color: MARS_ORANGE }}
            >
              {s.value}
            </div>
            <div
              className="font-mono text-xs mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        <a href="/coach" className="btn-primary text-sm">
          Talk to the Coach
        </a>
        <a href="/docs" className="btn-secondary text-sm">
          Read the Docs
        </a>
      </div>
    </div>
  );
}

/* ─── Scene Dots ─── */

function SceneDots({
  scene,
  onJump,
}: {
  scene: number;
  onJump: (s: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {SCENE_NAMES.map((name, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          title={name}
          aria-label={`Jump to ${name}`}
          className="cursor-pointer"
        >
          <span
            className="block w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === scene ? MARS_ORANGE : "var(--text-muted)",
              opacity: i === scene ? 1 : 0.35,
              transform: i === scene ? "scale(1.35)" : "scale(1)",
            }}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */

function renderScene(scene: number) {
  switch (scene) {
    case 0:
      return <SceneVoid />;
    case 1:
      return <SceneAwakening />;
    case 2:
      return <SceneStack />;
    case 3:
      return <SceneProof />;
    default:
      return null;
  }
}

export default function HeroInversion() {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scene, setScene] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only animate when in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-advance scenes; scene 3 (Proof) holds
  useEffect(() => {
    if (!isVisible || prefersReduced || scene >= SCENE_DURATIONS.length) return;
    timerRef.current = setTimeout(() => {
      setScene((s) => s + 1);
    }, SCENE_DURATIONS[scene]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scene, isVisible, prefersReduced]);

  const jumpToScene = useCallback((s: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setScene(s);
  }, []);

  if (prefersReduced) return <ReducedMotionView />;

  return (
    <div
      ref={containerRef}
      className="glass-card rounded-2xl border border-[var(--border-medium)] overflow-hidden max-w-3xl mx-auto"
    >
      {/* Scene area */}
      <div className="relative" style={{ height: 340 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={{ position: "absolute", inset: 0 }}
          >
            {renderScene(scene)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scene indicator */}
      <SceneDots scene={scene} onJump={jumpToScene} />
    </div>
  );
}
