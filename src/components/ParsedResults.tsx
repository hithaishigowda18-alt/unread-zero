import { useState } from 'react';
import {
  Flame,
  Clock,
  CheckCircle,
  FileText,
  CheckSquare,
  Users,
  Copy,
  Check,
  Code2,
  Calendar,
  UserCheck,
  Download,
  Share2
} from 'lucide-react';
import type { ChatAnalysisResult, ActionItem, UrgencyLevel } from '../types';

interface ParsedResultsProps {
  result: ChatAnalysisResult;
  onToggleActionItem?: (index: number) => void;
  streamText?: string;
}

export const ParsedResults: React.FC<ParsedResultsProps> = ({
  result,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [actionItemsState, setActionItemsState] = useState<ActionItem[]>(
    result.action_items || []
  );

  const toggleTask = (index: number) => {
    setActionItemsState((prev) =>
      prev.map((item, i) => (i === index ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(result.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(
      {
        summary: result.summary,
        key_decisions: result.key_decisions,
        action_items: actionItemsState,
        mentions: result.mentions,
        urgency: result.urgency,
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyMarkdown = () => {
    const md = `# Chat Catch-Up Brief: What Did I Miss?
**Urgency:** ${result.urgency}
**Inference Time:** ${(result.processingTimeMs ? result.processingTimeMs / 1000 : 0).toFixed(1)}s
**Model:** ${result.modelUsed || 'WebLLM Local'}

## Summary
${result.summary}

## Key Decisions
${result.key_decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## Action Items
${actionItemsState.map((a) => `- [${a.completed ? 'x' : ' '}] **${a.task}** (Assignee: ${a.assignee} | Deadline: ${a.deadline})`).join('\n')}

## Mentions & Participants
${result.mentions.join(', ')}
`;
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(
        {
          summary: result.summary,
          key_decisions: result.key_decisions,
          action_items: actionItemsState,
          mentions: result.mentions,
          urgency: result.urgency,
          model: result.modelUsed,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `what-did-i-miss-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getUrgencyConfig = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'High':
        return {
          icon: <Flame size={20} className="text-red-beacon" />,
          label: 'CRITICAL URGENCY',
          badgeClass: 'urgency-high',
          desc: 'High priority incident or blocking issue. Requires your immediate review.',
        };
      case 'Medium':
        return {
          icon: <Clock size={20} className="text-amber-beacon" />,
          label: 'MEDIUM URGENCY',
          badgeClass: 'urgency-medium',
          desc: 'Important project coordination with active deadlines or release dependencies.',
        };
      case 'Low':
      default:
        return {
          icon: <CheckCircle size={20} className="text-emerald-beacon" />,
          label: 'ROUTINE / LOW URGENCY',
          badgeClass: 'urgency-low',
          desc: 'Informational catchup or async discussion. No emergency action needed.',
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(result.urgency);
  const completedCount = actionItemsState.filter((a) => a.completed).length;

  return (
    <div className="parsed-results-container">
      {/* Top Banner: Urgency & Quick Actions */}
      <div className={`urgency-banner ${urgencyConfig.badgeClass}`}>
        <div className="urgency-left">
          <div className="urgency-icon-pulse">{urgencyConfig.icon}</div>
          <div>
            <div className="urgency-headline">
              <span className="urgency-pill">{urgencyConfig.label}</span>
              {result.processingTimeMs && (
                <span className="timing-pill">
                  ⏱️ {(result.processingTimeMs / 1000).toFixed(1)}s local inference
                </span>
              )}
            </div>
            <p className="urgency-desc">{urgencyConfig.desc}</p>
          </div>
        </div>

        <div className="urgency-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleCopyMarkdown}
            title="Copy formatted Markdown brief"
          >
            {copiedMarkdown ? <Check size={14} className="text-emerald" /> : <Share2 size={14} />}
            <span>{copiedMarkdown ? 'Copied Brief' : 'Export Brief'}</span>
          </button>
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleDownloadJson}
            title="Download JSON file"
          >
            <Download size={14} />
            <span>JSON</span>
          </button>
          <button
            type="button"
            className={`action-pill-btn ${showRawJson ? 'active' : ''}`}
            onClick={() => setShowRawJson(!showRawJson)}
            title="Inspect raw JSON schema"
          >
            <Code2 size={14} />
            <span>Raw JSON</span>
          </button>
        </div>
      </div>

      {/* Raw JSON Inspector Drawer */}
      {showRawJson && (
        <div className="raw-json-panel">
          <div className="raw-json-header">
            <span>LLM Structured JSON Schema Output:</span>
            <button className="btn-copy-mini" onClick={handleCopyJson}>
              {copiedJson ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="json-code-block">
            {JSON.stringify(
              {
                summary: result.summary,
                key_decisions: result.key_decisions,
                action_items: actionItemsState,
                mentions: result.mentions,
                urgency: result.urgency,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* 4 Core Sections Grid */}
      <div className="results-grid">
        {/* Section 1: Executive Summary */}
        <div className="result-card col-span-2">
          <div className="card-header">
            <div className="card-title-wrap">
              <FileText size={18} className="text-accent" />
              <h3>1. Executive Summary</h3>
            </div>
            <button
              type="button"
              className="btn-copy-mini"
              onClick={handleCopySummary}
              title="Copy summary to clipboard"
            >
              {copiedSummary ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
              <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="summary-body">
            <p className="summary-text">{result.summary}</p>
          </div>
        </div>

        {/* Section 2: Key Decisions */}
        <div className="result-card">
          <div className="card-header">
            <div className="card-title-wrap">
              <CheckSquare size={18} className="text-emerald" />
              <h3>2. Key Decisions ({result.key_decisions.length})</h3>
            </div>
          </div>
          <div className="decisions-body">
            {result.key_decisions.length === 0 ? (
              <p className="empty-state">No definitive decisions recorded in this thread.</p>
            ) : (
              <ul className="decisions-list">
                {result.key_decisions.map((decision, idx) => (
                  <li key={idx} className="decision-item">
                    <span className="decision-num">{idx + 1}</span>
                    <span className="decision-text">{decision}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Section 3: Action Items Checklist */}
        <div className="result-card">
          <div className="card-header">
            <div className="card-title-wrap">
              <UserCheck size={18} className="text-purple-highlight" />
              <h3>3. Action Items ({actionItemsState.length})</h3>
            </div>
            {actionItemsState.length > 0 && (
              <span className="badge-counter">
                {completedCount}/{actionItemsState.length} done
              </span>
            )}
          </div>
          <div className="action-items-body">
            {actionItemsState.length === 0 ? (
              <p className="empty-state">No specific assigned action items identified.</p>
            ) : (
              <div className="action-items-list">
                {actionItemsState.map((item, idx) => (
                  <div
                    key={idx}
                    className={`action-item-row ${item.completed ? 'completed' : ''}`}
                    onClick={() => toggleTask(idx)}
                  >
                    <input
                      type="checkbox"
                      checked={!!item.completed}
                      onChange={() => toggleTask(idx)}
                      className="task-checkbox"
                      aria-label="Mark task done"
                    />
                    <div className="task-content">
                      <span className="task-desc">{item.task}</span>
                      <div className="task-meta-row">
                        <span className="assignee-tag">
                          <span className="avatar-circle">
                            {item.assignee.replace('@', '').charAt(0).toUpperCase() || '?'}
                          </span>
                          <span>{item.assignee}</span>
                        </span>
                        <span className="deadline-tag">
                          <Calendar size={11} />
                          <span>{item.deadline}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: People Mentions & Key Participants */}
        <div className="result-card col-span-2">
          <div className="card-header">
            <div className="card-title-wrap">
              <Users size={18} className="text-cyan-highlight" />
              <h3>4. Mentions & Participants ({result.mentions.length})</h3>
            </div>
            <span className="mentions-hint">Tagged handles & key contributors in the thread</span>
          </div>
          <div className="mentions-body">
            {result.mentions.length === 0 ? (
              <p className="empty-state">No specific @handles or participants detected.</p>
            ) : (
              <div className="mentions-chips-wrap">
                {result.mentions.map((handle, idx) => (
                  <div key={idx} className="mention-chip">
                    <span className="mention-avatar">
                      {handle.replace('@', '').charAt(0).toUpperCase()}
                    </span>
                    <span className="mention-name">{handle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
