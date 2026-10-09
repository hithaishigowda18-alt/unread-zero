import React from 'react';
import { ShieldCheck, Cpu, AlertTriangle, Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  webGpuSupported: boolean | null;
  adapterName?: string;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  webGpuSupported,
  adapterName,
  onOpenHelp,
}) => {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-group">
          <div className="brand-icon-wrapper">
            <Sparkles className="brand-sparkle" size={24} />
          </div>
          <div>
            <div className="hackathon-tag">
              <span>HACKATHON CHALLENGE</span>
              <span className="dot-sep">•</span>
              <span>THE UNREAD PROBLEM</span>
            </div>
            <h1 className="app-title">What Did I Miss?</h1>
          </div>
        </div>

        <div className="header-badges">
          <div className="privacy-badge" title="No chat messages are sent over the network">
            <ShieldCheck size={16} className="text-emerald" />
            <span>100% On-Device / Local AI</span>
          </div>

          <div
            className={`hardware-badge ${
              webGpuSupported === true
                ? 'gpu-active'
                : webGpuSupported === false
                ? 'gpu-warning'
                : 'gpu-checking'
            }`}
            onClick={onOpenHelp}
            role="button"
            tabIndex={0}
            title={adapterName || 'Click to view WebGPU diagnostics'}
          >
            {webGpuSupported === true ? (
              <>
                <Cpu size={16} />
                <span className="truncate-pill">WebGPU: {adapterName || 'Active'}</span>
              </>
            ) : webGpuSupported === false ? (
              <>
                <AlertTriangle size={16} />
                <span>WebGPU Not Detected</span>
              </>
            ) : (
              <>
                <Cpu size={16} className="spin-slow" />
                <span>Checking WebGPU...</span>
              </>
            )}
          </div>

          <button
            className="icon-btn-ghost"
            onClick={onOpenHelp}
            title="How this local WebLLM works"
            aria-label="Help and Info"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      <p className="app-subtitle">
        Caught in 500+ unread Slack or Discord messages? Catch up instantly with on-device WebLLM inference.
        Extract executive summaries, key decisions, action items, and urgency—without your sensitive company data ever leaving your browser.
      </p>
    </header>
  );
};
