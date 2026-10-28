import React, { useState, useMemo } from 'react';
import TerminalSimulator, { TerminalSimulatorProps } from './terminal';
import HtmlSimulator from './html';
import LottieSimulator from './lottie';
import { Terminal, Globe, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface SimulatorProps extends TerminalSimulatorProps {
  fileName?: string;
  scriptExtension?: string;
  scriptContent?: string;
}

export type SimulatorType = 'TERMINAL' | 'HTML' | 'LOTTIE';

export default function Simulator(props: SimulatorProps) {
  const { theme } = useTheme();
  const { fileName = '', scriptExtension = '', scriptContent = '' } = props;

  // Auto-detect optimal renderer based on file extension and content
  const detectedType = useMemo<SimulatorType>(() => {
    const ext = (scriptExtension || '').replace(/^\./, '').toLowerCase();
    const name = (fileName || '').toLowerCase();

    if (ext === 'html' || ext === 'htm' || name.endsWith('.html') || name.endsWith('.htm')) {
      return 'HTML';
    }

    if (
      ext === 'lottie' || 
      name.endsWith('.lottie') || 
      name.includes('lottie') ||
      (ext === 'json' && scriptContent.includes('"layers"') && scriptContent.includes('"v"'))
    ) {
      return 'LOTTIE';
    }

    // Default to Terminal Simulator for scripts (ps1, cmd, sh, bat, py, etc.)
    return 'TERMINAL';
  }, [fileName, scriptExtension, scriptContent]);

  const [activeSimulator, setActiveSimulator] = useState<SimulatorType>(detectedType);

  // Sync when detected type changes if user hasn't explicitly overridden
  React.useEffect(() => {
    setActiveSimulator(detectedType);
  }, [detectedType]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      {/* Top Mini Simulator Switcher Bar */}
      <div className={`h-9 px-3 sm:px-6 border-b flex items-center justify-between text-xs shrink-0 select-none ${
        theme === 'dark' ? 'bg-[#040711] border-white/5' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] uppercase font-bold tracking-wider mr-1.5 ${
            theme === 'dark' ? 'text-white/40' : 'text-slate-400'
          }`}>
            Runner:
          </span>

          {/* Terminal Option */}
          <button
            type="button"
            onClick={() => setActiveSimulator('TERMINAL')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSimulator === 'TERMINAL'
                ? (theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50' : 'bg-sky-100 text-sky-800 border border-sky-300 font-bold')
                : (theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <Terminal size={12} />
            <span>Terminal</span>
          </button>

          {/* HTML Option */}
          <button
            type="button"
            onClick={() => setActiveSimulator('HTML')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSimulator === 'HTML'
                ? (theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50' : 'bg-sky-100 text-sky-800 border border-sky-300 font-bold')
                : (theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <Globe size={12} />
            <span>HTML Sandbox</span>
          </button>

          {/* Lottie Option */}
          <button
            type="button"
            onClick={() => setActiveSimulator('LOTTIE')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSimulator === 'LOTTIE'
                ? (theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/50' : 'bg-sky-100 text-sky-800 border border-sky-300 font-bold')
                : (theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <Sparkles size={12} />
            <span>Lottie Player</span>
          </button>
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className={theme === 'dark' ? 'text-white/50' : 'text-slate-500'}>
            Simulation Active
          </span>
        </div>
      </div>

      {/* Render selected simulator */}
      <div className="flex-1 overflow-hidden relative">
        {activeSimulator === 'TERMINAL' && (
          <TerminalSimulator {...props} />
        )}
        {activeSimulator === 'HTML' && (
          <HtmlSimulator 
            fileName={props.fileName}
            scriptContent={props.scriptContent}
            zoom={props.zoom}
          />
        )}
        {activeSimulator === 'LOTTIE' && (
          <LottieSimulator 
            fileName={props.fileName}
            scriptContent={props.scriptContent}
          />
        )}
      </div>
    </div>
  );
}

export { TerminalSimulator, HtmlSimulator, LottieSimulator };
