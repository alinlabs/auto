import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FastInput } from '../../components/FastInput';

interface GitCredentialsFieldsProps {
  theme: 'dark' | 'light';
  autoToken: string;
  setAutoToken: (val: string) => void;
  autoUsername: string;
  setAutoUsername: (val: string) => void;
  autoRepo: string;
  setAutoRepo: (val: string) => void;
  autoBranch: string;
  setAutoBranch: (val: string) => void;
  customCommit: string;
  setCustomCommit: (val: string) => void;
  isCustomBranch: boolean;
  setIsCustomBranch: (val: boolean) => void;
  isCommitTimeEnabled: boolean;
  setIsCommitTimeEnabled: (val: boolean) => void;
}

const GitCredentialsFields: React.FC<GitCredentialsFieldsProps> = ({
  theme,
  autoToken,
  setAutoToken,
  autoUsername,
  setAutoUsername,
  autoRepo,
  setAutoRepo,
  autoBranch,
  setAutoBranch,
  customCommit,
  setCustomCommit,
  isCustomBranch,
  setIsCustomBranch,
  isCommitTimeEnabled,
  setIsCommitTimeEnabled,
}) => {
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (!isCustomBranch && autoBranch !== 'main') {
      setAutoBranch('main');
    } else if (isCustomBranch && autoBranch === 'main') {
      setAutoBranch('');
    }
  }, [isCustomBranch]);

  const renderCommitTimeToggle = () => (
    <div className="flex items-center gap-1.5 shrink-0">
      <span
        className={`text-[10px] font-medium transition-colors ${
          isCommitTimeEnabled
            ? theme === 'dark'
              ? 'text-[#00f3ff] font-semibold'
              : 'text-sky-600 font-semibold'
            : theme === 'dark'
            ? 'text-white/40'
            : 'text-slate-400'
        }`}
      >
        Waktu
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isCommitTimeEnabled}
        onClick={() => {
          const nextVal = !isCommitTimeEnabled;
          setIsCommitTimeEnabled(nextVal);
          try {
            localStorage.setItem('cyberIsCommitTimeEnabled', String(nextVal));
          } catch {}
        }}
        className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer outline-none ${
          isCommitTimeEnabled
            ? theme === 'dark'
              ? 'bg-[#00f3ff]'
              : 'bg-sky-500'
            : theme === 'dark'
            ? 'bg-white/20 hover:bg-white/30'
            : 'bg-slate-300 hover:bg-slate-400 border border-slate-300/80'
        }`}
        title={
          isCommitTimeEnabled
            ? 'Waktu Commit Aktif: Menambahkan tanggal & jam otomatis pada pesan commit (Klik untuk mematikan)'
            : 'Waktu Commit Nonaktif: Pesan commit murni hanya sesuai yang ditulis (Klik untuk mengaktifkan waktu)'
        }
      >
        <span
          className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${
            isCommitTimeEnabled ? 'translate-x-3' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <>
      {/* Token GitHub */}
      <div className="flex flex-col gap-1.5 md:gap-2">
        <div className="flex justify-between items-center">
          <span className={`text-[11px] font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
            Token
          </span>
          <a 
            href="https://github.com/settings/tokens" 
            target="_blank" 
            rel="noopener noreferrer"
            title="Buka halaman pembuatan Personal Access Token di GitHub"
            className={`text-[10px] font-medium transition-colors ${
              theme === 'dark' ? 'text-[#00f3ff]/70 hover:text-[#00f3ff]' : 'text-sky-600 hover:text-sky-800'
            }`}
          >
            Dapatkan Token
          </a>
        </div>
        <div className="relative flex items-center">
          <FastInput 
            type={showToken ? "text" : "password"} 
            value={autoToken}
            onChange={setAutoToken}
            className={`w-full rounded-lg pl-2.5 pr-8 py-1.5 md:pl-3 md:pr-9 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-[#00f3ff]/50' 
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className={`absolute right-2 md:right-2.5 p-1 rounded transition-colors ${
              theme === 'dark'
                ? 'text-white/40 hover:text-white/80'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title={showToken ? "Sembunyikan Token" : "Tampilkan Token"}
          >
            {showToken ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>
      </div>

      {/* Username & Repositori */}
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <label className="flex flex-col gap-1.5 md:gap-2">
          <span className={`text-[11px] font-medium truncate ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
            Username
          </span>
          <FastInput 
            type="text" 
            value={autoUsername}
            onChange={setAutoUsername}
            className={`rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-[#00f3ff]/50' 
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
            }`}
          />
        </label>

        <div className="flex flex-col gap-1.5 md:gap-2">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[11px] font-medium truncate ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
              Repositori
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[10px] font-medium transition-colors ${
                isCustomBranch 
                  ? (theme === 'dark' ? 'text-[#00f3ff] font-semibold' : 'text-sky-600 font-semibold')
                  : (theme === 'dark' ? 'text-white/40' : 'text-slate-400')
              }`}>
                Branch
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isCustomBranch}
                onClick={() => {
                  const nextVal = !isCustomBranch;
                  setIsCustomBranch(nextVal);
                  localStorage.setItem('cyberIsCustomBranch', String(nextVal));
                  if (!nextVal) {
                    setAutoBranch('main');
                  } else {
                    setAutoBranch('');
                  }
                }}
                className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer outline-none ${
                  isCustomBranch
                    ? (theme === 'dark' ? 'bg-[#00f3ff]' : 'bg-sky-500')
                    : (theme === 'dark' ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-300 hover:bg-slate-400 border border-slate-300/80')
                }`}
                title={isCustomBranch ? "Matikan kustomisasi branch (Default: main)" : "Aktifkan kustomisasi nama branch"}
              >
                <span 
                  className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                    isCustomBranch ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <FastInput 
            type="text" 
            value={autoRepo}
            onChange={setAutoRepo}
            className={`rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-[#00f3ff]/50' 
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
            }`}
          />
        </div>
      </div>

      {/* Branch & Commit Row */}
      {isCustomBranch ? (
        <div className="grid grid-cols-2 gap-2 md:gap-3 animate-in fade-in duration-150">
          <label className="flex flex-col gap-1.5 md:gap-2">
            <span className={`text-[11px] font-medium truncate ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
              Branch
            </span>
            <FastInput 
              type="text" 
              value={autoBranch}
              onChange={setAutoBranch}
              className={`rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-[#00f3ff]/50' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
              }`}
            />
          </label>

          <div className="flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center justify-between gap-1">
              <span className={`text-[11px] font-medium truncate ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
                Commit
              </span>
              {renderCommitTimeToggle()}
            </div>
            <FastInput 
              type="text" 
              value={customCommit}
              onChange={setCustomCommit}
              className={`rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-[#00f3ff]/50' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
              }`}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 md:gap-2 w-full animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[11px] font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
              Commit
            </span>
            {renderCommitTimeToggle()}
          </div>
          <FastInput 
            type="text" 
            value={customCommit}
            onChange={setCustomCommit}
            className={`w-full rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-[#00f3ff]/50' 
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
            }`}
          />
        </div>
      )}
    </>
  );
};

export default React.memo(GitCredentialsFields);
