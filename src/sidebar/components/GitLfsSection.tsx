import React, { useState, useRef, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import { FastInput } from '../../components/FastInput';

const SUGGESTED_LFS_EXTENSIONS = ['.mp4', '.mp3', '.zip', '.psd', '.exe', '.dll', '.tar.gz', '.iso', '.rar', '.7z'];

interface GitLfsSectionProps {
  theme: 'dark' | 'light';
  lfsExtensions: string;
  setLfsExtensions: (val: string) => void;
  lfsSizeLimit: string;
  setLfsSizeLimit: (val: string) => void;
  isLfsEnabled: boolean;
  setIsLfsEnabled: (val: boolean) => void;
  lfsInputToken: string;
  setLfsInputToken: (val: string) => void;
  onOpenVercelModal: () => void;
}

const GitLfsSection: React.FC<GitLfsSectionProps> = ({
  theme,
  lfsExtensions,
  setLfsExtensions,
  lfsSizeLimit,
  setLfsSizeLimit,
  isLfsEnabled,
  setIsLfsEnabled,
  lfsInputToken,
  setLfsInputToken,
  onOpenVercelModal,
}) => {
  const [copiedVercelEnv, setCopiedVercelEnv] = useState(false);

  const lastLfsRef = useRef({
    exts: lfsExtensions || '',
    size: lfsSizeLimit || ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('cyberIsLfsEnabled');
    if (saved === 'false' && (lfsExtensions || lfsSizeLimit)) {
      lastLfsRef.current = {
        exts: lfsExtensions,
        size: lfsSizeLimit
      };
      setLfsExtensions('');
      setLfsSizeLimit('');
    }
  }, []);

  const handleToggleLfs = () => {
    const nextVal = !isLfsEnabled;
    setIsLfsEnabled(nextVal);
    localStorage.setItem('cyberIsLfsEnabled', String(nextVal));
    if (!nextVal) {
      if (lfsExtensions || lfsSizeLimit) {
        lastLfsRef.current = {
          exts: lfsExtensions,
          size: lfsSizeLimit
        };
      }
      setLfsExtensions('');
      setLfsInputToken('');
      setLfsSizeLimit('');
    } else {
      if (lastLfsRef.current.exts) {
        setLfsExtensions(lastLfsRef.current.exts);
        setLfsSizeLimit(lastLfsRef.current.size);
      }
    }
  };

  const activeExts = lfsExtensions
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

  const inactiveExtensions = SUGGESTED_LFS_EXTENSIONS.filter(e => !activeExts.includes(e));

  const addLfsExtension = (ext: string) => {
    let clean = ext.trim();
    if (!clean.startsWith('.')) {
      clean = '.' + clean;
    }
    if (!activeExts.includes(clean)) {
      const updated = [...activeExts, clean].join(', ');
      setLfsExtensions(updated);
    }
  };

  const removeLfsExtension = (ext: string) => {
    const updated = activeExts.filter(e => e !== ext).join(', ');
    setLfsExtensions(updated);
  };

  const handleLfsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const tokens = val.split(',');
      const newExts = [...activeExts];
      tokens.forEach(token => {
        let cleanToken = token.trim().replace(/\s+/g, '');
        if (cleanToken) {
          if (!cleanToken.startsWith('.')) {
            cleanToken = '.' + cleanToken;
          }
          if (!newExts.includes(cleanToken)) {
            newExts.push(cleanToken);
          }
        }
      });
      setLfsExtensions(newExts.join(', '));
      setLfsInputToken('');
    } else {
      setLfsInputToken(val);
    }
  };

  const handleLfsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (lfsInputToken.trim()) {
        addLfsExtension(lfsInputToken);
        setLfsInputToken('');
      }
    } else if (e.key === 'Backspace' && !lfsInputToken && activeExts.length > 0) {
      removeLfsExtension(activeExts[activeExts.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
          Github Storage
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-medium transition-colors ${
            isLfsEnabled 
              ? (theme === 'dark' ? 'text-[#00f3ff] font-semibold' : 'text-sky-600 font-semibold')
              : (theme === 'dark' ? 'text-white/40' : 'text-slate-400')
          }`}>
            {isLfsEnabled ? 'Aktif' : 'Aktifkan'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isLfsEnabled}
            onClick={handleToggleLfs}
            className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer outline-none ${
              isLfsEnabled
                ? (theme === 'dark' ? 'bg-[#00f3ff]' : 'bg-sky-500')
                : (theme === 'dark' ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-300 hover:bg-slate-400 border border-slate-300/80')
            }`}
            title={isLfsEnabled ? "Nonaktifkan Git LFS" : "Aktifkan Git LFS"}
          >
            <span 
              className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                isLfsEnabled ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {isLfsEnabled && (
        <div className="flex flex-col gap-3 md:gap-3.5 animate-in fade-in duration-150">
          <label className="flex flex-col gap-1.5 md:gap-2">
            <div className={`flex flex-wrap items-center gap-1.5 rounded-lg p-1.5 transition-colors border shadow-inner ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 focus-within:border-[#00f3ff]/50 focus-within:bg-[#00f3ff]/5' 
                : 'bg-white border-slate-200 focus-within:border-sky-500 focus-within:bg-sky-50/20'
            }`}>
              {activeExts.map(ext => (
                <span
                  key={ext}
                  onClick={() => removeLfsExtension(ext)}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all border active:scale-95 select-none ${
                    theme === 'dark'
                      ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50'
                      : 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-red-100 hover:text-red-600 hover:border-red-300'
                  }`}
                  title={`Klik untuk menghapus ${ext}`}
                >
                  {ext}
                </span>
              ))}
              <input 
                type="text" 
                value={lfsInputToken}
                onChange={handleLfsInputChange}
                onKeyDown={handleLfsKeyDown}
                onBlur={() => {
                  if (lfsInputToken.trim()) {
                    addLfsExtension(lfsInputToken);
                    setLfsInputToken('');
                  }
                }}
                className={`flex-1 min-w-[60px] font-mono outline-none text-[11px] md:text-sm lg:text-xs px-1 py-1 bg-transparent ${
                  theme === 'dark' ? 'text-[#00f3ff] placeholder-white/30' : 'text-sky-700 placeholder-slate-400'
                }`}
              />
            </div>
            {inactiveExtensions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {inactiveExtensions.map(ext => (
                  <button
                    key={ext}
                    type="button"
                    onClick={() => addLfsExtension(ext)}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors active:scale-95 cursor-pointer select-none ${
                      theme === 'dark'
                        ? 'bg-white/5 text-white/50 border-white/10 hover:border-[#00f3ff]/40 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50'
                    }`}
                    title={`Klik untuk menambahkan ${ext}`}
                  >
                    {ext}
                  </button>
                ))}
              </div>
            )}
          </label>

          <label className="flex flex-col gap-1.5 md:gap-2 transition-opacity duration-300">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium whitespace-nowrap ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
                Batas Ukuran
              </span>
              <span className={`text-[10px] italic font-normal ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                *Opsional
              </span>
            </div>
            <div className={`flex items-stretch rounded-lg overflow-hidden border transition-colors ${
              theme === 'dark' ? 'border-white/10 focus-within:border-[#00f3ff]/50' : 'border-slate-200 focus-within:border-sky-500'
            }`}>
              <FastInput 
                type="text"
                inputMode="numeric"
                value={lfsSizeLimit}
                transform={(val) => val.replace(/[^0-9]/g, '')}
                onChange={setLfsSizeLimit}
                className={`px-2.5 py-1.5 md:px-3 md:py-2 font-mono outline-none flex-grow min-w-0 text-[11px] md:text-sm lg:text-xs w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  theme === 'dark' ? 'bg-white/5 text-[#00f3ff] placeholder-white/40' : 'bg-white text-sky-700 placeholder-slate-400'
                }`}
              />
              <span className={`px-2.5 py-1.5 md:px-3 md:py-2 text-[11px] md:text-sm lg:text-xs flex items-center border-l font-bold ${
                theme === 'dark' ? 'bg-white/10 text-white/70 border-white/5' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>MB</span>
            </div>
          </label>

          {/* Vercel LFS Helper Box */}
          {lfsExtensions.trim() !== '' && (
            <div className={`p-3 rounded-xl border transition-all ${
              theme === 'dark' 
                ? 'bg-[#101216] border-white/10 text-zinc-300' 
                : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className={`font-bold text-[11px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <span>Deploy ke Vercel?</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenVercelModal}
                  className={`text-[10px] font-medium underline transition-opacity cursor-pointer ${
                    theme === 'dark' ? 'text-cyan-400 hover:text-cyan-300' : 'text-sky-600 hover:text-sky-700'
                  }`}
                >
                  Solusi Build Error
                </button>
              </div>
              <p className={`text-[10px] leading-relaxed mt-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>
                Vercel default-nya tidak menarik file LFS (hanya clone pointer 130 byte) sehingga error saat build. Cukup tambahkan environment variable:
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <code className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex-1 truncate border ${
                  theme === 'dark'
                    ? 'bg-black/60 text-zinc-200 border-white/10'
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}>
                  VERCEL_GIT_LFS_ENABLED = 1
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('VERCEL_GIT_LFS_ENABLED=1');
                    setCopiedVercelEnv(true);
                    setTimeout(() => setCopiedVercelEnv(false), 2000);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 shrink-0 transition-colors cursor-pointer border ${
                    theme === 'dark'
                      ? 'bg-white/10 hover:bg-white/15 text-zinc-200 border-white/10'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Salin env VERCEL_GIT_LFS_ENABLED=1"
                >
                  {copiedVercelEnv ? <Check size={12} className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} /> : <Copy size={12} />}
                  <span>{copiedVercelEnv ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(GitLfsSection);
