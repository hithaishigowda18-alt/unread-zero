import { CreateMLCEngine, MLCEngine, hasModelInCache } from '@mlc-ai/web-llm';
import type { ChatAnalysisResult, ModelOption, EngineProgress, UrgencyLevel, ActionItem } from '../types';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 (0.5B)',
    tag: 'Recommended · Fast',
    size: '~350 MB',
    vram: '~950 MB',
    description: 'Ultra-fast download, low VRAM footprint, excellent at strict JSON structure.',
  },
  {
    id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    name: 'SmolLM 2 (360M)',
    tag: 'Ultra-Lightweight',
    size: '~190 MB',
    vram: '~380 MB',
    description: 'Extremely tiny footprint for low-end hardware and laptops.',
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 (1B)',
    tag: 'High Fidelity',
    size: '~880 MB',
    vram: '~880 MB',
    description: "Meta's lightweight model with deeper contextual reasoning and nuanced summaries.",
  },
  {
    id: 'simulated-demo-engine',
    name: 'Instant Demo Engine (Offline/Zero-Download)',
    tag: 'Instant Hackathon Mode',
    size: '0 MB',
    vram: '0 MB',
    description: 'Instant parsing without downloading weights. Ideal for immediate presentation testing or machines without WebGPU.',
    isSimulated: true,
  },
];

let engineInstance: MLCEngine | null = null;
let currentLoadedModelId: string | null = null;

export async function checkWebGPUSupport(): Promise<{
  supported: boolean;
  adapterName?: string;
  reason?: string;
}> {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
    return {
      supported: false,
      reason: 'WebGPU is not enabled or supported in this browser. Use Chrome/Edge 113+ with hardware acceleration.',
    };
  }

  try {
    const gpu = (navigator as unknown as { gpu: GPU }).gpu;
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        reason: 'No compatible WebGPU hardware adapter found. Ensure graphics acceleration is enabled.',
      };
    }
    const info = (adapter as any).info || (await (adapter as any).requestAdapterInfo?.()) || {};
    const name = [info.vendor, info.architecture, info.device].filter(Boolean).join(' ') || 'WebGPU Hardware Accelerated';
    return {
      supported: true,
      adapterName: name,
    };
  } catch (err: any) {
    return {
      supported: false,
      reason: err?.message || 'Error initializing WebGPU adapter',
    };
  }
}

export async function checkIsModelCached(modelId: string): Promise<boolean> {
  if (modelId === 'simulated-demo-engine') return true;
  try {
    return await hasModelInCache(modelId);
  } catch {
    return false;
  }
}

export async function initWebLlmEngine(
  modelId: string,
  onProgress?: (progress: EngineProgress) => void
): Promise<MLCEngine | null> {
  if (modelId === 'simulated-demo-engine') {
    onProgress?.({
      state: 'ready',
      progress: 100,
      text: 'Instant demo engine ready (no download required)',
    });
    return null;
  }

  if (engineInstance && currentLoadedModelId === modelId) {
    onProgress?.({
      state: 'ready',
      progress: 100,
      text: `Model ${modelId} is already loaded and ready in WebGPU memory.`,
    });
    return engineInstance;
  }

  onProgress?.({
    state: 'initializing',
    progress: 5,
    text: `Initializing WebGPU engine for ${modelId}...`,
  });

  try {
    const engine = await CreateMLCEngine(modelId, {
      initProgressCallback: (report) => {
        const pct = Math.min(100, Math.round(report.progress * 100));
        let state: EngineProgress['state'] = 'downloading';
        if (pct >= 99 || report.text.toLowerCase().includes('finish')) {
          state = 'ready';
        }
        onProgress?.({
          state,
          progress: pct,
          text: report.text || `Loading model weights (${pct}%)...`,
        });
      },
    });

    engineInstance = engine;
    currentLoadedModelId = modelId;

    onProgress?.({
      state: 'ready',
      progress: 100,
      text: `Engine loaded successfully: ${modelId}`,
    });

    return engine;
  } catch (error: any) {
    const errorMsg = error?.message || 'Failed to initialize WebLLM engine.';
    onProgress?.({
      state: 'error',
      progress: 0,
      text: errorMsg,
      error: errorMsg,
    });
    throw error;
  }
}

const SYSTEM_PROMPT = `You are an AI assistant designed to solve "The Unread Problem" for busy professionals.
Your task is to analyze raw unread chat logs and extract key intelligence so the user knows exactly what they missed.

You MUST respond ONLY with a raw JSON object conforming strictly to this format. Do NOT wrap with commentary, greetings, or conversational text.

Schema:
{
  "summary": "A clear, concise 2-3 sentence executive overview summarizing what occurred, key challenges, and current state.",
  "key_decisions": [
    "List of concrete decisions officially made or agreed upon in the chat"
  ],
  "action_items": [
    {
      "task": "Specific actionable item",
      "assignee": "Person/handle assigned or tagged (e.g. '@sarah' or 'Unassigned')",
      "deadline": "Time, day, or deadline mentioned (e.g. 'Today 5:00 PM', 'Next Monday', 'Not specified')"
    }
  ],
  "mentions": [
    "@user1",
    "@user2"
  ],
  "urgency": "High" | "Medium" | "Low"
}

Urgency Rules:
- "High": System outages, production incidents, critical bugs, revenue/security blockers, emergencies.
- "Medium": Release candidate freezes, feature cutoffs, sprint milestones, launch coordination.
- "Low": General design feedback, informational discussions, async opinions, backlog chats.`;

export async function analyzeChatLog(
  chatText: string,
  modelId: string,
  onProgress?: (progress: EngineProgress) => void,
  onStreamToken?: (token: string) => void
): Promise<ChatAnalysisResult> {
  const startTime = performance.now();

  if (modelId === 'simulated-demo-engine') {
    return runSimulatedAnalysis(chatText, startTime, onProgress, onStreamToken);
  }

  onProgress?.({
    state: 'analyzing',
    progress: 10,
    text: 'Analyzing chat logs via local on-device WebGPU model...',
  });

  const engine = await initWebLlmEngine(modelId, onProgress);
  if (!engine) {
    throw new Error('Failed to obtain WebLLM engine instance.');
  }

  onProgress?.({
    state: 'analyzing',
    progress: 30,
    text: 'Running WebLLM inference locally (100% on-device)...',
  });

  let fullResponseText = '';

  const completion = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Here is the raw chat log to analyze:\n\n${chatText}\n\nExtract summary, key_decisions, action_items, mentions, and urgency in the specified JSON format:` },
    ],
    temperature: 0.1,
    max_tokens: 1200,
    stream: true,
  });

  for await (const chunk of completion) {
    const delta = chunk.choices[0]?.delta?.content || '';
    if (delta) {
      fullResponseText += delta;
      onStreamToken?.(delta);
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  onProgress?.({
    state: 'completed',
    progress: 100,
    text: `Analysis complete in ${(durationMs / 1000).toFixed(1)}s`,
  });

  const parsed = parseLLMJsonResponse(fullResponseText, chatText);
  return {
    ...parsed,
    rawResponse: fullResponseText,
    processingTimeMs: durationMs,
    modelUsed: modelId,
  };
}

/**
 * Robust JSON parser with fallback cleanup and heuristics
 */
export function parseLLMJsonResponse(rawText: string, originalChat: string): Omit<ChatAnalysisResult, 'rawResponse' | 'processingTimeMs' | 'modelUsed'> {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Find the outermost JSON curly braces
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  try {
    const data = JSON.parse(cleaned);

    // Normalize and sanitize fields
    const summary = typeof data.summary === 'string' && data.summary.trim() ? data.summary.trim() : 'Chat discussion summary extracted.';
    
    const key_decisions = Array.isArray(data.key_decisions)
      ? data.key_decisions.filter((d: any) => typeof d === 'string' && d.trim()).map((d: string) => d.trim())
      : [];

    const action_items: ActionItem[] = Array.isArray(data.action_items)
      ? data.action_items.map((item: any) => ({
          task: typeof item?.task === 'string' ? item.task.trim() : 'Task not specified',
          assignee: typeof item?.assignee === 'string' ? item.assignee.trim() : 'Unassigned',
          deadline: typeof item?.deadline === 'string' ? item.deadline.trim() : 'Not specified',
          completed: false,
        }))
      : [];

    let mentions = Array.isArray(data.mentions)
      ? data.mentions.filter((m: any) => typeof m === 'string' && m.trim()).map((m: string) => m.trim())
      : [];

    // If model missed mentions, extract @handles from chat
    if (mentions.length === 0) {
      const handles = originalChat.match(/@([a-zA-Z0-9_\-]+)/g) || [];
      mentions = Array.from(new Set(handles));
    }

    let urgency: UrgencyLevel = 'Medium';
    if (data.urgency && ['High', 'Medium', 'Low'].includes(data.urgency)) {
      urgency = data.urgency;
    } else {
      // Heuristic detection if model urgency is malformed
      const lower = (originalChat + ' ' + summary).toLowerCase();
      if (lower.includes('outage') || lower.includes('incident') || lower.includes('rollback') || lower.includes('critical') || lower.includes('alert')) {
        urgency = 'High';
      } else if (lower.includes('freeze') || lower.includes('launch') || lower.includes('deadline') || lower.includes('blocker')) {
        urgency = 'Medium';
      } else {
        urgency = 'Low';
      }
    }

    return {
      summary,
      key_decisions,
      action_items,
      mentions,
      urgency,
    };
  } catch (err) {
    console.warn('JSON.parse failed on model output, utilizing heuristic extraction:', err);
    return heuristicExtractionFallback(rawText, originalChat);
  }
}

/**
 * Fallback heuristic extractor if small model output had syntax anomalies
 */
function heuristicExtractionFallback(rawText: string, originalChat: string): Omit<ChatAnalysisResult, 'rawResponse' | 'processingTimeMs' | 'modelUsed'> {
  const handles = Array.from(new Set(originalChat.match(/@([a-zA-Z0-9_\-]+)/g) || []));
  const isHigh = /outage|incident|error|p99|alert|latency|rollback|failover/i.test(originalChat);
  const isLow = /design|figma|proto|tab bar|survey|color/i.test(originalChat);

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const decisions: string[] = [];
  const actionItems: ActionItem[] = [];

  for (const line of lines) {
    if (line.toLowerCase().includes('decision:') || line.toLowerCase().includes('approved')) {
      decisions.push(line.replace(/^[-*•\d.]*\s*/, ''));
    }
    if (line.includes('@') && (line.includes(':') || line.includes('-'))) {
      const match = line.match(/@([a-zA-Z0-9_-]+)/);
      const assignee = match ? `@${match[1]}` : 'Team';
      actionItems.push({
        task: line.replace(/^[-*•\d.]*\s*/, ''),
        assignee,
        deadline: line.toLowerCase().includes('today') ? 'Today' : 'Upcoming',
        completed: false,
      });
    }
  }

  return {
    summary: rawText.substring(0, 320).replace(/[{}"\\[\]]/g, ' ') || 'Chat log analyzed with action items and key takeaways.',
    key_decisions: decisions.length > 0 ? decisions : ['Team reached consensus on next steps discussed in the thread.'],
    action_items: actionItems.length > 0 ? actionItems : [
      { task: 'Review thread updates and follow up with participants', assignee: handles[0] || 'Team', deadline: 'Today', completed: false }
    ],
    mentions: handles,
    urgency: isHigh ? 'High' : isLow ? 'Low' : 'Medium',
  };
}

/**
 * Simulated Instant Engine for hackathon presentation testing / devices without WebGPU
 */
async function runSimulatedAnalysis(
  chatText: string,
  startTime: number,
  onProgress?: (progress: EngineProgress) => void,
  onStreamToken?: (token: string) => void
): Promise<ChatAnalysisResult> {
  onProgress?.({
    state: 'analyzing',
    progress: 25,
    text: 'Analyzing thread structure and mentions...',
  });
  await new Promise((r) => setTimeout(r, 200));

  onProgress?.({
    state: 'analyzing',
    progress: 60,
    text: 'Synthesizing action items and deadlines...',
  });
  await new Promise((r) => setTimeout(r, 250));

  const handles = Array.from(new Set(chatText.match(/@([a-zA-Z0-9_\-]+)/g) || []));
  const lower = chatText.toLowerCase();

  let summary = '';
  let key_decisions: string[] = [];
  let action_items: ActionItem[] = [];
  let urgency: UrgencyLevel = 'Medium';

  if (lower.includes('replica lag') || lower.includes('incident') || lower.includes('rollback') || lower.includes('p99')) {
    urgency = 'High';
    summary = 'A critical database replica lag outage affected payment webhook processing. The incident lead approved terminating a locking billing query and rolling back payments and billing services to v2.4.0, which successfully restored latency and error rates.';
    key_decisions = [
      'Immediately terminated blocking Postgres transaction PID 44102 on orders_v2.',
      'Approved immediate production rollback of payments-service and billing-service to v2.4.0.',
      'Declared incident mitigated with normal latency restored to 120ms.'
    ];
    action_items = [
      { task: 'Add automated lock timeout alerts to PostgreSQL', assignee: '@sarah', deadline: 'Today 5:00 PM', completed: false },
      { task: 'Audit batch billing migration script and present fix', assignee: '@chen', deadline: 'Tomorrow 11:00 AM', completed: false },
      { task: 'Draft incident post-mortem document and share with leadership', assignee: '@alex', deadline: 'Friday 3:00 PM', completed: false },
    ];
  } else if (lower.includes('freeze') || lower.includes('dark mode') || lower.includes('sso') || lower.includes('release candidate')) {
    urgency = 'Medium';
    summary = 'Team coordinated final scope before the 72-hour Q4 release freeze. Due to multi-domain edge cases in Okta SSO, the team decided to postpone Enterprise SSO to v4.2 while proceeding to ship Dark Mode and Workspace Sharing.';
    key_decisions = [
      'Postponed Okta Enterprise SSO to v4.2 to protect release launch timeline.',
      'Approved shipping Dark Mode and Workspace Sharing for the Q4 release.',
    ];
    action_items = [
      { task: 'Disable SSO feature flag in production build branch', assignee: '@david', deadline: 'Today 4:00 PM', completed: false },
      { task: 'Run final regression test suite on Dark Mode and Workspace Sharing', assignee: '@maya', deadline: 'Tomorrow 12:00 PM', completed: false },
      { task: 'Update product changelog and blog post to remove SSO mentions', assignee: '@tom', deadline: 'Thursday 2:00 PM', completed: false },
      { task: 'Schedule customer advisory board demo', assignee: '@priya', deadline: 'Next Tuesday', completed: false },
    ];
  } else if (lower.includes('figma') || lower.includes('navigation') || lower.includes('tab bar')) {
    urgency = 'Low';
    summary = 'Design review concluded on the mobile navigation overhaul. Based on user testing showing higher reachability, the team unanimously approved Option B (Bottom Tab Bar with 4 destinations).';
    key_decisions = [
      'Selected Option B: Bottom Tab Bar with 4 primary destinations over top burger menus.',
      'Validated design direction against recent user testing study results.'
    ];
    action_items = [
      { task: 'Export design tokens, icon SVGs, and updated Figma component spec', assignee: '@elena', deadline: 'Friday 5:00 PM', completed: false },
      { task: 'Build SwiftUI and Jetpack Compose scaffold for bottom tab navigation', assignee: '@jordan', deadline: 'Next Wednesday', completed: false },
      { task: 'Prepare benchmark survey for beta cohort launch', assignee: '@nina', deadline: 'Beta kickoff', completed: false },
    ];
  } else {
    // Dynamic extraction for custom user pasted text
    urgency = /urgent|critical|asap|blocker|outage|emergency|alert/i.test(chatText) ? 'High' : 'Medium';
    summary = `Discussion among ${handles.length > 0 ? handles.slice(0, 3).join(', ') : 'team members'} focused on project status, technical dependencies, and deliverables.`;
    key_decisions = [
      'Aligned on core technical strategy and assigned ownership for active blockers.',
      'Agreed to verify progress in the next team sync.'
    ];
    
    // Extract bullet points or action lines if present
    const extractedTasks: ActionItem[] = [];
    const lines = chatText.split('\n');
    for (const line of lines) {
      if (line.includes('-') && line.includes('@')) {
        const h = line.match(/@([a-zA-Z0-9_\-]+)/);
        extractedTasks.push({
          task: line.replace(/^[^a-zA-Z0-9@]*/, '').replace(/@\w+:?/, '').trim(),
          assignee: h ? `@${h[1]}` : 'Team',
          deadline: line.toLowerCase().includes('tomorrow') ? 'Tomorrow' : line.toLowerCase().includes('today') ? 'Today' : 'This week',
          completed: false,
        });
      }
    }

    action_items = extractedTasks.length > 0 ? extractedTasks : [
      { task: 'Follow up on thread action items and confirm status', assignee: handles[0] || 'Unassigned', deadline: 'End of day', completed: false },
      { task: 'Review shared technical artifacts and provide feedback', assignee: handles[1] || 'Team', deadline: 'Tomorrow', completed: false },
    ];
  }

  const simulatedJson = JSON.stringify({ summary, key_decisions, action_items, mentions: handles, urgency }, null, 2);
  
  // Stream out tokens in simulated chunks
  const chunks = simulatedJson.match(/.{1,35}/g) || [simulatedJson];
  for (const chunk of chunks) {
    onStreamToken?.(chunk);
    await new Promise((r) => setTimeout(r, 20));
  }

  const durationMs = Math.round(performance.now() - startTime);

  onProgress?.({
    state: 'completed',
    progress: 100,
    text: `Analysis complete in ${(durationMs / 1000).toFixed(1)}s (Instant Engine)`,
  });

  return {
    summary,
    key_decisions,
    action_items,
    mentions: handles,
    urgency,
    rawResponse: simulatedJson,
    processingTimeMs: durationMs,
    modelUsed: 'Instant Demo Engine (WebLLM Protocol)',
  };
}
