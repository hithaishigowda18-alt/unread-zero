import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ModelBar } from './components/ModelBar';
import { ChatInput } from './components/ChatInput';
import { ParsedResults } from './components/ParsedResults';
import { WebGpuModal } from './components/WebGpuModal';
import { SAMPLE_CHATS } from './sampleChats';
import type { SampleChat } from './sampleChats';
import {
  checkWebGPUSupport,
  checkIsModelCached,
  initWebLlmEngine,
  analyzeChatLog,
  AVAILABLE_MODELS,
} from './services/webLlmService';
import type { ChatAnalysisResult, EngineProgress } from './types';
import './App.css';

export function App() {
  const [webGpuSupported, setWebGpuSupported] = useState<boolean | null>(null);
  const [adapterName, setAdapterName] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>(AVAILABLE_MODELS[0].id);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [engineProgress, setEngineProgress] = useState<EngineProgress>({
    state: 'idle',
    progress: 0,
    text: 'Engine ready to initialize',
  });

  const [chatText, setChatText] = useState<string>(SAMPLE_CHATS[0].content);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(SAMPLE_CHATS[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ChatAnalysisResult | null>(null);
  const [streamText, setStreamText] = useState<string>('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Check WebGPU availability and initial cache status on mount
  useEffect(() => {
    let isMounted = true;

    async function initCheck() {
      const gpuStatus = await checkWebGPUSupport();
      if (!isMounted) return;

      setWebGpuSupported(gpuStatus.supported);
      if (gpuStatus.adapterName) {
        setAdapterName(gpuStatus.adapterName);
      }

      // If WebGPU is not supported, default to the instant demo engine
      if (!gpuStatus.supported) {
        setSelectedModelId('simulated-demo-engine');
      }

      const cached = await checkIsModelCached(
        gpuStatus.supported ? AVAILABLE_MODELS[0].id : 'simulated-demo-engine'
      );
      if (isMounted) setIsCached(cached);
    }

    initCheck();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check cache when model selection changes
  useEffect(() => {
    let isMounted = true;
    checkIsModelCached(selectedModelId).then((cached) => {
      if (isMounted) setIsCached(cached);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedModelId]);

  const handleSelectSample = (sample: SampleChat) => {
    setSelectedSampleId(sample.id);
    setChatText(sample.content);
  };

  const handleTextChange = (text: string) => {
    setChatText(text);
    if (selectedSampleId && text !== SAMPLE_CHATS.find((s) => s.id === selectedSampleId)?.content) {
      setSelectedSampleId(null);
    }
  };

  const handlePreloadModel = async () => {
    try {
      await initWebLlmEngine(selectedModelId, (p) => {
        setEngineProgress(p);
      });
      setIsCached(true);
    } catch (err: any) {
      console.error('Error preloading model:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!chatText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setStreamText('');
    setAnalysisResult(null);

    try {
      const result = await analyzeChatLog(
        chatText,
        selectedModelId,
        (progress) => {
          setEngineProgress(progress);
        },
        (token) => {
          setStreamText((prev) => prev + token);
        }
      );

      setAnalysisResult(result);

      // Smooth scroll down to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      // If WebGPU failed, suggest Instant Engine fallback
      if (selectedModelId !== 'simulated-demo-engine') {
        const tryDemo = window.confirm(
          `Local WebLLM encountered an issue: ${err?.message || 'WebGPU execution error'}.\n\nWould you like to switch to the Instant Demo Engine to preview results immediately?`
        );
        if (tryDemo) {
          setSelectedModelId('simulated-demo-engine');
          try {
            const fallbackResult = await analyzeChatLog(chatText, 'simulated-demo-engine', setEngineProgress);
            setAnalysisResult(fallbackResult);
          } catch (demoErr) {
            console.error('Demo error:', demoErr);
          }
        }
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <div className="app-content-wrapper">
        <Header
          webGpuSupported={webGpuSupported}
          adapterName={adapterName}
          onOpenHelp={() => setIsHelpModalOpen(true)}
        />

        <main className="main-section">
          {/* Model Config & Status Bar */}
          <ModelBar
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
            engineProgress={engineProgress}
            isCached={isCached}
            onPreloadModel={handlePreloadModel}
            disabled={isAnalyzing}
          />

          {/* Chat Input & Samples */}
          <ChatInput
            chatText={chatText}
            onChangeChatText={handleTextChange}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            selectedSampleId={selectedSampleId}
            onSelectSample={handleSelectSample}
          />

          {/* Streaming Live Preview during Inference */}
          {isAnalyzing && streamText && (
            <div className="stream-preview-card">
              <div className="stream-preview-header">
                <span className="pulsing-dot" />
                <span>Streaming tokens directly from local WebGPU model...</span>
              </div>
              <pre className="stream-preview-text">{streamText}</pre>
            </div>
          )}

          {/* Parsed Output Dashboard */}
          <div ref={resultsRef}>
            {analysisResult && (
              <ParsedResults
                result={analysisResult}
                streamText={streamText}
              />
            )}
          </div>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <span>
              Built for <strong>Hackathon Challenge: "The Unread Problem"</strong>
            </span>
            <span className="dot-sep">•</span>
            <span>
              Engine: <code>@mlc-ai/web-llm</code>
            </span>
            <span className="dot-sep">•</span>
            <span>100% Client-Side Private AI</span>
          </div>
        </footer>
      </div>

      <WebGpuModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        webGpuSupported={webGpuSupported}
        adapterName={adapterName}
      />
    </div>
  );
}

export default App;
