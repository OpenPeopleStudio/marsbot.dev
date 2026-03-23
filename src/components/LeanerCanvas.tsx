import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, ChevronDown, ChevronRight, Layers, Rocket } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CanvasCell {
  id: string;
  label: string;
  gridArea: string;
  items: string[];
  detail?: string;
}

interface FAQ {
  q: string;
  a: string;
}

// ─── Phase accent helper ──────────────────────────────────────────────────────
const phaseColor = (phase: 1 | 2) =>
  phase === 1 ? "var(--phase1, #5b8abf)" : "var(--mars-orange)";

const phaseColorDim = (phase: 1 | 2) =>
  phase === 1
    ? "rgba(91, 138, 191, 0.12)"
    : "rgba(232, 98, 42, 0.12)";

// ─── Canvas data ──────────────────────────────────────────────────────────────
const PHASE_1: CanvasCell[] = [
  {
    id: "problem",
    label: "Problem",
    gridArea: "problem",
    items: [
      "Corporations invest billions structuring data about you — you don't even have access to most of it.",
      "AI agents are powerful but useless without personal context. Your data is scattered across dozens of siloed apps.",
      "Learning AI has no guided path. Users either figure it out alone, get overwhelmed, or never start.",
    ],
    detail:
      "The data asymmetry between corporations and individuals is the defining problem of the AI era. Companies have entire teams building data pipelines to structure information about their users. Meanwhile, users can't even export a unified view of their own digital identity. As AI agents become more capable, this gap becomes a chasm — the agent that knows you best won't be yours, it'll be theirs.",
  },
  {
    id: "solution",
    label: "Solution",
    gridArea: "solution",
    items: [
      "marsbot.dev — a personal AI agent that runs alongside you and learns your context over time.",
      "Gamified onboarding that progressively teaches capability without manipulating screen time.",
      "Structured personal dataset that you own — portable, queryable, growing with every interaction.",
    ],
    detail:
      "The platform is marsbot.dev. From first launch, users connect data sources and watch their agent's understanding grow. The gamification layer makes capability discovery feel natural — guided quests like 'Connect your calendar → watch your agent prepare for tomorrow's meeting.' Each step shows real value. The structured dataset underneath is portable (Open People standard) and compounds with every interaction.",
  },
  {
    id: "uvp",
    label: "Unique Value Proposition",
    gridArea: "uvp",
    items: [
      "The first platform where your AI agent actually knows you — because you own the structured data that powers it.",
      "Every interaction makes your dataset richer. Every dataset makes your agent smarter. The compound effect is yours to keep.",
    ],
    detail:
      "High-level concept: 'Personal data sovereignty meets AI — what if you had what corporations have, but it worked for you?' The key differentiator is ownership. Unlike ChatGPT or Copilot, your data doesn't train someone else's model. It builds your personal dataset in a portable, open standard. Switch platforms anytime — your data comes with you.",
  },
  {
    id: "advantage",
    label: "Unfair Advantage",
    gridArea: "advantage",
    items: [
      "Compounding data moat — the longer you use it, the more valuable your dataset becomes.",
      "No lock-in by design (portable standard), but natural retention because your agent knows you.",
      "Open data standard creates ecosystem effects — others build on what you own.",
    ],
  },
  {
    id: "segments",
    label: "Customer Segments",
    gridArea: "segments",
    items: [
      "Early adopters: tech-forward individuals who want AI agents working for them.",
      "Knowledge workers: professionals drowning in fragmented tools and context-switching.",
      "Companies (B2B2C): organizations that want to give employees personal AI agents.",
    ],
    detail:
      "Early adopter profile: Already uses 3+ AI tools, frustrated by starting from zero every session, willing to invest time in building a personal dataset because they understand the compound value.",
  },
  {
    id: "metrics",
    label: "Key Metrics",
    gridArea: "metrics",
    items: [
      "Active agents (users with running personal agents)",
      "Structured data points per user (growing = engaged)",
      "API revenue per user per month",
      "Gamification stage completion rates",
      "B2B2C seat expansion rate",
    ],
  },
  {
    id: "channels",
    label: "Channels",
    gridArea: "channels",
    items: [
      "marsbot.dev — direct B2C platform",
      "Developer community + open standard adoption",
      "B2B2C sales — packaged for company-wide deployment",
      "Word of mouth from gamified 'aha moments'",
    ],
  },
  {
    id: "costs",
    label: "Cost Structure",
    gridArea: "costs",
    items: [
      "API costs — wholesale access to frontier models (primary variable cost)",
      "Infrastructure — hosting, storage, compute for agent orchestration",
      "Development — platform, gamification engine, data pipelines",
      "Community & support — developer relations, documentation",
    ],
  },
  {
    id: "revenue",
    label: "Revenue Streams",
    gridArea: "revenue",
    items: [
      "API token markup (20%) — we handle provisioning, billing, and rate limiting",
      "B2B2C enterprise packages — per-seat managed agent deployment",
      "Premium tiers — advanced capabilities, higher storage, priority model access",
      "Future: marketplace for agent skills and data integrations",
    ],
    detail:
      "The 20% API markup is the primary revenue driver. Users access frontier models (Claude, GPT, etc.) through the platform without managing their own keys. The value isn't the key — it's the orchestration: model routing, context injection from the structured dataset, agent memory, and tool integration.",
  },
];

const PHASE_2: CanvasCell[] = [
  {
    id: "problem",
    label: "Problem",
    gridArea: "problem",
    items: [
      "Interplanetary latency is unavoidable. Earth to Mars: 4–24 minutes one-way.",
      "Bandwidth will be rationed — reserved for critical updates only.",
      "Autonomous systems need a complete, portable, structured representation of you — and that doesn't exist.",
    ],
    detail:
      "The physics is non-negotiable. Light-speed delay between Earth and Mars ranges from 4 to 24 minutes depending on orbital position. You cannot have a real-time conversation with a system on Mars. Bandwidth between planets will be scarce and expensive — reserved for mission-critical data. Rich personal context can't be continuously streamed. The only solution is to ship your identity ahead of time.",
  },
  {
    id: "solution",
    label: "Solution",
    gridArea: "solution",
    items: [
      "Open People Standard — a portable, structured human identity format.",
      "Data-as-cargo infrastructure — physically shipping data is faster than transmitting it.",
      "Agent framework that operates autonomously using your identity data with no live connection.",
    ],
    detail:
      "The same dataset format you build on Earth (Phase 1) becomes the identity payload that ships to Mars. Your robot, your construction system, your terraforming agents — they all operate against your structured identity. When new data arrives via physical shipment, they update. Between shipments, they have enough context to act on your behalf.",
  },
  {
    id: "uvp",
    label: "Unique Value Proposition",
    gridArea: "uvp",
    items: [
      "Your robot on Mars should know you as well as your agent on Earth.",
      "The Open People standard makes your identity portable across any distance.",
    ],
    detail:
      "Data becomes currency. It is the first real commodity to ship interplanetary. Not because of speculation — because of physics. The structured identity dataset is the only way to maintain meaningful human-machine interaction across latency. Build the standard now, own the rails when distance demands it.",
  },
  {
    id: "advantage",
    label: "Unfair Advantage",
    gridArea: "advantage",
    items: [
      "If you own the standard now, you own the rails later.",
      "Years of compounded personal datasets from Phase 1 = the richest identity data in existence.",
      "Network effects: every system that adopts the standard makes every identity more useful.",
    ],
  },
  {
    id: "segments",
    label: "Customer Segments",
    gridArea: "segments",
    items: [
      "Space agencies & commercial space — identity frameworks for remote operations.",
      "Autonomous systems operators — robots, drones, AI at distance.",
      "Terraforming & off-world construction — human-directed, latency-constrained.",
      "Every Phase 1 user — their dataset is already built.",
    ],
  },
  {
    id: "metrics",
    label: "Key Metrics",
    gridArea: "metrics",
    items: [
      "Standard adoption (systems integrating the format)",
      "Identity datasets shipped (physical data transfers)",
      "Autonomous operations running against identities",
      "Latency-independent task completion rate",
    ],
  },
  {
    id: "channels",
    label: "Channels",
    gridArea: "channels",
    items: [
      "Open standard adoption via developer ecosystem",
      "Partnerships with space agencies and commercial operators",
      "Government and defense contracts",
      "Phase 1 user base as natural migration path",
    ],
  },
  {
    id: "costs",
    label: "Cost Structure",
    gridArea: "costs",
    items: [
      "Standard governance & development",
      "Data-as-cargo infrastructure",
      "Partnerships and certifications with space industry",
      "Research — edge AI, autonomous identity systems",
    ],
  },
  {
    id: "revenue",
    label: "Revenue Streams",
    gridArea: "revenue",
    items: [
      "Data-as-commodity — structured identity datasets as tradeable assets.",
      "Standard licensing — commercial operators license for off-world systems.",
      "Infrastructure fees — data packaging, shipping, verification.",
      "Enterprise contracts — government, defense, commercial space.",
    ],
  },
];

const FAQS: FAQ[] = [
  {
    q: "You don't have a product in market yet — why should we care?",
    a: "The platform is marsbot.dev. The wedge is a personal AI agent with gamified onboarding. The revenue model is proven (API markup is how every AI platform monetizes today). What we're building differently is the structured personal dataset underneath — that's the long-term asset, and it starts compounding from day one.",
  },
  {
    q: "How is this different from ChatGPT / Anthropic / any AI tool?",
    a: "Those are model providers. We're the identity layer. ChatGPT doesn't remember you across sessions in a structured way. We build a portable, user-owned dataset that works with any model — including theirs. We're not competing with frontier models. We're the context they're missing.",
  },
  {
    q: "The Mars thing sounds like science fiction.",
    a: "The physics is real — light-speed latency between planets is measured in minutes to hours. Starlink already proved that physical infrastructure beats pure transmission at scale. We're building the identity layer on Earth today that becomes the standard when distance demands it.",
  },
  {
    q: "20% API markup — why won't users just get their own keys?",
    a: "Some will, and that's fine. The value isn't the key — it's the orchestration. We handle model routing, context injection from your structured dataset, agent memory, and tool integration. People who want a working agent without managing infrastructure are our target.",
  },
  {
    q: "What stops Big Tech from building this?",
    a: "Incentive misalignment. Google, Meta, and Apple profit from siloing your data. A portable, user-owned data standard is against their business model. They'll build AI agents — but within their walled garden. We're building the cross-garden identity.",
  },
  {
    q: "What does 'gamify' mean here — isn't that manipulative?",
    a: "Progressive disclosure of capability — not engagement manipulation. Guided quests that teach you what your agent can do: 'Connect your calendar. Now watch your agent prepare for tomorrow's meeting.' The goal is capability, not screen time.",
  },
];

// ─── Build contextual prompt + display text for coach deep-link ──────────────
function buildCellLink(cell: CanvasCell, phase: 1 | 2): string {
  const phaseLabel = phase === 1 ? "Phase 1 (Near Term)" : "Phase 2 (Interplanetary)";
  const bullets = cell.items.map((item) => `- ${item}`).join("\n");
  const detailBlock = cell.detail ? `\n\n${cell.detail}` : "";

  // Rich prompt for the API — includes full cell context
  const prompt = `The user is reviewing the ${phaseLabel} lean canvas and clicked on the "${cell.label}" section. Here's what that section contains:

${bullets}${detailBlock}

Give a deep, founder-perspective breakdown of this section. Explain the reasoning behind each point and how they connect to the broader thesis. Then end with one sharp, open-ended question that would push the thinking further.`;

  // Clean display text for the chat bubble
  const display = `Walk me through the ${cell.label.toLowerCase()} section.`;

  return `/coach?q=${encodeURIComponent(prompt)}&d=${encodeURIComponent(display)}`;
}

// ─── Grid area styles ─────────────────────────────────────────────────────────
const GRID_AREAS: Record<string, React.CSSProperties> = {
  problem: { gridColumn: "1", gridRow: "1 / 3" },
  solution: { gridColumn: "2", gridRow: "1" },
  uvp: { gridColumn: "3", gridRow: "1 / 3" },
  advantage: { gridColumn: "4", gridRow: "1" },
  segments: { gridColumn: "5", gridRow: "1 / 3" },
  metrics: { gridColumn: "2", gridRow: "2" },
  channels: { gridColumn: "4", gridRow: "2" },
  costs: { gridColumn: "1 / 3", gridRow: "3" },
  revenue: { gridColumn: "3 / 6", gridRow: "3" },
};

// ─── Cell component ───────────────────────────────────────────────────────────
function Cell({
  cell,
  phase,
  onExpand,
}: {
  cell: CanvasCell;
  phase: 1 | 2;
  onExpand: (cell: CanvasCell) => void;
}) {
  const accent = phaseColor(phase);
  const isUVP = cell.id === "uvp";

  return (
    <motion.button
      onClick={() => onExpand(cell)}
      className="text-left w-full h-full group cursor-pointer flex flex-col justify-start"
      style={{
        ...GRID_AREAS[cell.gridArea],
        background: isUVP ? "var(--surface-2)" : "var(--surface-1)",
        padding: "18px",
        minHeight: "160px",
        position: "relative",
        borderLeft: isUVP ? `2px solid ${accent}33` : undefined,
        borderRight: isUVP ? `2px solid ${accent}33` : undefined,
      }}
      whileHover={{ backgroundColor: "rgba(136, 147, 164, 0.04)" }}
      transition={{ duration: 0.15 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between mb-3 pb-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-[2px]"
          style={{ fontFamily: "var(--font-mono)", color: accent }}
        >
          {cell.label}
        </span>
        <ChevronRight
          size={12}
          className="opacity-0 group-hover:opacity-60 transition-opacity"
          style={{ color: accent }}
        />
      </div>

      {/* Items */}
      <ul className="space-y-2 shrink-0">
        {cell.items.map((item, i) => (
          <li
            key={i}
            className="text-[12px] leading-[1.7] pl-3.5 relative"
            style={{ color: "var(--text-secondary)" }}
          >
            <span
              className="absolute left-0 top-[7px] w-1 h-1 rounded-full"
              style={{ background: accent, opacity: 0.5 }}
            />
            {item}
          </li>
        ))}
      </ul>
    </motion.button>
  );
}

// ─── Expanded cell overlay ────────────────────────────────────────────────────
function ExpandedCell({
  cell,
  phase,
  onClose,
}: {
  cell: CanvasCell;
  phase: 1 | 2;
  onClose: () => void;
}) {
  const accent = phaseColor(phase);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ background: "rgba(2, 3, 4, 0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-medium)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Top accent */}
        <div className="h-0.5" style={{ background: accent }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <span
                className="text-[10px] font-semibold uppercase tracking-[3px] block mb-1"
                style={{ fontFamily: "var(--font-mono)", color: accent }}
              >
                {phase === 1 ? "Phase 1" : "Phase 2"} · {cell.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ background: "var(--surface-2)" }}
            >
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          {/* Summary items */}
          <ul className="space-y-2.5 mb-5">
            {cell.items.map((item, i) => (
              <li
                key={i}
                className="text-[13px] leading-[1.7] pl-4 relative"
                style={{ color: "var(--text-primary)" }}
              >
                <span
                  className="absolute left-0 top-[8px] w-1 h-1 rounded-full"
                  style={{ background: accent, opacity: 0.7 }}
                />
                {item}
              </li>
            ))}
          </ul>

          {/* Extended detail */}
          {cell.detail && (
            <div
              className="rounded-xl p-4 mb-5"
              style={{
                background: "var(--surface-2)",
                borderLeft: `2px solid ${accent}44`,
              }}
            >
              <p
                className="text-[12.5px] leading-[1.8]"
                style={{ color: "var(--text-secondary)" }}
              >
                {cell.detail}
              </p>
            </div>
          )}

          {/* Discuss button */}
          <a
            href={buildCellLink(cell, phase)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: phaseColorDim(phase),
              color: accent,
              border: `1px solid ${accent}22`,
            }}
          >
            <MessageCircle size={13} />
            Discuss with marsbot
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-colors"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-3 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <ChevronDown
          size={14}
          className="mt-0.5 shrink-0 transition-transform duration-200"
          style={{
            color: "var(--mars-orange)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
        <span
          className="text-[13px] font-semibold leading-snug"
          style={{ color: "var(--mars-orange)" }}
        >
          "{faq.q}"
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p
              className="px-5 pb-4 pl-11 text-[13px] leading-[1.75]"
              style={{ color: "var(--text-secondary)" }}
            >
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LeanerCanvas() {
  const [activePhase, setActivePhase] = useState<1 | 2>(1);
  const [expandedCell, setExpandedCell] = useState<CanvasCell | null>(null);

  const cells = activePhase === 1 ? PHASE_1 : PHASE_2;
  const accent = phaseColor(activePhase);

  const handleExpand = useCallback((cell: CanvasCell) => {
    setExpandedCell(cell);
  }, []);

  return (
    <div
      className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 py-8"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Phase tabs ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActivePhase(1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer"
          style={{
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.5px",
            background:
              activePhase === 1
                ? phaseColorDim(1)
                : "transparent",
            color:
              activePhase === 1
                ? phaseColor(1)
                : "var(--text-muted)",
            border: `1px solid ${activePhase === 1 ? "rgba(91,138,191,0.2)" : "var(--border-subtle)"}`,
          }}
        >
          <Layers size={13} />
          Phase 1 — Near Term
        </button>
        <button
          onClick={() => setActivePhase(2)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer"
          style={{
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.5px",
            background:
              activePhase === 2
                ? phaseColorDim(2)
                : "transparent",
            color:
              activePhase === 2
                ? phaseColor(2)
                : "var(--text-muted)",
            border: `1px solid ${activePhase === 2 ? "rgba(232,98,42,0.2)" : "var(--border-subtle)"}`,
          }}
        >
          <Rocket size={13} />
          Phase 2 — Interplanetary
        </button>
      </div>

      {/* ── Phase header ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mb-6"
        >
          <h2
            className="text-2xl font-bold mb-1.5"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.3px" }}
          >
            {activePhase === 1
              ? "Your Data. Your Agent. Your Rules."
              : "Data Is the First Interplanetary Commodity"}
          </h2>
          <p
            className="text-sm italic max-w-xl"
            style={{ color: "var(--text-muted)" }}
          >
            {activePhase === 1
              ? "A personal AI agent platform that teaches you what's possible — by running alongside you, not in front of you."
              : "When latency makes real-time impossible, your structured identity is what lets autonomous systems act on your behalf."}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* ── Canvas grid ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="hidden lg:grid rounded-2xl overflow-hidden"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            gridTemplateRows: "auto auto auto",
            gap: "1px",
            background: "var(--border-subtle)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 4px 40px rgba(0,0,0,0.3)",
          }}
        >
          {cells.map((cell) => (
            <Cell
              key={cell.id}
              cell={cell}
              phase={activePhase}
              onExpand={handleExpand}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Mobile: stacked cards ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`mobile-${activePhase}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {cells.map((cell) => (
            <motion.button
              key={cell.id}
              onClick={() => handleExpand(cell)}
              className="text-left w-full rounded-xl p-4 cursor-pointer"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-subtle)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[2px]"
                  style={{ fontFamily: "var(--font-mono)", color: accent }}
                >
                  {cell.label}
                </span>
                <ChevronRight size={12} style={{ color: accent, opacity: 0.5 }} />
              </div>
              <ul className="space-y-1.5">
                {cell.items.slice(0, 2).map((item, i) => (
                  <li
                    key={i}
                    className="text-[11.5px] leading-[1.6] pl-3 relative"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span
                      className="absolute left-0 top-[6px] w-1 h-1 rounded-full"
                      style={{ background: accent, opacity: 0.5 }}
                    />
                    {item}
                  </li>
                ))}
                {cell.items.length > 2 && (
                  <li
                    className="text-[11px] pl-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    +{cell.items.length - 2} more…
                  </li>
                )}
              </ul>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Bridge section ─────────────────────────────────────────────────── */}
      <div
        className="my-12 rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Gradient top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: "linear-gradient(90deg, #5b8abf, var(--mars-orange))",
            opacity: 0.7,
          }}
        />

        <span
          className="text-[10px] font-semibold uppercase tracking-[3px] block mb-3"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          The Connection
        </span>
        <h3
          className="text-lg sm:text-xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Why Phase 1 Leads to Phase 2
        </h3>
        <p
          className="text-sm leading-relaxed mb-3 max-w-2xl"
          style={{ color: "var(--text-secondary)" }}
        >
          If you build the personal structured data standard now — while the
          world is figuring out AI agents — you own the rails when data needs to
          travel beyond Earth.
        </p>
        <p
          className="text-sm leading-relaxed mb-6 max-w-2xl"
          style={{ color: "var(--text-secondary)" }}
        >
          The same architecture that lets your agent know you across apps today
          is what lets your agent act on your behalf across planets tomorrow. The
          structured dataset is the constant. The distance changes.
        </p>

        {/* Phase connector */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="text-[12px] font-medium px-4 py-2 rounded-lg"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(91, 138, 191, 0.1)",
              color: "#5b8abf",
              border: "1px solid rgba(91, 138, 191, 0.15)",
            }}
          >
            Structured personal data + agent
          </span>
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
          >
            → scales to →
          </span>
          <span
            className="text-[12px] font-medium px-4 py-2 rounded-lg"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(232, 98, 42, 0.1)",
              color: "var(--mars-orange)",
              border: "1px solid rgba(232, 98, 42, 0.15)",
            }}
          >
            Portable identity for autonomous systems at distance
          </span>
        </div>
      </div>

      {/* ── Anticipated questions ──────────────────────────────────────────── */}
      <div className="mb-12">
        <span
          className="text-[10px] font-semibold uppercase tracking-[3px] block mb-2"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          Preparation
        </span>
        <h3
          className="text-lg sm:text-xl font-bold mb-5"
          style={{ color: "var(--text-primary)" }}
        >
          Anticipated Tough Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} faq={faq} />
          ))}
        </div>
      </div>

      {/* ── Closing one-liner ──────────────────────────────────────────────── */}
      <div className="text-center py-12 relative">
        <span
          className="text-[10px] uppercase tracking-[3px] block mb-4"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}
        >
          The One-Liner
        </span>
        <p
          className="text-lg sm:text-xl font-semibold max-w-xl mx-auto leading-relaxed"
          style={{ color: "var(--text-primary)" }}
        >
          Corporations built empires on structured data about you.
          <br />
          <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
            We're giving you the same thing — and making it portable enough to
            leave the planet.
          </span>
        </p>
      </div>

      {/* ── Expanded cell overlay ──────────────────────────────────────────── */}
      <AnimatePresence>
        {expandedCell && (
          <ExpandedCell
            cell={expandedCell}
            phase={activePhase}
            onClose={() => setExpandedCell(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
