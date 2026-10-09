import React from 'react';
import { Database, Download, CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react';
import { AVAILABLE_MODELS } from '../services/webLlmService';
import type { EngineProgress } from '../types';

interface ModelBarProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  engineProgress: EngineProgress;
  isCached: boolean;
  onPreloadModel: () => void;
  disabled?: boolean;
}

export const ModelBar: React.FC<ModelBarProps> = ({
  selectedModelId,
  onSelectModel,
  engineProgress,
  isCached,
  onPreloadModel,
  disabled = false,
}) => {
  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];
  const isLoading =
    engineProgress.state === 'initializing' ||
    engineProgress.state === 'downloading' ||
    engineProgress.state === 'analyzing';

  return (
    <div className="model-bar-card">
      <div className="model-bar-header">
        <div className="model-select-wrap">
          <label htmlFor="model-select" className="model-label">
            <Database size={15} />
            <span>Select Local AI Model:</span>
          </label>
          <div className="select-container">
            <select
              id="model-select"
              value={selectedModelId}
              onChange={(e) => onSelectModel(e.target.value)}
              disabled={disabled || isLoading}
              className="model-select-dropdown"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — {model.tag} ({model.size})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="model-meta-pills">
          {currentModel.isSimulated ? (
            <span className="pill pill-accent">
              <Zap size={13} /> Instant Engine (Zero Wait)
            </span>
          ) : isCached ? (
            <span className="pill pill-success" title="Model weights are already cached in browser storage">
              <CheckCircle2 size={13} /> Cached Locally (Fast)
            </span>
          ) : (
            <span className="pill pill-neutral" title="Weights will be downloaded once and cached in IndexedDB/Cache API">
              <Download size={13} /> First Run (~{currentModel.size})
            </span>
          )}

          {!currentModel.isSimulated && engineProgress.state !== 'ready' && (
            <button
              onClick={onPreloadModel}
              disabled={disabled || isLoading}
              className="btn-preload"
              title="Download and compile shaders to WebGPU memory ahead of time"
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Zap size={13} />
                  <span>Prewarm WebGPU</span>
                </>
              )}
            </button>
          )}

          {engineProgress.state === 'ready' && !currentModel.isSimulated && (
            <span className="pill pill-ready">
              <CheckCircle2 size={13} /> Model Ready in VRAM
            </span>
          )}
        </div>
      </div>

      <div className="model-desc-row">
        <span className="model-description">{currentModel.description}</span>
        <span className="model-vram-tag">Est. VRAM: {currentModel.vram}</span>
      </div>

      {isLoading && (
        <div className="progress-section">
          <div className="progress-header">
            <div className="progress-text">
              <Loader2 size={14} className="spin text-accent" />
              <span>{engineProgress.text}</span>
            </div>
            <span className="progress-pct">{engineProgress.progress}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.max(5, engineProgress.progress)}%` }}
            />
          </div>
        </div>
      )}

      {engineProgress.state === 'error' && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{engineProgress.error || 'Engine error encountered.'}</span>
        </div>
      )}
    </div>
  );
};
