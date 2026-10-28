import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Smartphone, Monitor, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstalled: boolean;
  isIOS: boolean;
  onTryDirectInstall?: () => void;
}

export default function InstallModal({
  isOpen,
  onClose,
  isInstalled,
  isIOS,
  onTryDirectInstall
}: InstallModalProps) {
  const { theme } = useTheme();
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
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

  const handleOpenDirect = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch {
      // fallback
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div 
        className={`w-full sm:w-[500px] max-w-[95vw] sm:border sm:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden animate-slideUpFade ${
          theme === 'dark' 
            ? 'bg-[#0a0f1a] bg-gradient-to-b from-[#0a0f1a] to-[#05070a] border-[#00f3ff]/20 shadow-[0_0_40px_rgba(0,243,255,0.15)]' 
            : 'bg-white border-slate-200 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 md:p-5 border-b transition-colors ${
          theme === 'dark' ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              theme === 'dark' ? 'bg-[#00f3ff]/10 border-[#00f3ff]/30 text-[#00f3ff]' : 'bg-sky-50 border-sky-300 text-sky-600'
            }`}>
              <Download size={18} />
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-bold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Instal Aplikasi AUTO
              </h2>
              <p className={`text-[11px] ${
                theme === 'dark' ? 'text-white/50' : 'text-slate-500'
              }`}>
                Progressive Web App (PWA) Offline Ready
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'dark' ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            aria-label="Tutup panduan instal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {isInstalled ? (
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <CheckCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs">Aplikasi Sudah Terpasang</h4>
                <p className="text-[11px] leading-relaxed mt-1">
                  AUTO sudah terpasang di perangkat Anda dan dapat diakses langsung dari Home Screen atau App Launcher.
                </p>
              </div>
            </div>
          ) : isIOS ? (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-3 ${
                theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className={theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600'} />
                  <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    Panduan Instalasi di iOS Safari:
                  </h4>
                </div>
                <ol className={`text-xs space-y-2 list-decimal list-inside leading-relaxed ${
                  theme === 'dark' ? 'text-white/75' : 'text-slate-600'
                }`}>
                  <li>
                    Buka situs ini di peramban <strong>Safari</strong> (bukan in-app browser).
                  </li>
                  <li>
                    Ketuk tombol <strong>Share</strong> (ikon kotak dengan panah ke atas) di bilah navigasi bawah Safari.
                  </li>
                  <li>
                    Gulir ke bawah dan pilih opsi <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                  </li>
                  <li>
                    Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas.
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {isInIframe && (
                <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                  theme === 'dark' ? 'bg-[#00f3ff]/10 border-[#00f3ff]/30 text-white' : 'bg-sky-50 border-sky-200 text-slate-800'
                }`}>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-[11px]">Buka di Tab Baru untuk Prompt Otomatis</p>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                      Browser Chrome/Edge memblokir prompt instalasi di dalam pratinjau iframe. Buka di tab langsung untuk instalasi 1-klik.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenDirect}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#00f3ff] text-black hover:bg-[#00d8e6] flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Buka Tab</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              )}

              <div className={`p-4 rounded-xl border space-y-3 ${
                theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Monitor size={16} className={theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600'} />
                  <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    Instalasi di Chrome, Edge, atau Android:
                  </h4>
                </div>

                <div className={`text-xs space-y-2 leading-relaxed ${
                  theme === 'dark' ? 'text-white/75' : 'text-slate-600'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                    <p>
                      Cari icon <strong>Instal Aplikasi</strong> (ikon monitor atau panah unduh) di sebelah kanan kolom URL browser.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                    <p>
                      Atau klik menu titik tiga (<strong>⋮</strong>) di pojok kanan atas browser &gt; pilih <strong>"Instal AUTO"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                    </p>
                  </div>
                </div>

                {onTryDirectInstall && (
                  <button
                    type="button"
                    onClick={() => {
                      onTryDirectInstall();
                      onClose();
                    }}
                    className={`w-full mt-2 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/10 hover:bg-[#00f3ff]/20 hover:border-[#00f3ff]/40 text-white'
                        : 'bg-white border-slate-300 hover:bg-sky-50 text-slate-800'
                    }`}
                  >
                    <span>Coba Prompt Browser Sekarang</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Keunggulan PWA */}
          <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
            theme === 'dark' ? 'bg-white/[0.02] border-white/5 text-white/60' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span className={`font-semibold block ${theme === 'dark' ? 'text-white/80' : 'text-slate-800'}`}>
              Keuntungan Menginstal PWA AUTO:
            </span>
            <p>• Akses instan tanpa perlu mengetik alamat URL setiap kali membuka.</p>
            <p>• Bekerja offline dengan cache berkas skrip lokal yang aman.</p>
            <p>• Tampilan jendela mandiri (standalone window) bebas gangguan tab peramban.</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
