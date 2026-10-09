# What Did I Miss? — The Unread Problem 💬⚡

> **Hackathon Challenge:** "The Unread Problem - What Did I Miss?"  
> **100% Client-Side Local AI** powered by [`@mlc-ai/web-llm`](https://github.com/mlc-ai/web-llm) and **WebGPU**.  
> **Zero servers, zero API keys, zero cloud data leakage.**

---

## 🌟 Overview

When returning to Slack, Discord, Microsoft Teams, or WhatsApp after hours away, professionals face a wall of unread messages. Reading through hundreds of conversational turns is exhausting and time-consuming.

**What Did I Miss?** solves this problem by using **WebLLM** running **100% locally inside your browser's WebGPU engine**. It parses chaotic chat logs into structured, actionable intelligence—without your company's proprietary discussions or credentials ever leaving your machine.

---

## ✨ Key Features

1. **100% On-Device & Private (WebLLM + WebGPU)**
   - Matrix operations and neural weights execute in the browser via WebGPU compute shaders.
   - Zero telemetry, zero server endpoints, enterprise-grade privacy by default.
   - Model weights are cached locally via Cache API / IndexedDB for near-instant repeat loads.

2. **Strict Structured JSON Extraction**
   - **`summary`**: Concise 2-3 sentence executive recap of what happened.
   - **`key_decisions`**: Bulleted list of consensus reached and actions approved.
   - **`action_items`**: Interactive checklist containing:
     - `task`
     - `assignee`
     - `deadline`
     - Interactive checkable state
   - **`mentions`**: All `@handles` and participants tagged in the discussion.
   - **`urgency`**: Categorized as `High` (outages/blockers), `Medium` (milestones/releases), or `Low` (async design/general).

3. **Preloaded Real-World Sample Chats**
   - 🔥 **Prod Incident & Outage**: Critical database replica lag, query kill, and rollback.
   - 🚀 **Q4 Feature Launch**: Scope cutoff, Okta SSO postponement, QA regression timeline.
   - 💬 **Design Review & UX**: Mobile bottom tab bar vs hamburger menu consensus.
   - ⚡ **Sprint Standup**: Blocker resolution and WebLLM caching strategy.

4. **Multiple Local Models + Instant Demo Fallback**
   - **Qwen 2.5 (0.5B Instruct)**: Recommended (~350 MB download, fast, excellent JSON formatting).
   - **SmolLM 2 (360M Instruct)**: Ultra-lightweight (~190 MB download, low VRAM).
   - **Llama 3.2 (1B Instruct)**: Meta's 1B model for deeper reasoning (~880 MB).
   - **Instant Demo Engine**: Zero-download simulated mode for instant hackathon presentation judging on machines without WebGPU.

5. **Executive Export & Developer Tools**
   - **Export Brief**: 1-click Markdown catch-up report ready to paste into Notion or email.
   - **Raw JSON Inspector**: View the raw schema-compliant JSON emitted by the local model.
   - **Download JSON**: Export structured JSON artifacts for downstream integrations.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Modern browser with WebGPU support: **Google Chrome 113+**, **Microsoft Edge 113+**, or **Brave**.
  *(If your browser does not support WebGPU, the app automatically offers the Instant Demo Mode!)*

### Setup & Run
```bash
# Navigate to the project directory
cd C:\Users\LENOVO\.gemini\antigravity\scratch\what-did-i-miss

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Then open `http://localhost:5173` (or the port shown in your terminal) in your WebGPU-enabled browser.

---

## 🏗️ Technical Architecture

```
[ Raw Chat Log / Sample Presets ]
               │
               ▼
   [ React Frontend (Vite + TS) ]
               │
               ▼
     [ WebLLM Service Layer ]
        ├── WebGPU Hardware Adapter Detection
        ├── Cache API Check (hasModelInCache)
        └── System Prompt & JSON Grammar Enforcement
               │
               ▼
[ WebLLM Runtime (@mlc-ai/web-llm) ]
   (Runs in-browser on client GPU via WebGPU Shaders)
               │
               ▼
[ Streaming Tokens / JSON Extractor ]
   (Resilient regex repair & schema normalization)
               │
               ▼
[ Parsed Intelligence Dashboard ]
   ├── 🔥 Urgency Banner (High / Medium / Low)
   ├── 📄 Executive Summary (with Copy)
   ├── ✅ Key Decisions List
   ├── 📋 Interactive Action Items (Task, Assignee, Deadline)
   ├── 👥 Tagged Mentions & Participants
   └── 💻 Raw JSON & Markdown Export
```

---

## 🔒 Privacy & Security Guarantee

All inference takes place in-memory on the client's GPU. There are **no backend servers**, **no third-party API proxies**, and **no network requests containing chat content**.
