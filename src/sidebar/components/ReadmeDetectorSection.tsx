import React from 'react';

export type ReadmeDetectorMode = 'AUTO' | 'MANUAL';

interface ReadmeDetectorSectionProps {
  theme: 'dark' | 'light';
  isReadmeDetectorEnabled: boolean;
  setIsReadmeDetectorEnabled: (val: boolean) => void;
  readmeDetectorMode?: ReadmeDetectorMode;
  setReadmeDetectorMode?: (val: ReadmeDetectorMode) => void;
}

const ReadmeDetectorSection: React.FC<ReadmeDetectorSectionProps> = ({
  theme,
  isReadmeDetectorEnabled,
  setIsReadmeDetectorEnabled,
  readmeDetectorMode = 'AUTO',
  setReadmeDetectorMode,
}) => {
  const handleToggleReadmeDetector = () => {
    const nextVal = !isReadmeDetectorEnabled;
    setIsReadmeDetectorEnabled(nextVal);
    try {
      localStorage.setItem('cyberIsReadmeDetectorEnabled', String(nextVal));
    } catch {}
  };

  const handleSelectMode = (mode: ReadmeDetectorMode) => {
    if (setReadmeDetectorMode) {
      setReadmeDetectorMode(mode);
    }
    try {
      localStorage.setItem('cyberReadmeDetectorMode', mode);
    } catch {}
  };

  const isAuto = readmeDetectorMode === 'AUTO';

  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      {/* Header Label & Switch Aktifkan (Seragam dengan Version Update & Topik/Deskripsi) */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-medium ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-700'
          }`}
        >
          Readme Detector
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-medium transition-colors ${
              isReadmeDetectorEnabled
                ? theme === 'dark'
                  ? 'text-[#00f3ff] font-semibold'
                  : 'text-sky-600 font-semibold'
                : theme === 'dark'
                ? 'text-white/40'
                : 'text-slate-400'
            }`}
          >
            {isReadmeDetectorEnabled ? 'Aktif' : 'Aktifkan'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isReadmeDetectorEnabled}
            onClick={handleToggleReadmeDetector}
            className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer outline-none focus:ring-1 ${
              isReadmeDetectorEnabled
                ? theme === 'dark'
                  ? 'bg-[#00f3ff] focus:ring-[#00f3ff]/50'
                  : 'bg-sky-500 focus:ring-sky-400/50'
                : theme === 'dark'
                ? 'bg-white/20 hover:bg-white/30 focus:ring-white/20'
                : 'bg-slate-300 hover:bg-slate-400 border border-slate-300/80 focus:ring-slate-300'
            }`}
            title={
              isReadmeDetectorEnabled
                ? 'Nonaktifkan pendeteksi file README.md otomatis'
                : 'Aktifkan pendeteksi file README.md (Root & public/)'
            }
          >
            <span
              className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                isReadmeDetectorEnabled ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tabs Auto Change | Manual Change (Tampil saat Aktif) */}
      {isReadmeDetectorEnabled && (
        <div className="flex flex-col gap-2 pt-0.5 animate-in fade-in duration-150">
          {/* Segmented Tab Switcher Tanpa Icon */}
          <div
            role="tablist"
            aria-label="Mode Readme Detector"
            className={`grid grid-cols-2 gap-1 p-1 rounded-lg border text-[11px] font-medium select-none ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            {/* Tab: Auto Change */}
            <button
              type="button"
              role="tab"
              aria-selected={isAuto}
              onClick={() => handleSelectMode('AUTO')}
              className={`flex items-center justify-center py-1.5 px-2 rounded-md text-[11px] font-semibold tracking-tight leading-tight text-center transition-all cursor-pointer truncate ${
                isAuto
                  ? theme === 'dark'
                    ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 shadow-xs'
                    : 'bg-white text-sky-700 border border-sky-200 shadow-xs'
                  : theme === 'dark'
                  ? 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <span className="truncate">Auto Change</span>
            </button>

            {/* Tab: Manual Change */}
            <button
              type="button"
              role="tab"
              aria-selected={!isAuto}
              onClick={() => handleSelectMode('MANUAL')}
              className={`flex items-center justify-center py-1.5 px-2 rounded-md text-[11px] font-semibold tracking-tight leading-tight text-center transition-all cursor-pointer truncate ${
                !isAuto
                  ? theme === 'dark'
                    ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 shadow-xs'
                    : 'bg-white text-sky-700 border border-sky-200 shadow-xs'
                  : theme === 'dark'
                  ? 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <span className="truncate">Manual Change</span>
            </button>
          </div>

          {/* Description Card Langsung Deskriptif Tanpa Icon */}
          <div
            className={`p-2.5 rounded-lg border text-[10.5px] leading-relaxed transition-all ${
              theme === 'dark'
                ? isAuto
                  ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-200/90'
                  : 'bg-slate-900/40 border-white/10 text-slate-300'
                : isAuto
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {isAuto ? (
              <p>
                Jika terdapat <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-black/30 font-mono text-[9.5px]">public/README.md</code>, otomatis dipindahkan ke root. Jika tidak ada di <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-black/30 font-mono text-[9.5px]">public/</code> atau tidak ada berkas README, proses langsung dilanjutkan tanpa membuka editor dan tanpa membuat berkas baru.
              </p>
            ) : (
              <p>
                Menampilkan menu pilihan interaktif di terminal saat eksekusi: opsi memindahkan berkas ke root, membuka dan memeriksa isi di Notepad/editor teks sistem, atau melanjutkan tanpa perubahan.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ReadmeDetectorSection);
