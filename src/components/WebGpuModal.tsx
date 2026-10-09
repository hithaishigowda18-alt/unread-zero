import React from 'react';
import { X, ShieldCheck, Cpu, HardDrive, CheckCircle2, AlertTriangle } from 'lucide-react';

interface WebGpuModalProps {
  isOpen: boolean;
  onClose: () => void;
  webGpuSupported: boolean | null;
  adapterName?: string;
}

export const WebGpuModal: React.FC<WebGpuModalProps> = ({
  isOpen,
  onClose,
  webGpuSupported,
  adapterName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Cpu size={20} className="text-accent" />
            <h2>Architecture: 100% On-Device WebLLM</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="feature-grid">
            <div className="feature-card">
              <ShieldCheck size={24} className="text-emerald" />
              <h4>Zero Data Leaves Device</h4>
              <p>
                Unlike traditional ChatGPT/Claude APIs, your chat conversations, proprietary source code, and customer records never leave your local device.
              </p>
            </div>
            <div className="feature-card">
              <Cpu size={24} className="text-accent" />
              <h4>WebGPU Acceleration</h4>
              <p>
                Powered by Apache TVM and <code>@mlc-ai/web-llm</code>. Matrix multiplications run directly on your GPU shader cores.
              </p>
            </div>
            <div className="feature-card">
              <HardDrive size={24} className="text-blue" />
              <h4>Browser Cache API</h4>
              <p>
                Model weights (e.g. Qwen 2.5) are saved to your browser's persistent IndexedDB/Cache API. Once downloaded, reloading takes seconds.
              </p>
            </div>
          </div>

          <div className="status-box">
            <h4>System WebGPU Status</h4>
            {webGpuSupported === true ? (
              <div className="status-row success">
                <CheckCircle2 size={18} />
                <span>
                  <strong>WebGPU is fully supported!</strong> Adapter: {adapterName || 'Hardware GPU Acceleration active'}.
                </span>
              </div>
            ) : (
              <div className="status-row warning">
                <AlertTriangle size={18} />
                <div>
                  <strong>WebGPU is currently not detected.</strong>
                  <p className="mt-1 text-sm">
                    Don't worry! You can use the <strong>Instant Demo Engine</strong> mode to test the app instantly without any setup.
                    To enable WebGPU in Chrome/Edge, visit <code>chrome://flags/#enable-unsafe-webgpu</code> and turn on Hardware Acceleration in browser settings.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer-info">
            <span>Built for the Hackathon Challenge: <strong>"The Unread Problem - What Did I Miss?"</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
