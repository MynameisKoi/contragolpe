// ─── CONTRAGOLPE Type Definitions ────────────────────────────────────────────

export type LevelId = 1 | 2 | 3 | 4;

export type LevelStatus = "locked" | "active" | "breached";

export type MessageRole = "user" | "agent" | "system" | "tool";

export interface McpToolCall {
  id: string;
  toolName: string;
  input: Record<string, string>;
  output: string;
  status: "running" | "completed" | "poisoned";
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  toolCall?: McpToolCall;
  isFlagCapture?: boolean;
  flagCaptured?: string;
}

export interface HintEntry {
  id: string;
  label: string;
  text: string;
}

export interface RemediationTip {
  title: string;
  description: string;
}

export interface Challenge {
  id: LevelId;
  codename: string;
  title: string;
  owaspRef: string;
  owaspLabel: string;
  agentName: string;
  agentRole: string;
  vulnerabilityClass: string;
  briefSummary: string;
  detailedExplanation: string;
  hints: HintEntry[];
  remediation: RemediationTip[];
  flag: string;
  mockTools?: MockTool[];
  systemPrompt: string;
  welcomeMessage: string;
  samplePayloads: string[];
}

export interface MockTool {
  name: string;
  description: string;
  triggerKeywords: string[];
  outputTemplate: string;
  isPoisoned: boolean;
  poisonPayload?: string;
}

export interface TelemetryState {
  currentLevel: LevelId;
  levelStatuses: Record<LevelId, LevelStatus>;
  capturedFlags: string[];
  totalMessages: number;
  sessionStart: number;
}

export interface ApiChatRequest {
  message: string;
  levelId: LevelId;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ApiChatResponse {
  reply: string;
  toolCall?: McpToolCall;
  flagDetected?: string;
  error?: string;
}
