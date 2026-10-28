import React from 'react';
import { 
  FileCode, 
  ArrowLeft, 
  MousePointerClick
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ScriptFileItem } from '../sidebar/types';

interface EmptyFileSelectionViewProps {
  fileList?: ScriptFileItem[];
  onSelectFile?: (file: ScriptFileItem) => void;
  onCreateNewFile?: () => void;
  mobileView?: 'KONFIGURASI' | 'WORKSPACE';
  setMobileView?: (val: 'KONFIGURASI' | 'WORKSPACE') => void;
}

export default function EmptyFileSelectionView({
  mobileView,
  setMobileView,
}: EmptyFileSelectionViewProps) {
  const { theme } = useTheme();

  return (
    <div className={`h-full w-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto custom-scrollbar select-none transition-colors ${
      theme === 'dark' ? 'bg-[#030509]' : 'bg-[#f8fafc]'
    }`}>
      {/* Background Cyber Glow Accent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden flex items-center justify-center"
        aria-hidden="true"
      >
        <div className={`w-[450px] h-[450px] rounded-full blur-[100px] ${
          theme === 'dark' ? 'bg-[#00f3ff]/10' : 'bg-sky-400/10'
        }`} />
      </div>

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center">
        {/* Prominent Glowing Cyber Icon */}
        <div className="relative flex items-center justify-center mb-5">
          <div className={`absolute w-28 h-28 rounded-3xl blur-xl transition-all ${
            theme === 'dark' ? 'bg-[#00f3ff]/20 animate-pulse' : 'bg-sky-400/20'
          }`} />
          <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border flex items-center justify-center transition-all ${
            theme === 'dark'
              ? 'bg-[#060b16] border-[#00f3ff]/40 text-[#00f3ff] shadow-[0_0_30px_rgba(0,243,255,0.25)]'
              : 'bg-white border-sky-300 text-sky-600 shadow-lg shadow-sky-100'
          }`}>
            <FileCode size={46} className="stroke-[1.6]" />
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-[#030509] border-[#00f3ff]/60 text-[#00f3ff]'
                : 'bg-sky-50 border-sky-400 text-sky-600 shadow-sm'
            }`}>
              <MousePointerClick size={16} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-lg sm:text-xl font-bold tracking-tight mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          Pilih Berkas untuk Menampilkan Kode
        </h3>

        {/* Subtitle / Direct Instructions */}
        <p className={`text-xs sm:text-sm leading-relaxed max-w-md ${
          mobileView === 'WORKSPACE' ? 'mb-5' : 'mb-0'
        } ${
          theme === 'dark' ? 'text-white/60' : 'text-slate-600'
        }`}>
          Area kode saat ini kosong. Silakan pilih salah satu berkas dari daftar di bilah sisi kiri untuk membuka, melihat, dan menyunting kodenya.
        </p>

        {/* Mobile Navigation Back to Sidebar */}
        {mobileView === 'WORKSPACE' && setMobileView && (
          <div className="flex items-center justify-center lg:hidden mt-4">
            <button
              type="button"
              onClick={() => setMobileView('KONFIGURASI')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                theme === 'dark'
                  ? 'border-white/10 bg-white/5 text-[#00f3ff] hover:bg-white/10 hover:border-[#00f3ff]/40'
                  : 'border-slate-200 bg-white text-sky-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <ArrowLeft size={15} />
              <span>Buka Daftar Berkas di Sidebar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
