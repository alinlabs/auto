import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCw, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  Code2, 
  Globe,
  Sparkles,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface HtmlSimulatorProps {
  fileName?: string;
  scriptContent?: string;
  zoom?: number;
}

const DEFAULT_SAMPLE_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AUTO Preview Hub</title>
  <style>
    :root {
      --bg: #030509;
      --card: #0a0f1d;
      --accent: #00f3ff;
      --text: #e2e8f0;
      --text-dim: #94a3b8;
      --border: rgba(0, 243, 255, 0.2);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background-image: radial-gradient(rgba(0, 243, 255, 0.08) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0, 243, 255, 0.1);
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background: rgba(0, 243, 255, 0.15);
      color: var(--accent);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
      border: 1px solid rgba(0, 243, 255, 0.3);
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      color: #ffffff;
    }
    p {
      color: var(--text-dim);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .interactive-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .counter-val {
      font-size: 2.25rem;
      font-weight: 800;
      font-family: monospace;
      color: var(--accent);
      margin: 0.5rem 0;
    }
    .btn {
      background: var(--accent);
      color: #030509;
      font-weight: 700;
      border: none;
      padding: 0.65rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .btn:hover {
      background: #38f8ff;
      box-shadow: 0 0 15px rgba(0, 243, 255, 0.4);
      transform: translateY(-1px);
    }
    .footer-text {
      font-size: 0.75rem;
      color: var(--text-dim);
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">● Live HTML Simulator</div>
    <h1>AUTO Runtime Sandbox</h1>
    <p>File HTML ini sedang dijalankan dalam lingkungan simulasi browser terisolasi secara real-time.</p>
    
    <div class="interactive-box">
      <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Interaksi Dinamis</div>
      <div class="counter-val" id="counter">0</div>
      <button class="btn" onclick="increment()">Klik Tambah Nilai</button>
    </div>

    <div class="footer-text">
      Status: 200 OK • Sandbox Enforced
    </div>
  </div>

  <script>
    let count = 0;
    function increment() {
      count++;
      document.getElementById('counter').innerText = count;
    }
  </script>
</body>
</html>`;

export default function HtmlSimulator({
  fileName = 'index.html',
  scriptContent = '',
}: HtmlSimulatorProps) {
  const { theme } = useTheme();
  const [deviceMode, setDeviceMode] = useState<'DESKTOP' | 'TABLET' | 'MOBILE'>('DESKTOP');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Content preparation
  const isActualHtml = scriptContent && (
    scriptContent.includes('<html') || 
    scriptContent.includes('<!DOCTYPE') || 
    scriptContent.includes('<div') || 
    scriptContent.includes('<head') ||
    scriptContent.includes('<body') ||
    fileName.toLowerCase().endsWith('.html') ||
    fileName.toLowerCase().endsWith('.htm')
  );

  const finalHtml = isActualHtml ? scriptContent : DEFAULT_SAMPLE_HTML;

  const handleReload = () => {
    setRefreshKey(prev => prev + 1);
  };

  const openInNewTab = () => {
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-colors ${
      theme === 'dark' ? 'bg-[#030509]' : 'bg-slate-100'
    }`}>
      {/* Top Browser Simulator Bar */}
      <div className={`h-11 px-3 sm:px-4 border-b flex items-center justify-between gap-2 shrink-0 select-none ${
        theme === 'dark' ? 'bg-[#070b14] border-white/10' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Left: Window Dots & Reload */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 mr-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <button
            type="button"
            onClick={handleReload}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              theme === 'dark' ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Muat Ulang Preview (Reload)"
          >
            <RotateCw size={13} />
          </button>
        </div>

        {/* Center: Fake Address Bar */}
        <div className={`flex-1 max-w-md h-7 rounded-lg border px-2.5 flex items-center gap-2 text-xs font-mono transition-colors overflow-hidden ${
          theme === 'dark' ? 'bg-black/40 border-white/10 text-white/70' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <Globe size={12} className={theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600'} />
          <span className="truncate text-[11px]">
            http://localhost:3000/{fileName || 'index.html'}
          </span>
          <span className="ml-auto text-[10px] text-emerald-400 font-sans font-semibold shrink-0">
            ● 200 OK
          </span>
        </div>

        {/* Right: Device Viewport Switcher & External Link */}
        <div className="flex items-center gap-1 shrink-0">
          <div className={`flex rounded-lg p-0.5 border ${
            theme === 'dark' ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-100'
          }`}>
            <button
              type="button"
              onClick={() => setDeviceMode('DESKTOP')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                deviceMode === 'DESKTOP'
                  ? (theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-white text-sky-700 shadow-xs')
                  : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700')
              }`}
              title="Tampilan Desktop (100%)"
            >
              <Monitor size={13} />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('TABLET')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                deviceMode === 'TABLET'
                  ? (theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-white text-sky-700 shadow-xs')
                  : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700')
              }`}
              title="Tampilan Tablet (768px)"
            >
              <Tablet size={13} />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('MOBILE')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                deviceMode === 'MOBILE'
                  ? (theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-white text-sky-700 shadow-xs')
                  : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700')
              }`}
              title="Tampilan Mobile (375px)"
            >
              <Smartphone size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={openInNewTab}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              theme === 'dark' ? 'border-white/10 text-white/60 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            title="Buka di Tab Baru"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Main Viewport Area */}
      <div className={`flex-1 p-2 sm:p-4 overflow-auto flex items-center justify-center transition-colors ${
        theme === 'dark' ? 'bg-[#030509]' : 'bg-slate-200/50'
      }`}>
        <div 
          className={`h-full transition-all duration-300 rounded-xl overflow-hidden border shadow-2xl flex flex-col ${
            deviceMode === 'DESKTOP' 
              ? 'w-full' 
              : deviceMode === 'TABLET' 
              ? 'w-[768px] max-w-full' 
              : 'w-[375px] max-w-full'
          } ${
            theme === 'dark' ? 'border-white/15 bg-[#0a0f18]' : 'border-slate-300 bg-white'
          }`}
        >
          <iframe
            key={refreshKey}
            ref={iframeRef}
            srcDoc={finalHtml}
            title="HTML Live Simulation Preview"
            sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
            className="w-full h-full border-none bg-white"
          />
        </div>
      </div>
    </div>
  );
}
