import { SAMPLE_CHATS } from '../sampleChats';
import type { SampleChat } from '../sampleChats';
import { Sparkles, Trash2, FileText, Loader2, ArrowRight } from 'lucide-react';

interface ChatInputProps {
  chatText: string;
  onChangeChatText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  selectedSampleId: string | null;
  onSelectSample: (sample: SampleChat) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  chatText,
  onChangeChatText,
  onAnalyze,
  isAnalyzing,
  selectedSampleId,
  onSelectSample,
}) => {
  const lineCount = chatText ? chatText.split('\n').length : 0;
  const wordCount = chatText ? chatText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="chat-input-container">
      <div className="sample-chats-header">
        <div className="section-title-wrap">
          <FileText size={16} className="text-accent" />
          <span className="section-title">Load Sample Chat Log:</span>
        </div>
        <span className="sample-hint">Click any sample to test immediately:</span>
      </div>

      <div className="sample-chips-grid">
        {SAMPLE_CHATS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => onSelectSample(sample)}
            className={`sample-chip ${selectedSampleId === sample.id ? 'active' : ''}`}
            disabled={isAnalyzing}
          >
            <span className="sample-emoji">{sample.icon}</span>
            <div className="sample-chip-text">
              <span className="sample-title">{sample.title}</span>
              <span className="sample-badge">{sample.badge}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="textarea-wrapper">
        <div className="textarea-topbar">
          <span className="textarea-label">Raw Chat Log / Unread Thread:</span>
          <div className="textarea-actions">
            {chatText && (
              <>
                <span className="stat-pill">{lineCount} lines</span>
                <span className="stat-pill">{wordCount} words</span>
                <button
                  type="button"
                  onClick={() => onChangeChatText('')}
                  className="btn-clear"
                  disabled={isAnalyzing}
                  title="Clear input"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          value={chatText}
          onChange={(e) => onChangeChatText(e.target.value)}
          placeholder={`Paste your unread chat log here... (e.g. Slack thread, Discord channel, WhatsApp export, Teams meeting notes)\n\nExample:\n[10:14] @sarah: The deployment failed on step 3 due to missing AWS credentials.\n[10:15] @chen: Approved, let's roll back to v1.2.9.\n[10:16] @alex: I will update the production credentials by 2:00 PM.`}
          rows={10}
          className="chat-textarea"
          disabled={isAnalyzing}
        />

        <div className="textarea-footer">
          <span className="textarea-privacy-note">
            🛡️ Encrypted by design: Text never leaves your browser tab.
          </span>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !chatText.trim()}
            className="btn-analyze"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Extracting Intel...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>What Did I Miss?</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
