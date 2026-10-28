import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Repeat, 
  Gauge, 
  Sparkles, 
  Check, 
  Layers,
  Sun,
  Moon,
  Grid
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface LottieSimulatorProps {
  fileName?: string;
  scriptContent?: string;
}

export default function LottieSimulator({
  fileName = 'animation.lottie',
  scriptContent = '',
}: LottieSimulatorProps) {
  const { theme } = useTheme();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoop, setIsLoop] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [bgType, setBgType] = useState<'DARK' | 'LIGHT' | 'GRID'>('DARK');
  const [dotLottieInstance, setDotLottieInstance] = useState<any>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Determine source: If scriptContent is valid JSON with Lottie structure, pass as data; else use public file
  const animationData = useMemo(() => {
    if (!scriptContent) return null;
    try {
      const parsed = JSON.parse(scriptContent);
      if (parsed && (parsed.v || parsed.layers || parsed.assets || parsed.fr)) {
        return parsed;
      }
    } catch {}
    return null;
  }, [scriptContent]);

  // If not JSON data, use URL
  const lottieSrc = useMemo(() => {
    if (animationData) return undefined;
    // If filename has .lottie or .json, check if public file exists or use default indonesian-maps
    return '/indonesian-maps-white.lottie';
  }, [animationData]);

  const dotLottieRefCallback = (dotLottie: any) => {
    setDotLottieInstance(dotLottie);
  };

  const handleTogglePlay = () => {
    if (dotLottieInstance) {
      if (isPlaying) {
        dotLottieInstance.pause();
        setIsPlaying(false);
      } else {
        dotLottieInstance.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  const handleRestart = () => {
    if (dotLottieInstance) {
      dotLottieInstance.stop();
      dotLottieInstance.play();
      setIsPlaying(true);
    }
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (dotLottieInstance) {
      dotLottieInstance.setSpeed(newSpeed);
    }
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-colors ${
      theme === 'dark' ? 'bg-[#030509]' : 'bg-slate-100'
    }`}>
      {/* Top Controls Toolbar */}
      <div className={`h-12 px-3 sm:px-6 border-b flex items-center justify-between gap-2 shrink-0 select-none ${
        theme === 'dark' ? 'bg-[#070b14] border-white/10' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Left: Info */}
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            theme === 'dark' ? 'bg-[#00f3ff]/15 text-[#00f3ff]' : 'bg-sky-100 text-sky-700'
          }`}>
            <Sparkles size={14} />
          </div>
          <div>
            <span className={`text-xs font-bold truncate ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {fileName || 'Lottie Animation'}
            </span>
            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono ${
              theme === 'dark' ? 'bg-white/5 text-white/50 border border-white/10' : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {animationData ? 'JSON Vector' : '.dotlottie'}
            </span>
          </div>
        </div>

        {/* Center/Right: Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Background Switcher */}
          <div className={`flex rounded-lg p-0.5 border ${
            theme === 'dark' ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-100'
          }`}>
            <button
              type="button"
              onClick={() => setBgType('DARK')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                bgType === 'DARK'
                  ? (theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-slate-800 text-white')
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Latar Gelap"
            >
              <Moon size={12} />
            </button>
            <button
              type="button"
              onClick={() => setBgType('LIGHT')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                bgType === 'LIGHT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Latar Terang"
            >
              <Sun size={12} />
            </button>
            <button
              type="button"
              onClick={() => setBgType('GRID')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                bgType === 'GRID'
                  ? (theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-sky-100 text-sky-700')
                  : 'text-slate-400 hover:text-slate-500'
              }`}
              title="Latar Transparan Kotak-kotak"
            >
              <Grid size={12} />
            </button>
          </div>

          {/* Speed Presets */}
          <div className={`hidden sm:flex rounded-lg p-0.5 border ${
            theme === 'dark' ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-100'
          }`}>
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleChangeSpeed(s)}
                className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                  speed === s
                    ? (theme === 'dark' ? 'bg-[#00f3ff] text-black shadow-xs' : 'bg-sky-600 text-white')
                    : (theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Loop toggle */}
          <button
            type="button"
            onClick={() => setIsLoop(prev => !prev)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isLoop
                ? (theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/50' : 'bg-sky-100 text-sky-700 border-sky-300')
                : (theme === 'dark' ? 'bg-white/5 text-white/40 border-white/10' : 'bg-slate-100 text-slate-400 border-slate-200')
            }`}
            title={isLoop ? "Looping Aktif" : "Looping Nonaktif"}
          >
            <Repeat size={13} />
          </button>

          {/* Restart button */}
          <button
            type="button"
            onClick={handleRestart}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10' 
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            title="Ulangi dari Awal"
          >
            <RotateCcw size={13} />
          </button>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              theme === 'dark'
                ? 'bg-[#00f3ff] hover:bg-[#00d8e6] text-[#030509]'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
            <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Player Area */}
      <div className={`flex-1 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden transition-colors ${
        bgType === 'DARK'
          ? 'bg-[#04060c]'
          : bgType === 'LIGHT'
          ? 'bg-slate-50'
          : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-[#080d1a]'
      }`}>
        <div className="relative w-full max-w-2xl aspect-square max-h-[75vh] flex items-center justify-center p-4">
          {renderError ? (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs text-center">
              {renderError}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
              <DotLottieReact
                src={lottieSrc}
                data={animationData}
                loop={isLoop}
                autoplay={isPlaying}
                speed={speed}
                dotLottieRefCallback={dotLottieRefCallback}
                style={{ width: '100%', height: '100%', maxHeight: '520px' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
