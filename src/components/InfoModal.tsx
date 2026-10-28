import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
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

  const content = (
    <>
      <div className={`flex items-center justify-between p-4 md:p-6 border-b transition-colors ${
        theme === 'dark' ? 'border-white/10' : 'border-slate-200'
      }`}>
        <h2 className={`text-lg font-semibold flex items-center ${
          theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
        }`}>
          Tatacara & Bantuan
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
        <div className="space-y-6">
          
          {/* Skrip Info */}
          <section>
            <h3 className={`text-[13px] font-bold mb-3 uppercase tracking-widest ${
              theme === 'dark' ? 'text-white/90' : 'text-slate-800'
            }`}>
              Tentang Skrip Automasi
            </h3>
            <p className={`text-xs leading-relaxed mb-4 text-justify ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            }`}>
              Skrip automasi (.ps1 untuk Windows PowerShell dan .sh untuk macOS/Linux Bash) adalah file eksekusi yang berisi instruksi otomatisasi. Alinlabs Auto memanfaatkan skrip ini untuk mengeksekusi perintah sinkronisasi Git secara otomatis ke repositori Anda.
            </p>
            
            <div className={`rounded-lg p-3 border transition-colors ${
              theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className={`text-[11px] mb-2 font-mono ${
                theme === 'dark' ? 'text-white/50' : 'text-slate-500'
              }`}>Shortcut Penting (Terminal Windows/Mac/Lin):</h4>
              <ul className="space-y-2 text-xs font-mono">
                <li className={`flex justify-between items-center border-b pb-2 ${
                  theme === 'dark' ? 'border-white/5' : 'border-slate-200'
                }`}>
                  <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-700'}>Buka Terminal/PS</span>
                  <span className={`px-2 py-0.5 rounded ${
                    theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700 font-bold'
                  }`}>Ctrl+Alt+T / Win+X, i</span>
                </li>
                <li className={`flex justify-between items-center border-b pb-2 ${
                  theme === 'dark' ? 'border-white/5' : 'border-slate-200'
                }`}>
                  <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-700'}>Buka Directory</span>
                  <span className={`px-2 py-0.5 rounded ${
                    theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700 font-bold'
                  }`}>cd [path]</span>
                </li>
                <li className={`flex justify-between items-center p-2 rounded ${
                  theme === 'dark' ? 'bg-white/5' : 'bg-slate-200/50'
                }`}>
                  <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-700'}>Jalankan Skrip</span>
                  <span className={`px-2 py-0.5 rounded ${
                    theme === 'dark' ? 'bg-white/10 text-[#00f3ff]' : 'bg-slate-200 text-sky-700 font-bold'
                  }`}>.\nama.ps1 / bash nama.sh</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Git Install Info */}
          <section>
            <h3 className={`text-[13px] font-bold mb-3 uppercase tracking-widest mt-2 ${
              theme === 'dark' ? 'text-white/90' : 'text-slate-800'
            }`}>
              Instalasi Git
            </h3>
            <p className={`text-xs leading-relaxed mb-4 ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            }`}>
              Sistem ini membutuhkan Git untuk melakukan sinkronisasi data. Jika perangkat Anda belum terinstall Git, silakan unduh melalui tautan resmi berikut sesuai Sistem Operasi Anda:
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <a 
                href="https://git-scm.com/install/windows" 
                target="_blank" 
                rel="noreferrer"
                className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-all border group ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-[#00f3ff]/10 border-white/10 hover:border-[#00f3ff]/50'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className={`transition-colors scale-75 sm:scale-100 ${
                  theme === 'dark' ? 'text-white/40 group-hover:text-[#00f3ff]' : 'text-slate-500 group-hover:text-sky-600'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16-4v24l-16-4z"/><path d="M4 12h16"/><path d="M12 2v20"/></svg>
                </div>
                <span className={`text-[9px] sm:text-[11px] font-bold tracking-wider uppercase ${
                  theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                }`}>Windows</span>
              </a>
              
              <a 
                href="https://git-scm.com/install/mac" 
                target="_blank" 
                rel="noreferrer"
                className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-all border group ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-[#00f3ff]/10 border-white/10 hover:border-[#00f3ff]/50'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className={`transition-colors scale-75 sm:scale-100 ${
                  theme === 'dark' ? 'text-white/40 group-hover:text-[#00f3ff]' : 'text-slate-500 group-hover:text-sky-600'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                </div>
                <span className={`text-[9px] sm:text-[11px] font-bold tracking-wider uppercase ${
                  theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                }`}>macOS</span>
              </a>

              <a 
                href="https://git-scm.com/install/linux" 
                target="_blank" 
                rel="noreferrer"
                className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-all border group ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-[#00f3ff]/10 border-white/10 hover:border-[#00f3ff]/50'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className={`transition-colors scale-75 sm:scale-100 flex items-center justify-center ${
                  theme === 'dark' ? 'text-white/40 group-hover:text-[#00f3ff]' : 'text-slate-500 group-hover:text-sky-600'
                }`}>
                  <Monitor size={28} />
                </div>
                <span className={`text-[9px] sm:text-[11px] font-bold tracking-wider uppercase ${
                  theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                }`}>Linux</span>
              </a>
            </div>
          </section>

          {/* Git LFS & Vercel Info */}
          <section>
            <h3 className={`text-[13px] font-bold mb-3 uppercase tracking-widest mt-2 ${
              theme === 'dark' ? 'text-white/90' : 'text-slate-800'
            }`}>
              Git LFS & Deployment Vercel
            </h3>
            <div className={`p-3.5 rounded-xl border space-y-2.5 text-xs leading-relaxed transition-colors ${
              theme === 'dark' ? 'bg-black/40 border-white/5 text-white/80' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <p>
                <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Kenapa file LFS error saat di-build di Vercel?</strong> Secara default Vercel tidak mengunduh file binary LFS, melainkan hanya clone teks pointer berukuran 130 byte. Bundler menganggap file tersebut rusak/tidak terbaca.
              </p>
              <div className="pt-1">
                <span className={`font-semibold block text-[11px] mb-1.5 ${
                  theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
                }`}>Solusi Resmi:</span>
                <p>
                  Tambahkan Environment Variable di dashboard Vercel:
                  <code className={`block p-2 rounded mt-1.5 font-mono font-bold text-[11px] border ${
                    theme === 'dark' ? 'bg-black/60 text-[#00f3ff] border-white/10' : 'bg-white text-slate-900 border-slate-300'
                  }`}>
                    VERCEL_GIT_LFS_ENABLED = 1
                  </code>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div 
        className={`w-full sm:w-[580px] md:w-[640px] max-w-[95vw] sm:border sm:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden animate-slideUpFade ${
          theme === 'dark' 
            ? 'bg-[#0a0f1a] bg-gradient-to-b from-[#0a0f1a] to-[#05070a] border-[#00f3ff]/20 shadow-[0_0_40px_rgba(0,243,255,0.15)]' 
            : 'bg-white border-slate-200 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden" onClick={onClose}>
            <div className={`w-12 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-slate-300'}`} />
          </div>
        )}
        {content}
      </div>
    </div>,
    document.body
  );
}
