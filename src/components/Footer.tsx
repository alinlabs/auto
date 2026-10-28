import React, { memo, useDeferredValue, useMemo } from 'react';
import { Terminal, ChevronUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCodeAnimationStore } from '../context/useCodeAnimationStore';

interface FooterProps {
  activeTab?: 'CODE' | 'SIMULATOR';
  setActiveTab?: (tab: 'CODE' | 'SIMULATOR') => void;
  isInfoBannerOpen?: boolean;
  setIsInfoBannerOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  scriptContent: string;
}

function FooterComponent({ 
  activeTab, 
  setActiveTab,
  isInfoBannerOpen,
  setIsInfoBannerOpen,
  scriptContent 
}: FooterProps) {
  const { theme } = useTheme();
  const deferredContent = useDeferredValue(scriptContent);

  const isWriting = useCodeAnimationStore((state) => state.isWriting);
  const currentLines = useCodeAnimationStore((state) => state.currentLines);
  const currentBytes = useCodeAnimationStore((state) => state.currentBytes);

  const { lineCount, sizeKb } = useMemo(() => {
    const count = deferredContent ? deferredContent.split('\n').length : 0;
    const kb = (new Blob([deferredContent || '']).size / 1024).toFixed(2);
    return { lineCount: count, sizeKb: kb };
  }, [deferredContent]);

  const displayLineCount = isWriting ? currentLines : lineCount;
  const displaySizeKb = isWriting ? (currentBytes / 1024).toFixed(2) : sizeKb;

  return (
    <footer className={`h-14 border-t px-3 sm:px-6 flex items-center justify-between text-[11px] shrink-0 relative z-20 transition-colors duration-250 ${
      theme === 'dark' 
        ? 'border-white/10 bg-[#030509] text-white/50' 
        : 'border-slate-200 bg-white text-slate-500'
    }`}>
      {/* Kiri: Tombol Icon Aksi (Panduan Eksekusi Chevron di kiri & Run Simulasi di kanan) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Tombol Panduan Eksekusi (Chevron: default arah atas untuk menampilkan ke atas) */}
        {setIsInfoBannerOpen && (
          <button
            type="button"
            onClick={() => setIsInfoBannerOpen(prev => !prev)}
            title={isInfoBannerOpen ? "Tutup Panduan Eksekusi" : "Buka Panduan Eksekusi Skrip"}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isInfoBannerOpen
                ? (theme === 'dark' 
                    ? 'border-[#00f3ff] bg-transparent text-[#00f3ff]' 
                    : 'border-sky-500 bg-transparent text-sky-600')
                : (theme === 'dark' 
                    ? 'border-white/10 bg-white/5 text-white/70 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 hover:border-[#00f3ff]/30' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-300 shadow-sm')
            }`}
            aria-label={isInfoBannerOpen ? "Tutup Panduan Eksekusi" : "Buka Panduan Eksekusi Skrip"}
          >
            <ChevronUp 
              size={17} 
              className={`transition-transform duration-200 ${isInfoBannerOpen ? 'rotate-180' : 'rotate-0'}`} 
            />
          </button>
        )}

        {/* Tombol Run Simulasi */}
        {setActiveTab && (
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'SIMULATOR' ? 'CODE' : 'SIMULATOR')}
            title={activeTab === 'SIMULATOR' ? "Kembali ke Kode Sumber" : "Terminal Simulator (Run Simulasi)"}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'SIMULATOR'
                ? (theme === 'dark' 
                    ? 'border-[#00f3ff] bg-transparent text-[#00f3ff]' 
                    : 'border-sky-500 bg-transparent text-sky-600')
                : (theme === 'dark' 
                    ? 'border-white/10 bg-white/5 text-white/70 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 hover:border-[#00f3ff]/30' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-300 shadow-sm')
            }`}
            aria-label="Terminal Simulator"
          >
            <Terminal size={15} />
          </button>
        )}
      </div>

      {/* Kanan: Metadata Baris & Ukuran */}
      <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] sm:text-xs">
        <div className="flex items-center">
          <span className="opacity-70">Baris:&nbsp;</span>
          <span className={
            isWriting
              ? (theme === 'dark' ? 'text-[#00f3ff] font-bold drop-shadow-[0_0_8px_rgba(0,243,255,0.4)]' : 'text-sky-600 font-bold')
              : (theme === 'dark' ? 'text-white/90 font-bold' : 'text-slate-800 font-bold')
          }>
            {displayLineCount}
          </span>
        </div>

        <span className={`text-[10px] ${theme === 'dark' ? 'text-white/20' : 'text-slate-300'}`}>•</span>

        <div className="flex items-center">
          <span className="opacity-70">Ukuran:&nbsp;</span>
          <span className={
            isWriting
              ? (theme === 'dark' ? 'text-[#00f3ff] font-bold drop-shadow-[0_0_8px_rgba(0,243,255,0.4)]' : 'text-sky-600 font-bold')
              : (theme === 'dark' ? 'text-white/90 font-bold' : 'text-slate-800 font-bold')
          }>
            {displaySizeKb} KB
          </span>
        </div>
      </div>
    </footer>
  );
}

const Footer = memo(FooterComponent);
export default Footer;
