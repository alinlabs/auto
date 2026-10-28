import React from 'react';
import { FastInput, FastTextarea } from '../../components/FastInput';

interface GitRepoMetaSectionProps {
  theme: 'dark' | 'light';
  isRepoMetaEnabled: boolean;
  setIsRepoMetaEnabled: (val: boolean) => void;
  repoTopics: string;
  setRepoTopics: (val: string) => void;
  repoDescription: string;
  setRepoDescription: (val: string) => void;
}

const GitRepoMetaSection: React.FC<GitRepoMetaSectionProps> = ({
  theme,
  isRepoMetaEnabled,
  setIsRepoMetaEnabled,
  repoTopics,
  setRepoTopics,
  repoDescription,
  setRepoDescription,
}) => {
  const handleToggleRepoMeta = () => {
    const nextVal = !isRepoMetaEnabled;
    setIsRepoMetaEnabled(nextVal);
    try {
      localStorage.setItem('cyberIsRepoMetaEnabled', String(nextVal));
    } catch {}
  };

  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      {/* Header Label & Switch Aktifkan */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-medium ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-700'
          }`}
        >
          Topik & Deskripsi
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-medium transition-colors ${
              isRepoMetaEnabled
                ? theme === 'dark'
                  ? 'text-[#00f3ff] font-semibold'
                  : 'text-sky-600 font-semibold'
                : theme === 'dark'
                ? 'text-white/40'
                : 'text-slate-400'
            }`}
          >
            {isRepoMetaEnabled ? 'Aktif' : 'Aktifkan'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isRepoMetaEnabled}
            onClick={handleToggleRepoMeta}
            className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer outline-none ${
              isRepoMetaEnabled
                ? theme === 'dark'
                  ? 'bg-[#00f3ff]'
                  : 'bg-sky-500'
                : theme === 'dark'
                ? 'bg-white/20 hover:bg-white/30'
                : 'bg-slate-300 hover:bg-slate-400 border border-slate-300/80'
            }`}
            title={
              isRepoMetaEnabled
                ? 'Nonaktifkan pembaruan Topic & Deskripsi Repository'
                : 'Aktifkan pembaruan Topic & Deskripsi Repository'
            }
          >
            <span
              className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                isRepoMetaEnabled ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable 2 Input Fields: Topik & Deskripsi */}
      {isRepoMetaEnabled && (
        <div className="flex flex-col gap-3 md:gap-3.5 animate-in fade-in duration-150 pt-0.5">
          {/* Kolom Input 1: Topik */}
          <label className="flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-medium ${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}
              >
                Topik
              </span>
              <span
                className={`text-[10px] font-mono ${
                  theme === 'dark' ? 'text-white/40' : 'text-slate-400'
                }`}
              >
                Pisahkan dengan koma
              </span>
            </div>
            <FastInput
              type="text"
              value={repoTopics}
              onChange={setRepoTopics}
              className={`w-full rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white focus:border-[#00f3ff]/50'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-sky-500'
              }`}
            />
          </label>

          {/* Kolom Input 2: Deskripsi (1 baris di awal, otomatis menyesuaikan tinggi saat melebihi 1 baris, maks 350 karakter) */}
          <label className="flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-medium ${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}
              >
                Deskripsi
              </span>
              <span
                className={`text-[10px] font-mono ${
                  repoDescription.length >= 350
                    ? 'text-amber-400 font-semibold'
                    : theme === 'dark'
                    ? 'text-white/40'
                    : 'text-slate-400'
                }`}
              >
                {repoDescription.length}/350
              </span>
            </div>
            <FastTextarea
              rows={1}
              maxLength={350}
              value={repoDescription}
              transform={(text) => text.replace(/\r?\n/g, ' ').slice(0, 350)}
              onChange={setRepoDescription}
              className={`w-full rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors resize-none overflow-hidden leading-normal ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white focus:border-[#00f3ff]/50'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-sky-500'
              }`}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default React.memo(GitRepoMetaSection);
