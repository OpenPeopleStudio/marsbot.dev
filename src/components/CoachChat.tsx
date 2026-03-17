import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RotateCcw, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Mermaid renderer ─────────────────────────────────────────────────────────
function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            background: "#070a0e",
            primaryColor: "#e8622a",
            primaryTextColor: "#e8ecf1",
            primaryBorderColor: "#2a3a50",
            lineColor: "#505b6b",
            secondaryColor: "#0c1017",
            tertiaryColor: "#121820",
            edgeLabelBackground: "#0c1017",
            fontFamily: "JetBrains Mono, SF Mono, monospace",
            fontSize: "13px",
          },
        });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg: rendered } = await mermaid.render(id, code.trim());
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) setError(true);
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code]);

  if (error) return null;
  if (!svg) return (
    <div className="h-16 flex items-center gap-2 text-[var(--text-muted)] text-sm font-mono">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--mars-orange)] animate-pulse" />
      rendering diagram...
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 rounded-lg border border-[var(--border-medium)] overflow-hidden bg-[var(--surface-1)] p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ─── Message content parser ───────────────────────────────────────────────────
function parseContent(content: string) {
  const parts: Array<{ type: "text" | "mermaid" | "code"; content: string; lang?: string }> = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;
  let last = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", content: content.slice(last, match.index) });
    }
    const lang = match[1]?.toLowerCase();
    if (lang === "mermaid") {
      parts.push({ type: "mermaid", content: match[2] });
    } else {
      parts.push({ type: "code", content: match[2], lang: lang || "" });
    }
    last = match.index + match[0].length;
  }

  if (last < content.length) {
    parts.push({ type: "text", content: content.slice(last) });
  }

  return parts;
}

// ─── Text renderer ────────────────────────────────────────────────────────────
function renderText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="text-[var(--text-primary)] font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Inline code
      return <span key={j}>{part.split(/(`[^`]+`)/g).map((p, k) => {
        if (p.startsWith("`") && p.endsWith("`")) {
          return <code key={k} className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--mars-orange)] font-mono text-[0.85em]">{p.slice(1, -1)}</code>;
        }
        return p;
      })}</span>;
    });

    // Heading
    if (line.startsWith("### ")) return <h3 key={i} className="text-[var(--text-primary)] font-semibold mt-4 mb-1 text-sm uppercase tracking-wider opacity-60">{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-[var(--text-primary)] font-semibold mt-5 mb-2">{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={i} className="text-[var(--text-primary)] font-bold mt-6 mb-3 text-lg">{line.slice(2)}</h1>;

    // Bullet
    if (line.match(/^[-•]\s/)) return <div key={i} className="flex gap-2 my-0.5"><span className="text-[var(--mars-orange)] mt-1 shrink-0">·</span><span>{parts}</span></div>;
    if (line.match(/^\d+\.\s/)) return <div key={i} className="flex gap-2 my-0.5"><span className="text-[var(--mars-orange)] shrink-0 font-mono text-xs mt-1">{line.match(/^\d+/)![0]}.</span><span>{parts}</span></div>;

    // Empty line
    if (line.trim() === "") return <div key={i} className="h-2" />;

    return <p key={i} className="my-0.5 leading-relaxed">{parts}</p>;
  });
}

// ─── Single message ───────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const parts = parseContent(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold mt-0.5 ${
        isUser
          ? "bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-medium)]"
          : "bg-[var(--mars-orange)] text-white"
      }`}>
        {isUser ? "you" : "op"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[82%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-medium)]"
            : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
        }`}>
          {parts.map((part, i) => {
            if (part.type === "mermaid") return <MermaidDiagram key={i} code={part.content} />;
            if (part.type === "code") return (
              <pre key={i} className="my-3 p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)] overflow-x-auto">
                <code className="text-xs font-mono text-[var(--text-secondary)]">{part.content}</code>
              </pre>
            );
            return <div key={i}>{renderText(part.content)}</div>;
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Suggested prompts ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What makes this defensible against well-funded competitors?",
  "Walk me through the technical architecture",
  "Show me the data flywheel as a diagram",
  "Is the traction roadmap realistic?",
  "What's the go-to-market strategy?",
  "Where is AI headed and why does this matter long-term?",
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function CoachChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Track scroll position for scroll-to-bottom button visibility
  useEffect(() => {
    const el = messagesAreaRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 120);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, []);

  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;

    setShowSuggestions(false);
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content, timestamp: new Date() };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", timestamp: new Date() };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    abortRef.current = new AbortController();

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: "Something went wrong. Please try again." }
              : m
          )
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }, [input, send]);

  const reset = useCallback(() => {
    if (streaming) abortRef.current?.abort();
    setMessages([]);
    setShowSuggestions(true);
    setInput("");
    setStreaming(false);
  }, [streaming]);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Messages area */}
      <div ref={messagesAreaRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-5 min-h-0 relative">

        {/* Top gradient fade — visible when scrolled */}
        {messages.length > 0 && (
          <div className="sticky top-0 left-0 right-0 h-8 -mt-6 mb-2 bg-gradient-to-b from-[var(--void)] to-transparent pointer-events-none z-10" />
        )}

        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-6 pt-8 pb-4"
          >
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[var(--mars-orange)] flex items-center justify-center text-white font-mono font-bold text-sm mx-auto mb-4">op</div>
              <h3 className="text-[var(--text-primary)] font-semibold">Ask anything about Open People Inc.</h3>
              <p className="text-[var(--text-muted)] text-sm max-w-sm">
                From the canvas to the codebase. Business model, technical architecture, thesis on where AI is headed.
              </p>
            </div>

            {showSuggestions && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => send(s)}
                    className="text-left text-sm px-4 py-3 rounded-lg border border-[var(--border-medium)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:border-[var(--mars-orange)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all duration-150 cursor-pointer"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* Streaming cursor */}
        {streaming && (
          <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-full bg-[var(--mars-orange)] flex items-center justify-center text-xs font-mono font-bold text-white mt-0.5">op</div>
            <div className="bg-[var(--surface-2)] rounded-xl px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--mars-orange)]" style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* Scroll-to-bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={scrollToBottom}
              className="sticky bottom-4 ml-auto mr-2 w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors z-10"
            >
              <ChevronDown size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>



      {/* Input area */}
      <div className="shrink-0 border-t border-[var(--border-subtle)] px-3 sm:px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl border transition-all duration-200"
            style={{
              background: "var(--surface-1)",
              borderColor: inputFocused ? "var(--mars-orange)" : "var(--border-medium)",
              boxShadow: inputFocused ? "0 0 0 1px rgba(232,98,42,0.2)" : "none",
            }}
          >
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask anything about the project…"
              rows={1}
              disabled={streaming}
              className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-[var(--font-body)] focus:outline-none disabled:opacity-50 overflow-hidden"
              style={{ minHeight: "52px", maxHeight: "160px" }}
            />

            {/* Bottom bar — hint + actions */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1 gap-2">
              <span className="text-[10px] font-mono text-[var(--text-muted)] hidden sm:block select-none">
                ↵ send &nbsp;·&nbsp; shift+enter for newline
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] sm:hidden select-none">
                grounded in project docs
              </span>

              <div className="flex items-center gap-1.5 ml-auto">
                {/* Reset */}
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    title="Reset conversation"
                    className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    <RotateCcw size={13} />
                  </button>
                )}

                {/* Send */}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => send(input)}
                  disabled={!input.trim() || streaming}
                  className="h-7 px-3 rounded-lg flex items-center gap-1.5 text-white text-xs font-mono font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "var(--mars-orange)" }}
                >
                  <Send size={12} />
                  <span className="hidden sm:inline">Send</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
