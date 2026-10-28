import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Info, Terminal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import { ScriptExtension } from './OsCombobox';

interface CodeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptExtension: ScriptExtension;
}

export default function CodeInfoModal({ isOpen, onClose, scriptExtension }: CodeInfoModalProps) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderCmdInfo = () => (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 border transition-colors ${
        theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
      }`}>
        <h3 className={`text-[13px] font-bold mb-3 flex items-center gap-2 uppercase tracking-widest ${
          theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
        }`}>
          <Terminal size={14} />
          Windows Command Prompt (.cmd)
        </h3>
        <p className={`text-xs leading-relaxed mb-4 text-justify ${
          theme === 'dark' ? 'text-white/70' : 'text-slate-600'
        }`}>
          Skrip batch .cmd ini dapat dijalankan langsung di Command Prompt (cmd.exe) atau cukup klik ganda tanpa terhalang ExecutionPolicy:
        </p>
        <ol className={`list-decimal list-inside space-y-2 text-xs ${
          theme === 'dark' ? 'text-white/80' : 'text-slate-700'
        }`}>
          <li>Pastikan Anda telah menginstal <strong>Git untuk Windows</strong>.</li>
          <li>Buka <strong>Command Prompt</strong> (Tekan <kbd className={`px-1 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>Win + R</kbd>, ketik <kbd className={`px-1 rounded font-bold ${theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700'}`}>cmd</kbd>, lalu ENTER).</li>
          <li>Arahkan ke folder tempat berkas skrip disimpan dengan perintah <kbd className={`px-1 rounded font-bold ${theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700'}`}>cd</kbd>.</li>
          <li>Jalankan skrip dengan mengetik: <kbd className={`px-1 rounded font-bold ${theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700'}`}>namafile.cmd</kbd> atau klik ganda langsung pada berkas.</li>
        </ol>
      </div>

      <div className={`rounded-xl p-4 border ${
        theme === 'dark' ? 'bg-[#00f3ff]/5 border-[#00f3ff]/20' : 'bg-sky-50 border-sky-200'
      }`}>
        <h4 className={`text-xs font-bold mb-2 ${
          theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-800'
        }`}>Keunggulan Versi .cmd (Command Prompt)</h4>
        <ul className={`list-disc list-inside space-y-1.5 text-xs leading-relaxed ${
          theme === 'dark' ? 'text-white/80' : 'text-slate-700'
        }`}>
          <li>Bebas dari kendala <em>ExecutionPolicy Restricted</em> bawaan Windows.</li>
          <li>Dapat langsung dipanggil dari terminal cmd, powershell, git bash, maupun shortcut bat.</li>
          <li>Mendukung pembersihan otomatis dan verifikasi token mandiri.</li>
        </ul>
      </div>
    </div>
  );

  const renderWindowsInfo = () => (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 border transition-colors ${
        theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
      }`}>
        <h3 className={`text-[13px] font-bold mb-3 flex items-center gap-2 uppercase tracking-widest ${
          theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
        }`}>
          <Terminal size={14} />
          Windows PowerShell (.ps1)
        </h3>
        <p className={`text-xs leading-relaxed mb-4 text-justify ${
          theme === 'dark' ? 'text-white/70' : 'text-slate-600'
        }`}>
          Skrip PowerShell ini membantu Anda mengeksekusi operasi otomatisasi pada lingkungan Windows. Ikuti langkah berikut untuk menjalankannya:
        </p>
        <ol className={`list-decimal list-inside space-y-2 text-xs ${
          theme === 'dark' ? 'text-white/80' : 'text-slate-700'
        }`}>
          <li>Pastikan Anda telah menginstal <strong>Git untuk Windows</strong>.</li>
          <li>Buka <strong>PowerShell</strong> (Tekan <kbd className={`px-1 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>Win + X</kbd>, lalu pilih Windows PowerShell).</li>
          <li>Gunakan perintah <kbd className={`px-1 rounded font-bold ${theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700'}`}>cd</kbd> untuk berpindah ke direktori tempat file skrip disimpan.</li>
          <li>Jalankan skrip dengan mengetik: <kbd className={`px-1 rounded font-bold ${theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700'}`}>.\namafile.ps1</kbd></li>
        </ol>
      </div>

      <div className={`rounded-xl p-4 border ${
        theme === 'dark' ? 'bg-[#00f3ff]/5 border-[#00f3ff]/20' : 'bg-sky-50 border-sky-200'
      }`}>
        <h4 className={`text-xs font-bold mb-2 ${
          theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-800'
        }`}>Pembedaan Presisi: Token Habis vs Repositori Tidak Ada</h4>
        <ul className={`list-disc list-inside space-y-1.5 text-xs leading-relaxed ${
          theme === 'dark' ? 'text-white/80' : 'text-slate-700'
        }`}>
          <li>
            <strong>Jika Token Habis/Kadaluarsa:</strong> Sistem memvalidasi token terlebih dahulu ke API GitHub. Jika token mati atau habis kuota, Anda akan langsung diarahkan untuk membuka tautan <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="underline font-mono text-[#00f3ff]">https://github.com/settings/tokens</a>.
          </li>
          <li>
            <strong>Jika Repositori Tidak Ada:</strong> Sistem tidak akan menyalahkan token. Anda dapat langsung menekan <kbd className="px-1 rounded bg-black/30 font-bold">[ENTER]</kbd> untuk membuat repositori tersebut, atau mengetik nama repositori lain. Jika repositori terdeteksi di GitHub maka code ditulis di sana; jika belum ada, otomatis dianggap instruksi pembuatan repositori baru.
          </li>
        </ul>
      </div>

      <div className={`rounded-xl p-4 border ${
        theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
      }`}>
        <h4 className={`text-xs font-bold mb-2 ${
          theme === 'dark' ? 'text-amber-400' : 'text-amber-800'
        }`}>Troubleshooting Execution Policy</h4>
        <p className={`text-xs leading-relaxed mb-2 ${
          theme === 'dark' ? 'text-amber-200/70' : 'text-amber-700'
        }`}>
          Jika Anda mendapatkan error "cannot be loaded because running scripts is disabled on this system", jalankan perintah berikut sekali di PowerShell:
        </p>
        <code className={`block w-full rounded p-2 text-[10px] break-all border font-mono ${
          theme === 'dark' ? 'bg-black/60 border-amber-500/10 text-[#00f3ff]' : 'bg-slate-900 border-slate-800 text-emerald-400'
        }`}>
          Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
        </code>
      </div>
    </div>
  );

  const renderUnixInfo = () => (
    <div className="space-y-4">
      {/* Mac/Linux */}
      <div className={`rounded-xl p-4 border transition-colors ${
        theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
      }`}>
        <h3 className={`text-[13px] font-bold mb-3 flex items-center gap-2 uppercase tracking-widest ${
          theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
        }`}>
          <Terminal size={14} />
          Mac / Linux (.sh)
        </h3>
        <p className={`text-xs leading-relaxed mb-3 text-justify ${
          theme === 'dark' ? 'text-white/70' : 'text-slate-600'
        }`}>
          Untuk menggunakan skrip bash ini di macOS atau Linux:
        </p>
        <ol className={`list-decimal list-inside space-y-2 text-xs mb-3 ${
          theme === 'dark' ? 'text-white/80' : 'text-slate-700'
        }`}>
          <li>Buka aplikasi <strong>Terminal</strong> bawaan OS.</li>
          <li>Beri izin eksekusi skrip: <kbd className={`px-1 rounded font-bold ${theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700'}`}>chmod +x namafile.sh</kbd></li>
          <li>Jalankan skrip: <kbd className={`px-1 rounded font-bold ${theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700'}`}>./namafile.sh</kbd> atau <kbd className={`px-1 rounded font-bold ${theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700'}`}>bash namafile.sh</kbd></li>
        </ol>
      </div>

      {/* Android Termux */}
      <div className={`rounded-xl p-4 border ${
        theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <h3 className={`text-[13px] font-bold mb-3 flex items-center gap-2 uppercase tracking-widest ${
          theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'
        }`}>
          <Terminal size={14} />
          Android (Termux)
        </h3>
        <p className={`text-xs leading-relaxed mb-3 text-justify ${
          theme === 'dark' ? 'text-emerald-200/70' : 'text-emerald-700'
        }`}>
          Anda juga dapat melakukan Git push melalui perangkat Android menggunakan Termux:
        </p>
        <ol className={`list-decimal list-inside space-y-2 text-xs ${
          theme === 'dark' ? 'text-emerald-100' : 'text-emerald-900'
        }`}>
          <li>Instal <strong>Termux</strong> melalui F-Droid atau PlayStore.</li>
          <li>Berikan izin penyimpanan: <kbd className={`px-1 rounded font-mono ${theme === 'dark' ? 'bg-black/40 text-[#00f3ff]' : 'bg-emerald-100 text-emerald-900'}`}>termux-setup-storage</kbd></li>
          <li>Instal git: <kbd className={`px-1 rounded font-mono ${theme === 'dark' ? 'bg-black/40 text-[#00f3ff]' : 'bg-emerald-100 text-emerald-900'}`}>pkg install git</kbd></li>
          <li>Arahkan ke folder: <kbd className={`px-1 rounded font-mono ${theme === 'dark' ? 'bg-black/40 text-[#00f3ff]' : 'bg-emerald-100 text-emerald-900'}`}>cd storage/shared/FolderAnda</kbd></li>
          <li>Jalankan skrip: <kbd className={`px-1 rounded font-mono ${theme === 'dark' ? 'bg-black/40 text-[#00f3ff]' : 'bg-emerald-100 text-emerald-900'}`}>bash namafile.sh</kbd></li>
        </ol>
      </div>

      {/* iOS iSH */}
      <div className={`rounded-xl p-4 border ${
        theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'
      }`}>
        <h3 className={`text-[13px] font-bold mb-3 flex items-center gap-2 uppercase tracking-widest ${
          theme === 'dark' ? 'text-purple-400' : 'text-purple-800'
        }`}>
          <Terminal size={14} />
          iOS (iSH)
        </h3>
        <p className={`text-xs leading-relaxed mb-3 text-justify ${
          theme === 'dark' ? 'text-purple-200/70' : 'text-purple-700'
        }`}>
          Untuk pengguna iPhone/iPad, Anda dapat menggunakan aplikasi iSH:
        </p>
        <ol className={`list-decimal list-inside space-y-2 text-xs ${
          theme === 'dark' ? 'text-purple-100' : 'text-purple-900'
        }`}>
          <li>Instal aplikasi <strong>iSH Shell</strong> dari App Store.</li>
          <li>Instal modul git: <kbd className={`px-1 rounded font-mono ${theme === 'dark' ? 'bg-black/40 text-[#00f3ff]' : 'bg-purple-100 text-purple-900'}`}>apk add git</kbd></li>
          <li>Mount folder penyimpanan untuk mengakses file sistem.</li>
          <li>Arahkan dan jalankan skrip: <kbd className={`px-1 rounded font-mono ${theme === 'dark' ? 'bg-black/40 text-[#00f3ff]' : 'bg-purple-100 text-purple-900'}`}>sh namafile.sh</kbd></li>
        </ol>
      </div>
    </div>
  );

  const content = (
    <>
      <div className={`flex items-center justify-between p-4 md:p-6 border-b transition-colors ${
        theme === 'dark' ? 'border-white/10' : 'border-slate-200'
      }`}>
        <h2 className={`text-lg font-semibold flex items-center gap-2 ${
          theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
        }`}>
          <Info size={20} />
          Tata Cara Eksekusi Skrip
        </h2>
        <button 
          onClick={onClose}
          className={`p-1 rounded-md transition-colors ${
            theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: isMobile ? '70vh' : '80vh' }}>
        {scriptExtension === 'ps1' ? renderWindowsInfo() : scriptExtension === 'cmd' ? renderCmdInfo() : renderUnixInfo()}
      </div>
    </>
  );

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div 
        className={`w-full lg:w-[500px] lg:border lg:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden animate-slideUpFade ${
          theme === 'dark' 
            ? 'bg-[#0a0f1a] bg-gradient-to-b from-[#0a0f1a] to-[#05070a] border-[#00f3ff]/20 shadow-[0_0_40px_rgba(0,243,255,0.15)]' 
            : 'bg-white border-slate-200 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
            <div className={`w-12 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-slate-300'}`} />
          </div>
        )}
        {content}
      </div>
    </div>,
    document.body
  );
}
