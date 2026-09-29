"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Terminal,
  Cpu,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Send,
  Flag,
  Zap,
  Activity,
  Eye,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader,
  BookOpen,
  Target,
  Wrench,
  Unlock,
} from "lucide-react";
import { getAllChallenges, getChallenge } from "@/lib/challenges";
import type {
  LevelId,
  LevelStatus,
  ChatMessage,
  McpToolCall,
  TelemetryState,
} from "@/types/game";

// ─── Utility ─────────────────────────────────────────────────────────────────
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const FLAG_REGEX = /CTRG\{[^}]+\}/g;

function highlightFlag(text: string): React.ReactNode {
  const parts = text.split(FLAG_REGEX);
  const flags = text.match(FLAG_REGEX) ?? [];
  if (flags.length === 0) return text;
  return parts.reduce<React.ReactNode[]>((acc, part, i) => {
    acc.push(part);
    if (flags[i]) {
      acc.push(
        <span
          key={i}
          className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-900/40 text-red-300 border border-red-500/40 animate-pulse mx-1"
        >
          {flags[i]}
        </span>
      );
    }
    return acc;
  }, []);
}

// ─── MCP Tool Chip ────────────────────────────────────────────────────────────
function McpToolChip({ toolCall }: { toolCall: McpToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const isPoisoned = toolCall.status === "poisoned";
  return (
    <div
      className={cn(
        "tool-chip p-3 my-2 cursor-pointer select-none transition-all duration-200",
        isPoisoned ? "border-red-500/40 bg-red-900/10" : ""
      )}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center gap-2">
        {toolCall.status === "running" ? (
          <Loader className="w-3 h-3 text-emerald-400 animate-spin" />
        ) : isPoisoned ? (
          <AlertTriangle className="w-3 h-3 text-red-400" />
        ) : (
          <CheckCircle className="w-3 h-3 text-emerald-400" />
        )}
        <span className={cn("text-xs font-mono font-bold", isPoisoned ? "text-red-400" : "text-emerald-300")}>
          {isPoisoned ? "☠ POISONED MCP CALL" : "⚙ MCP TOOL CALL"}
        </span>
        <span className="text-zinc-600 text-xs">→</span>
        <code className="text-xs font-mono text-zinc-300 bg-zinc-900 px-1 rounded">
          {toolCall.toolName}()
        </code>
        <span className="ml-auto text-zinc-700 text-xs font-mono">{formatTime(toolCall.timestamp)}</span>
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-zinc-600" />
        ) : (
          <ChevronRight className="w-3 h-3 text-zinc-600" />
        )}
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-zinc-700/50 pt-3">
          <div>
            <span className="text-xs text-zinc-600 uppercase tracking-wider">Input</span>
            <pre className="text-xs text-zinc-400 mt-1 whitespace-pre-wrap font-mono bg-zinc-900 p-2 rounded">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>
          <div>
            <span className={cn("text-xs uppercase tracking-wider", isPoisoned ? "text-red-400" : "text-zinc-600")}>
              {isPoisoned ? "⚠ Poisoned Tool Output" : "Output"}
            </span>
            <pre
              className={cn(
                "text-xs mt-1 whitespace-pre-wrap p-2 rounded font-mono",
                isPoisoned
                  ? "bg-red-900/20 text-red-300 border border-red-500/20"
                  : "bg-zinc-900 text-emerald-300"
              )}
            >
              {toolCall.output}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Flag Capture Modal ───────────────────────────────────────────────────────
function FlagCaptureBanner({
  flag,
  level,
  onDismiss,
}: {
  flag: string;
  level: number;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="flag-banner max-w-lg w-full mx-4 p-8 rounded-2xl text-center">
        <div className="text-6xl mb-4">🚨</div>
        <div className="text-xs font-mono text-red-400 uppercase tracking-[0.3em] mb-2">
          ⚡ SECURITY BREACH CONFIRMED ⚡
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">LEVEL {level} COMPROMISED</h2>
        <p className="text-sm text-zinc-400 mb-4">Counter-strike vector successfully exploited</p>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent my-4" />
        <div className="text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Flag Captured</div>
        <div className="bg-black/60 border border-red-500/40 rounded-xl px-5 py-4 font-mono text-red-400 text-base font-bold tracking-wider mb-6 break-all">
          {flag}
        </div>
        <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
          Review the post-exploit analysis in the chat and the Defensive Hardening Guide to understand how to prevent this in production systems.
        </p>
        <button
          onClick={onDismiss}
          className="btn-primary px-8 py-3 rounded-xl font-bold text-sm"
        >
          Continue Mission →
        </button>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <div className="msg-system p-3 rounded-lg animate-type-in">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            System
          </span>
          <span className="ml-auto text-zinc-700 text-xs font-mono">{formatTime(msg.timestamp)}</span>
        </div>
        <p className="text-sm text-emerald-300 font-mono leading-relaxed">{msg.content}</p>
      </div>
    );
  }

  return (
    <div className={cn("animate-type-in", isUser ? "flex justify-end" : "flex justify-start")}>
      <div className={cn("max-w-[88%] px-4 py-3 text-sm", isUser ? "msg-user" : "msg-agent")}>
        <div className="flex items-center gap-2 mb-1.5">
          {isUser ? (
            <>
              <span className="text-xs font-mono text-emerald-400 font-bold tracking-wide">
                ▶ YOU
              </span>
              <span className="ml-auto text-zinc-700 text-xs font-mono">{formatTime(msg.timestamp)}</span>
            </>
          ) : (
            <>
              <Cpu className="w-3 h-3 text-zinc-500" />
              <span className="text-xs font-mono text-zinc-500 font-semibold">AGENT</span>
              <span className="ml-auto text-zinc-700 text-xs font-mono">{formatTime(msg.timestamp)}</span>
            </>
          )}
        </div>
        {msg.toolCall && <McpToolChip toolCall={msg.toolCall} />}
        <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-zinc-200">
          {highlightFlag(msg.content)}
        </div>
      </div>
    </div>
  );
}

// ─── Hints Panel ─────────────────────────────────────────────────────────────
function HintsPanel({ levelId }: { levelId: LevelId }) {
  const challenge = getChallenge(levelId);
  const [openHints, setOpenHints] = useState<Set<string>>(new Set());
  if (!challenge) return null;

  const toggleHint = (id: string) => {
    setOpenHints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {challenge.hints.map((hint, i) => (
        <div key={hint.id} className="glass-card rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
            onClick={() => toggleHint(hint.id)}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0",
                i === 0
                  ? "bg-amber-900/40 text-amber-400 border border-amber-500/30"
                  : "bg-red-900/40 text-red-400 border border-red-500/30"
              )}
            >
              {i + 1}
            </div>
            <span className="text-sm font-semibold text-zinc-300 flex-1 text-left">{hint.label}</span>
            {openHints.has(hint.id) ? (
              <ChevronDown className="w-4 h-4 text-zinc-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            )}
          </button>
          {openHints.has(hint.id) && (
            <div className="px-4 pb-4 animate-type-in">
              <div
                className={cn(
                  "p-3 rounded-lg text-sm font-mono leading-relaxed",
                  i === 0
                    ? "bg-amber-900/10 border border-amber-500/20 text-amber-200"
                    : "bg-red-900/10 border border-red-500/20 text-red-200"
                )}
              >
                {hint.text}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Remediation Panel ────────────────────────────────────────────────────────
function RemediationPanel({ levelId }: { levelId: LevelId }) {
  const challenge = getChallenge(levelId);
  if (!challenge) return null;
  return (
    <div className="space-y-3">
      {challenge.remediation.map((tip, i) => (
        <div key={i} className="glass-card rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300 mb-1">{tip.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{tip.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Vulnerability Brief ──────────────────────────────────────────────────────
function VulnerabilityBrief({ levelId }: { levelId: LevelId }) {
  const challenge = getChallenge(levelId);
  if (!challenge) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-red-900/30 text-red-400 border border-red-500/30">
          {challenge.owaspRef}
        </span>
        <span className="text-xs text-zinc-500">{challenge.owaspLabel}</span>
      </div>
      <div className="glass-card rounded-xl p-4">
        <p className="text-sm text-zinc-300 leading-relaxed">{challenge.briefSummary}</p>
      </div>
      <div className="glass-card rounded-xl p-4">
        <div className="text-xs font-mono text-zinc-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen className="w-3 h-3" /> Vulnerability Analysis
        </div>
        <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line font-mono">
          {challenge.detailedExplanation.replace(/\*\*/g, "").replace(/`/g, "'")}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card rounded-xl p-3">
          <div className="text-xs text-zinc-600 mb-1">Target Agent</div>
          <div className="text-xs font-mono font-bold text-emerald-400">{challenge.agentName}</div>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="text-xs text-zinc-600 mb-1">Vuln Class</div>
          <div className="text-xs font-mono font-bold text-red-400 leading-tight">{challenge.vulnerabilityClass}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Sample Payloads ──────────────────────────────────────────────────────────
function SamplePayloads({
  levelId,
  onSelect,
}: {
  levelId: LevelId;
  onSelect: (p: string) => void;
}) {
  const challenge = getChallenge(levelId);
  if (!challenge) return null;
  return (
    <div className="space-y-2">
      {challenge.samplePayloads.map((payload, i) => (
        <button
          key={i}
          onClick={() => onSelect(payload)}
          className="w-full text-left p-3 rounded-xl text-xs font-mono text-zinc-500 hover:text-emerald-300 hover:bg-emerald-900/10 border border-transparent hover:border-emerald-500/20 transition-all leading-relaxed group"
        >
          <span className="text-zinc-700 mr-2 group-hover:text-emerald-700">[{i + 1}]</span>
          {payload}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ContragolpePage() {
  const challenges = getAllChallenges();

  const [telemetry, setTelemetry] = useState<TelemetryState>({
    currentLevel: 1,
    levelStatuses: { 1: "active", 2: "locked", 3: "locked", 4: "locked" },
    capturedFlags: [],
    totalMessages: 0,
    sessionStart: Date.now(),
  });

  const [messagesByLevel, setMessagesByLevel] = useState<Record<number, ChatMessage[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rightTab, setRightTab] = useState<"brief" | "hints" | "remediation" | "payloads">("brief");
  const [captureModal, setCaptureModal] = useState<{ flag: string; level: number } | null>(null);
  const [showMobileIntel, setShowMobileIntel] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentLevel = telemetry.currentLevel as LevelId;
  const currentChallenge = getChallenge(currentLevel);
  const currentMessages = messagesByLevel[currentLevel] ?? [];

  // Auto scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length]);

  // Seed welcome messages once
  useEffect(() => {
    setMessagesByLevel((prev) => {
      const updated = { ...prev };
      for (const ch of challenges) {
        if (updated[ch.id].length === 0) {
          updated[ch.id] = [
            {
              id: generateId(),
              role: "system",
              content: ch.welcomeMessage,
              timestamp: Date.now(),
            },
          ];
        }
      }
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchLevel = useCallback(
    (levelId: LevelId) => {
      if (telemetry.levelStatuses[levelId] === "locked") return;
      setTelemetry((prev) => ({ ...prev, currentLevel: levelId }));
      setRightTab("brief");
      setInputValue("");
    },
    [telemetry.levelStatuses]
  );

  const sendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed.slice(0, 2000),
      timestamp: Date.now(),
    };

    setMessagesByLevel((prev) => ({
      ...prev,
      [currentLevel]: [...(prev[currentLevel] ?? []), userMsg],
    }));
    setInputValue("");
    setIsLoading(true);
    setTelemetry((prev) => ({ ...prev, totalMessages: prev.totalMessages + 1 }));

    try {
      const history = (messagesByLevel[currentLevel] ?? [])
        .slice(-10)
        .filter((m) => m.role === "user" || m.role === "agent")
        .map((m) => ({
          role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed.slice(0, 2000),
          levelId: currentLevel,
          history,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data: {
        reply?: string;
        toolCall?: McpToolCall;
        flagDetected?: string;
        error?: string;
      } = await res.json();

      const agentMsg: ChatMessage = {
        id: generateId(),
        role: "agent",
        content: data.reply ?? "No response.",
        timestamp: Date.now(),
        toolCall: data.toolCall,
        isFlagCapture: !!data.flagDetected,
        flagCaptured: data.flagDetected,
      };

      setMessagesByLevel((prev) => ({
        ...prev,
        [currentLevel]: [...(prev[currentLevel] ?? []), agentMsg],
      }));

      if (data.flagDetected) {
        const flag = data.flagDetected;
        if (!telemetry.capturedFlags.includes(flag)) {
          setTelemetry((prev) => {
            const nextFlags = [...prev.capturedFlags, flag];
            const nextStatuses = { ...prev.levelStatuses } as Record<LevelId, LevelStatus>;
            nextStatuses[currentLevel] = "breached";
            const nextLevelId = (currentLevel + 1) as LevelId;
            if (nextLevelId <= 4 && nextStatuses[nextLevelId] === "locked") {
              nextStatuses[nextLevelId] = "active";
            }
            return { ...prev, capturedFlags: nextFlags, levelStatuses: nextStatuses };
          });
          setCaptureModal({ flag, level: currentLevel });
        }
      }
    } catch {
      setMessagesByLevel((prev) => ({
        ...prev,
        [currentLevel]: [
          ...(prev[currentLevel] ?? []),
          {
            id: generateId(),
            role: "system",
            content: "⚠ Connection error. Please retry.",
            timestamp: Date.now(),
          },
        ],
      }));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isLoading, currentLevel, messagesByLevel, telemetry.capturedFlags]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const breachedCount = telemetry.capturedFlags.length;

  const levelConfig: Array<{
    id: LevelId;
    codename: string;
    icon: React.ElementType;
  }> = [
    { id: 1, codename: "DIRECT INCURSION", icon: Shield },
    { id: 2, codename: "POISONED SUPPLY CHAIN", icon: AlertTriangle },
    { id: 3, codename: "BROKEN BOUNDARIES", icon: Unlock },
    { id: 4, codename: "SILENT EXFILTRATION", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] tactical-grid flex flex-col overflow-hidden">
      {/* FLAG CAPTURE MODAL */}
      {captureModal && (
        <FlagCaptureBanner
          flag={captureModal.flag}
          level={captureModal.level}
          onDismiss={() => setCaptureModal(null)}
        />
      )}

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <header className="flex-shrink-0 sticky top-0 z-40 border-b border-emerald-500/15 bg-[#09090b]/96 backdrop-blur-md">
        {/* Title row */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center emerald-glow">
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-black tracking-[0.2em] text-emerald-400 emerald-glow-text font-mono">
                CONTRAGOLPE
              </div>
              <div className="text-xs text-zinc-600 font-mono tracking-widest">
                // ADVERSARIAL AGENT WARGAME
              </div>
            </div>
          </div>

          {/* Center progress */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flag className="w-3.5 h-3.5 text-red-400" />
              <span className="text-sm font-mono font-bold">
                <span className="text-red-400">{breachedCount}</span>
                <span className="text-zinc-700"> / 4 </span>
                <span className="text-zinc-500 font-normal text-xs">BREACHED</span>
              </span>
            </div>
            <div className="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full progress-fill rounded-full transition-all duration-700"
                style={{ width: `${(breachedCount / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Right badges */}
          <div className="flex items-center gap-2">
            <a
              href="https://guild.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-900/10 hover:bg-emerald-900/20 transition-colors text-xs font-mono text-emerald-400"
            >
              <div className="pulse-dot" />
              GUILD.AI
              <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
            </a>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              ONLINE
            </div>
          </div>
        </div>

        {/* Level tabs */}
        <nav className="flex items-stretch overflow-x-auto">
          {levelConfig.map((lc) => {
            const status = telemetry.levelStatuses[lc.id];
            const isActive = lc.id === currentLevel;
            const isLocked = status === "locked";
            const isBreached = status === "breached";
            const Icon = lc.icon;
            return (
              <button
                key={lc.id}
                onClick={() => switchLevel(lc.id)}
                disabled={isLocked}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-5 py-2.5 text-xs font-mono font-bold whitespace-nowrap transition-all border-b-2 flex-1 justify-center sm:justify-start",
                  isLocked && "text-zinc-700 border-transparent cursor-not-allowed",
                  isActive && !isLocked && "level-tab-active",
                  !isActive && !isLocked && "level-tab-inactive hover:text-zinc-300 hover:border-zinc-700"
                )}
              >
                {isLocked ? (
                  <Lock className="w-3 h-3" />
                ) : isBreached ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                <span>LVL {lc.id}</span>
                <span className="hidden md:inline text-zinc-700">—</span>
                <span className="hidden md:inline">{lc.codename}</span>
                {isBreached && (
                  <span className="ml-1 text-emerald-500 text-xs">✓</span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT: CHAT */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 border-r border-zinc-800/50">
          {/* Challenge bar */}
          {currentChallenge && (
            <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/20">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-red-400 font-black tracking-wider">
                      {currentChallenge.owaspRef}
                    </span>
                    <span className="text-zinc-700 text-xs">·</span>
                    <span className="text-xs font-mono text-zinc-500 tracking-wider">
                      {currentChallenge.codename}
                    </span>
                  </div>
                  <h1 className="text-sm font-bold text-zinc-100 leading-snug">
                    {currentChallenge.title}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Cpu className="w-3 h-3 text-zinc-600" />
                    <span className="text-xs text-zinc-500 font-mono">
                      Target:{" "}
                      <span className="text-emerald-500 font-bold">{currentChallenge.agentName}</span>
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border",
                    telemetry.levelStatuses[currentLevel] === "breached"
                      ? "bg-emerald-900/20 text-emerald-400 border-emerald-500/25 emerald-glow"
                      : "bg-red-900/15 text-red-400 border-red-500/20 crimson-glow"
                  )}
                >
                  {telemetry.levelStatuses[currentLevel] === "breached" ? (
                    <><ShieldCheck className="w-3 h-3" /> BREACHED</>
                  ) : (
                    <><ShieldAlert className="w-3 h-3" /> ACTIVE</>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll px-4 py-4 space-y-3 min-h-0">
            {currentMessages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start animate-type-in">
                <div className="msg-agent px-4 py-3 flex items-center gap-3 rounded-xl">
                  <Loader className="w-3 h-3 text-emerald-400 animate-spin" />
                  <span className="text-xs font-mono text-zinc-600 cursor-blink">
                    {currentChallenge?.agentName ?? "Agent"} processing
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-zinc-800/50 p-4 bg-[#09090b]/90">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-3 text-emerald-700 font-mono text-xs select-none pointer-events-none">
                  &gt;_
                </span>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.slice(0, 2000))}
                  onKeyDown={handleKeyDown}
                  placeholder={`Send command to ${currentChallenge?.agentName ?? "agent"}... (Enter to send)`}
                  rows={3}
                  maxLength={2000}
                  className="tactical-input w-full pl-8 pr-20 py-3 rounded-xl resize-none text-sm leading-relaxed"
                  disabled={isLoading}
                />
                <div className="absolute right-3 bottom-2.5 text-zinc-700 text-xs font-mono">
                  {inputValue.length}/2000
                </div>
              </div>
              <button
                onClick={() => void sendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className={cn(
                  "btn-primary flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                  (isLoading || !inputValue.trim()) && "opacity-40 cursor-not-allowed hover:transform-none hover:shadow-none"
                )}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex justify-between mt-1.5 px-1">
              <span className="text-xs text-zinc-700 font-mono">↵ Send · ⇧↵ Newline</span>
              <span className="text-xs text-zinc-700 font-mono">
                {telemetry.totalMessages} msg{telemetry.totalMessages !== 1 ? "s" : ""} this session
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: INTEL DRAWER (desktop only) */}
        <aside className="hidden lg:flex flex-col w-96 flex-shrink-0 min-h-0 bg-[#09090b]/70">
          {/* Tab bar */}
          <div className="flex-shrink-0 border-b border-zinc-800/50 flex">
            {(
              [
                { id: "brief", label: "Vuln Brief", icon: BookOpen },
                { id: "hints", label: "Intel", icon: Zap },
                { id: "remediation", label: "Defense", icon: Wrench },
                { id: "payloads", label: "Payloads", icon: Terminal },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setRightTab(id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-mono font-bold transition-all border-b-2",
                  rightTab === id
                    ? "text-emerald-400 border-emerald-500 bg-emerald-900/10"
                    : "text-zinc-700 border-transparent hover:text-zinc-400"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {rightTab === "brief" && <VulnerabilityBrief levelId={currentLevel} />}
            {rightTab === "hints" && (
              <div className="space-y-4">
                <div className="glass-card rounded-xl p-3 border-amber-500/10 bg-amber-900/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                      Progressive Recon Hints
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Reveal hints only when needed. Each one nudges you closer to the exploit.
                  </p>
                </div>
                <HintsPanel levelId={currentLevel} />
              </div>
            )}
            {rightTab === "remediation" && (
              <div className="space-y-4">
                <div className="glass-card rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      Defensive Hardening Guide
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Apply these countermeasures in production AI systems to prevent this class of attack.
                  </p>
                </div>
                <RemediationPanel levelId={currentLevel} />
              </div>
            )}
            {rightTab === "payloads" && (
              <div className="space-y-4">
                <div className="glass-card rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      Rapid-Test Payloads
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Click a payload to load it into the command prompt instantly.
                  </p>
                </div>
                <SamplePayloads
                  levelId={currentLevel}
                  onSelect={(p) => {
                    setInputValue(p);
                    inputRef.current?.focus();
                  }}
                />
              </div>
            )}
          </div>

          {/* Flag tracker footer */}
          <div className="flex-shrink-0 border-t border-zinc-800/50 p-4">
            <div className="text-xs font-mono text-zinc-700 uppercase tracking-widest mb-3">
              Threat Matrix
            </div>
            <div className="space-y-2">
              {challenges.map((ch) => {
                const st = telemetry.levelStatuses[ch.id as LevelId];
                const isBreached = st === "breached";
                const isLocked = st === "locked";
                return (
                  <div key={ch.id} className="flex items-center gap-2">
                    {isBreached ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3 text-zinc-800" />
                    ) : (
                      <XCircle className="w-3 h-3 text-zinc-700" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-mono flex-1 truncate",
                        isBreached ? "text-emerald-400" : isLocked ? "text-zinc-800" : "text-zinc-600"
                      )}
                    >
                      LVL {ch.id} — {ch.codename}
                    </span>
                    {isBreached && (
                      <span className="text-xs text-emerald-700 font-mono">CAPTURED</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE: Intel toggle */}
      <div className="lg:hidden flex-shrink-0 border-t border-zinc-800/50 bg-[#09090b]/95">
        <button
          onClick={() => setShowMobileIntel((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-amber-400 font-bold">Mission Intelligence</span>
          </div>
          {showMobileIntel ? (
            <ChevronDown className="w-4 h-4 text-zinc-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          )}
        </button>
        {showMobileIntel && (
          <div className="px-4 pb-4 space-y-4 max-h-72 overflow-y-auto border-t border-zinc-800/50">
            <div className="pt-4">
              <HintsPanel levelId={currentLevel} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
