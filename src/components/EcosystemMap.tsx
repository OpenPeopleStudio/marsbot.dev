import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Globe,
  Terminal,
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
  x: number;
  y: number;
  connections: string[];
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
    x: 50,
    y: 45,
    connections: [],
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
    x: 50,
    y: 8,
    connections: ["mars-hq"],
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
    x: 15,
    y: 35,
    connections: ["mars-hq"],
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
    x: 85,
    y: 35,
    connections: ["mars-hq"],
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
    x: 20,
    y: 70,
    connections: ["mars-hq"],
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
    x: 80,
    y: 70,
    connections: ["mars-hq"],
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
    x: 50,
    y: 85,
    connections: ["mars-hq"],
  },
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
}: {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = project.icon;
  const color = STATUS_COLORS[project.status];
  const isCenter = project.id === "mars-hq";

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${project.x}%`,
        top: `${project.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 20 : 10,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: isCenter ? 0.2 : 0.4 + Math.random() * 0.3 }}
      whileHover={{ scale: 1.08 }}
      onClick={onClick}
    >
      <div
        className={`relative flex flex-col items-center gap-1.5 ${isCenter ? "scale-110" : ""}`}
      >
        {/* Node circle */}
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300"
          style={{
            borderColor: isSelected ? color : `color-mix(in srgb, ${color} 50%, transparent)`,
            background: isSelected
              ? `color-mix(in srgb, ${color} 15%, var(--surface-1))`
              : "var(--surface-1)",
            boxShadow: isCenter
              ? `0 0 20px color-mix(in srgb, ${color} 20%, transparent)`
              : isSelected
                ? `0 0 15px color-mix(in srgb, ${color} 15%, transparent)`
                : "none",
          }}
        >
          <Icon
            size={isCenter ? 22 : 18}
            style={{ color }}
          />
        </div>

        {/* Label */}
        <span
          className="text-[10px] sm:text-[11px] font-mono font-medium whitespace-nowrap"
          style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}
        >
          {project.name}
        </span>

        {/* Status badge */}
        <span
          className="text-[8px] font-mono font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {project.status}
        </span>
      </div>
    </motion.div>
  );
}

function ConnectionLines({ selected }: { selected: string | null }) {
  const center = PROJECTS.find((p) => p.id === "mars-hq")!;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {PROJECTS.filter((p) => p.connections.length > 0).map((project) => {
        const target = PROJECTS.find((t) => t.id === project.connections[0]);
        if (!target) return null;

        const isActive = selected === project.id || selected === target.id;

        return (
          <line
            key={`${project.id}-${target.id}`}
            x1={`${project.x}%`}
            y1={`${project.y}%`}
            x2={`${target.x}%`}
            y2={`${target.y}%`}
            stroke={isActive ? "var(--mars-orange)" : "var(--border-medium)"}
            strokeWidth={isActive ? 1.5 : 1}
            strokeDasharray={isActive ? "none" : "4 4"}
            opacity={isActive ? 0.8 : 0.4}
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}

function DetailPanel({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const color = STATUS_COLORS[project.status];

  return (
    <motion.div
      className="absolute z-30 w-72 sm:w-80"
      style={{
        left: `${Math.min(Math.max(project.x, 25), 75)}%`,
        top: `${project.y + 10}%`,
        transform: "translate(-50%, 0)",
      }}
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="glass-card rounded-xl border border-[var(--border-medium)] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
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
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors"
          >
            x
          </button>
        </div>

        <p className="text-[11px] font-mono text-[var(--mars-orange)] mb-2">
          {project.role}
        </p>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded"
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
    <div
      className="relative w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] overflow-hidden"
      style={{ minHeight: "500px" }}
      onClick={() => setSelected(null)}
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

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

      {/* Detail panel */}
      <AnimatePresence>
        {selectedProject && (
          <DetailPanel
            key={selectedProject.id}
            project={selectedProject}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

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
  );
}
