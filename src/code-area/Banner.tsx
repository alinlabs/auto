import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BannerProps } from './types';

export default function Banner({
  isInfoBannerOpen,
  setIsInfoBannerOpen,
  scriptExtension,
  fileName,
  setIsInfoModalOpen
}: BannerProps) {
  const { theme } = useTheme();

  if (!isInfoBannerOpen) return null;

  return (
    <div className={`p-3.5 sm:p-4 border-t flex items-start justify-between gap-3 text-xs leading-relaxed shrink-0 animate-in slide-in-from-bottom-2 duration-200 transition-all z-20 ${
      theme === 'dark' 
        ? 'bg-[#040812] border-[#00f3ff]/25 text-gray-300 shadow-[0_-8px_25px_rgba(0,0,0,0.5)]' 
        : 'bg-sky-50 border-sky-200 text-slate-700 shadow-xs'
    }`}>
      <div className="flex items-start gap-2.5">
        <ShieldCheck size={18} className="text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Panduan Eksekusi Skrip Git Push
          </h4>
          {scriptExtension ? (
            <p>
              1. Buka <strong>{scriptExtension === 'ps1' ? 'PowerShell (Win + X)' : scriptExtension === 'cmd' ? 'Command Prompt / CMD (Win + R lalu ketik cmd)' : 'Terminal / Bash'}</strong>.<br/>
              2. Jalankan perintah: <code className={`px-1 py-0.5 rounded font-mono text-[11px] ${
                theme === 'dark' ? 'bg-black/50 text-cyan-300' : 'bg-slate-200/80 text-slate-800'
              }`}>
                {scriptExtension === 'ps1' 
                  ? `powershell -ExecutionPolicy Bypass -File .\\${fileName?.trim() ? fileName.trim() : 'AUTO-PUSH'}.ps1`
                  : scriptExtension === 'cmd'
                  ? `.\\${fileName?.trim() ? fileName.trim() : 'AUTO-PUSH'}.cmd`
                  : `bash ./${fileName?.trim() ? fileName.trim() : 'AUTO-PUSH'}.sh`}
              </code><br/>
              3. Sistem memvalidasi token secara independen ke GitHub API: jika token kadaluarsa akan diarahkan ke <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className={`underline font-semibold ${theme === 'dark' ? 'text-cyan-300' : 'text-sky-700'}`}>https://github.com/settings/tokens</a>; jika repositori belum ada, Anda dapat langsung menekan ENTER untuk membuatnya otomatis atau memilih repositori lain.
            </p>
          ) : (
            <p>
              Silakan pilih sistem operasi (PowerShell, CMD, atau Bash) pada panel konfigurasi terlebih dahulu.
            </p>
          )}
          <div className="pt-1">
            <button 
              onClick={() => setIsInfoModalOpen(true)}
              className={`text-[11px] hover:underline font-semibold cursor-pointer ${
                theme === 'dark' ? 'text-cyan-400' : 'text-sky-700'
              }`}
            >
              Lihat panduan lengkap untuk macOS, Linux & Android Termux →
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => setIsInfoBannerOpen(false)}
        className={`text-sm font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
          theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
        }`}
        title="Tutup Panduan"
      >
        ✕
      </button>
    </div>
  );
}
