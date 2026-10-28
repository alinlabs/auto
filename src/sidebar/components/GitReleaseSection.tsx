import React from 'react';
import { FastInput } from '../../components/FastInput';

export type ReleaseMode = 'AUTO' | 'MANUAL';
export type ReleaseBumpType = 'auto' | 'patch' | 'minor' | 'major';

interface GitReleaseSectionProps {
  theme: 'dark' | 'light';
  isReleaseEnabled: boolean;
  setIsReleaseEnabled: (val: boolean) => void;
  releaseMode: ReleaseMode;
  setReleaseMode: (val: ReleaseMode) => void;
  releaseBump?: ReleaseBumpType;
  setReleaseBump?: (val: ReleaseBumpType) => void;
  releaseTag: string;
  setReleaseTag: (val: string) => void;
  releaseNotes: string;
  setReleaseNotes: (val: string) => void;
}

const GitReleaseSection: React.FC<GitReleaseSectionProps> = ({
  theme,
  isReleaseEnabled,
  setIsReleaseEnabled,
  releaseMode,
  setReleaseMode,
  releaseTag,
  setReleaseTag,
  releaseNotes,
  setReleaseNotes,
}) => {
  const handleToggleRelease = () => {
    const nextVal = !isReleaseEnabled;
    setIsReleaseEnabled(nextVal);
    try {
      localStorage.setItem('cyberIsReleaseEnabled', String(nextVal));
    } catch {}
  };

  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      {/* Header Label & Switch Aktifkan */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-medium ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}
          >
            Version Update
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-medium transition-colors ${
              isReleaseEnabled
                ? theme === 'dark'
                  ? 'text-[#00f3ff] font-semibold'
                  : 'text-sky-600 font-semibold'
                : theme === 'dark'
                ? 'text-white/40'
                : 'text-slate-400'
            }`}
          >
            {isReleaseEnabled ? 'Aktif' : 'Aktifkan'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isReleaseEnabled}
            onClick={handleToggleRelease}
            className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer outline-none ${
              isReleaseEnabled
                ? theme === 'dark'
                  ? 'bg-[#00f3ff]'
                  : 'bg-sky-500'
                : theme === 'dark'
                ? 'bg-white/20 hover:bg-white/30'
                : 'bg-slate-300 hover:bg-slate-400 border border-slate-300/80'
            }`}
            title={
              isReleaseEnabled
                ? 'Nonaktifkan pembuatan Git Tag & GitHub Release'
                : 'Aktifkan pembuatan Git Tag & GitHub Release'
            }
          >
            <span
              className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                isReleaseEnabled ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Content when Enabled */}
      {isReleaseEnabled && (
        <div className="flex flex-col gap-2.5 md:gap-3 animate-in fade-in duration-150 pt-0.5">
          {/* 2-Tab Mode Selector: Auto Versi | Manual Versi */}
          <div
            role="tablist"
            aria-label="Mode Versi Tag dan Release"
            className={`grid grid-cols-2 gap-1 p-1 rounded-lg border ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={releaseMode === 'AUTO'}
              onClick={() => {
                setReleaseMode('AUTO');
                try {
                  localStorage.setItem('cyberReleaseMode', 'AUTO');
                } catch {}
              }}
              className={`flex items-center justify-center py-1.5 px-2 rounded-md text-[11px] font-semibold tracking-tight leading-tight text-center transition-all cursor-pointer truncate ${
                releaseMode === 'AUTO'
                  ? theme === 'dark'
                    ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 shadow-xs'
                    : 'bg-white text-sky-700 border border-sky-200 shadow-xs'
                  : theme === 'dark'
                  ? 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <span className="truncate">Auto Versi</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={releaseMode === 'MANUAL'}
              onClick={() => {
                setReleaseMode('MANUAL');
                try {
                  localStorage.setItem('cyberReleaseMode', 'MANUAL');
                } catch {}
              }}
              className={`flex items-center justify-center py-1.5 px-2 rounded-md text-[11px] font-semibold tracking-tight leading-tight text-center transition-all cursor-pointer truncate ${
                releaseMode === 'MANUAL'
                  ? theme === 'dark'
                    ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 shadow-xs'
                    : 'bg-white text-sky-700 border border-sky-200 shadow-xs'
                  : theme === 'dark'
                  ? 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <span className="truncate">Manual Versi</span>
            </button>
          </div>

          {releaseMode === 'AUTO' ? (
            <div
              className={`p-2.5 rounded-lg border text-[10px] leading-relaxed ${
                theme === 'dark'
                  ? 'bg-white/[0.03] border-white/10 text-white/60'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-semibold ${
                    theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
                  }`}
                >
                  Smart SemVer Analyzer (Full Otomatis)
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border ${
                    theme === 'dark'
                      ? 'bg-[#00f3ff]/10 border-[#00f3ff]/30 text-[#00f3ff]'
                      : 'bg-sky-100 border-sky-200 text-sky-700'
                  }`}
                >
                  AUTO
                </span>
              </div>
              Menganalisa skala perubahan file & kode secara otomatis terhadap repositori GitHub untuk menentukan kenaikan{' '}
              <strong className={theme === 'dark' ? 'text-white/85' : 'text-slate-800'}>Patch</strong> (update kecil),{' '}
              <strong className={theme === 'dark' ? 'text-white/85' : 'text-slate-800'}>Minor</strong> (file/fitur baru), atau{' '}
              <strong className={theme === 'dark' ? 'text-white/85' : 'text-slate-800'}>Major</strong> (perombakan besar) tanpa perlu diatur manual.
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-3.5">
              <label className="flex flex-col gap-1.5 md:gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-medium ${
                      theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                    }`}
                  >
                    Tag Versi Manual
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      theme === 'dark' ? 'text-white/40' : 'text-slate-400'
                    }`}
                  >
                    Contoh: v1.2.0
                  </span>
                </div>
                <div
                  className={`w-full flex items-center rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 font-mono text-[11px] md:text-sm lg:text-xs border transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white focus-within:border-[#00f3ff]/50'
                      : 'bg-white border-slate-200 text-slate-900 focus-within:border-sky-500'
                  }`}
                >
                  <span
                    className={`select-none font-bold mr-0.5 ${
                      theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600'
                    }`}
                  >
                    v
                  </span>
                  <FastInput
                    type="text"
                    inputMode="decimal"
                    value={releaseTag.replace(/^[vV]+/, '')}
                    transform={(val) => val.replace(/[^0-9.]/g, '')}
                    onChange={setReleaseTag}
                    className="w-full bg-transparent outline-none font-mono text-[11px] md:text-sm lg:text-xs"
                  />
                </div>
              </label>

              {/* Catatan Release */}
              <label className="flex flex-col gap-1.5 md:gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-medium ${
                      theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                    }`}
                  >
                    Catatan
                  </span>
                  <span
                    className={`text-[10px] italic font-normal ${
                      theme === 'dark' ? 'text-white/40' : 'text-slate-400'
                    }`}
                  >
                    *Opsional
                  </span>
                </div>
                <FastInput
                  type="text"
                  value={releaseNotes}
                  onChange={setReleaseNotes}
                  className={`w-full rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white focus:border-[#00f3ff]/50'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(GitReleaseSection);
