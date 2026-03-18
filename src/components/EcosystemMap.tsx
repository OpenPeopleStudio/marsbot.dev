import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Globe,
  Shield,
  Server,
  Fingerprint,
  type LucideIcon,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  role: string;
  status: "shipped" | "active" | "beta" | "planned";
  icon: LucideIcon;
  description: string;
  tech: string[];
}

const PROJECTS: Project[] = [
  {
    id: "mars-hq",
    name: "mars-hq",
    role: "Personal OS Platform",
    status: "active",
    icon: Server,
    description:
      "Monorepo with 22+ packages: runtime, gateway, providers, channels, skills, sandbox, vault, workflows, CLI, TUI, web app.",
    tech: ["Node.js", "Next.js", "Supabase", "TypeScript"],
  },
  {
    id: "open-people",
    name: "open-people",
    role: "Data Identity Standard",
    status: "active",
    icon: Fingerprint,
    description:
      "Portable identity format for human-owned AI agents. The data standard that marsbot implements.",
    tech: ["TypeScript", "JSON Schema"],
  },
  {
    id: "mars-mac",
    name: "mars-mac",
    role: "Native macOS Daily Driver",
    status: "beta",
    icon: Monitor,
    description:
      "Native SwiftUI macOS app. Sentry Mode, MCP device node, gateway host. Replaces Electron.",
    tech: ["Swift 6", "SwiftUI", "GRDB", "Vision"],
  },
  {
    id: "mars-mobile",
    name: "mars-mobile",
    role: "Native iOS Daily Driver",
    status: "beta",
    icon: Smartphone,
    description:
      "Native iOS app with 99 MCP tools, witness capture, outpost mode. Connected via Tailscale.",
    tech: ["Swift 6", "SwiftUI", "UIKit"],
  },
  {
    id: "marsbot-dev",
    name: "marsbot.dev",
    role: "Public Brand Site",
    status: "active",
    icon: Globe,
    description:
      "Astro 5 static site with React islands. Ecosystem visualization, docs, changelog.",
    tech: ["Astro 5", "React", "Tailwind"],
  },
  {
    id: "redblue",
    name: "redblue",
    role: "Security Validation Toolkit",
    status: "active",
    icon: Shield,
    description:
      "Red/blue team security toolkit. 11 modules, CVSS-lite scoring, scan orchestrator.",
    tech: ["TypeScript", "Node.js"],
  },
  {
    id: "personal-space",
    name: "personal-space",
    role: "Public Spatial Presence",
    status: "shipped",
    icon: Globe,
    description:
      "Public web presence at tomlane.space. Supabase edge functions, real-time visitor connections.",
    tech: ["Supabase", "Edge Functions", "React"],
  },
];

const TIERS: { label: string; ids: string[] }[] = [
  { label: "Identity Standard", ids: ["open-people"] },
  { label: "Platform Core", ids: ["mars-hq"] },
  { label: "Native Surfaces", ids: ["mars-mac", "mars-mobile"] },
  { label: "Web & Tools", ids: ["marsbot-dev", "personal-space", "redblue"] },
];

const STATUS_COLORS: Record<string, string> = {
  shipped: "var(--success)",
  active: "var(--mars-orange)",
  beta: "var(--warning)",
  planned: "var(--text-muted)",
};

function ProjectNode({
  project,
  isSelected,
  onClick,
  delay,
}: {
  project: Project;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  delay: number;
}) {
  const Icon = project.icon;
  const color = STATUS_COLORS[project.status];

  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-none p-0"
      whileHover={{ scale: 1.06 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300"
        style={{
          borderColor: isSelected ? color : `color-mix(in srgb, ${color} 45%, transparent)`,
          background: isSelected
            ? `color-mix(in srgb, ${color} 14%, var(--surface-1))`
            : "var(--surface-1)",
          boxShadow: isSelected
            ? `0 0 18px color-mix(in srgb, ${color} 18%, transparent)`
            : "none",
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <span
        className="text-[10px] sm:text-[11px] font-mono font-medium whitespace-nowrap transition-colors duration-200"
        style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {project.name}
      </span>
    </motion.button>
  );
}

function TierConnector() {
  return (
    <div className="flex justify-center items-center h-8 w-full pointer-events-none">
      <div
        className="w-px h-full"
        style={{ background: "var(--border-medium)", opacity: 0.45 }}
      />
    </div>
  );
}

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
            aria-label="Close"
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

export default function EcosystemMap() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedProject = PROJECTS.find((p) => p.id === selected);

  return (
    <div>
      {/* Map */}
      <div
        className="relative w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-6 py-8 sm:px-10 sm:py-10"
        onClick={() => setSelected(null)}
      >
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none rounded-xl" />

        {/* Tier rows */}
        <div className="relative flex flex-col items-center">
          {TIERS.map((tier, tierIndex) => (
            <div key={tier.label} className="w-full flex flex-col items-center">
              {tierIndex > 0 && <TierConnector />}

              {/* Tier label */}
              <div
                className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                {tier.label}
              </div>

              {/* Nodes */}
              <div className="flex items-center justify-center gap-6 sm:gap-10">
                {tier.ids.map((id, nodeIndex) => {
                  const project = PROJECTS.find((p) => p.id === id)!;
                  return (
                    <ProjectNode
                      key={id}
                      project={project}
                      isSelected={selected === id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(selected === id ? null : id);
                      }}
                      delay={tierIndex * 0.1 + nodeIndex * 0.07}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4 text-[9px] font-mono text-[var(--text-muted)]">
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
