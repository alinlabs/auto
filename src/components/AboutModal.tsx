import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
      {/* Header Modal */}
      <div className={`flex items-center justify-between p-4 md:p-6 border-b transition-colors ${
        theme === 'dark' ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div>
          <h2 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
          }`}>
            Tentang AUTO & Pengembang
          </h2>
          <p className={`text-[10px] sm:text-xs mt-0.5 ${
            theme === 'dark' ? 'text-white/50' : 'text-slate-500'
          }`}>
            Alinlabs Utility Technology Operations
          </p>
        </div>

        <button 
          onClick={onClose}
          className={`p-1 rounded-md transition-colors cursor-pointer ${
            theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-slate-800'
          }`}
          aria-label="Tutup modal informasi"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Konten Scrollable */}
      <div className="p-4 md:p-6 overflow-y-auto space-y-6" style={{ maxHeight: isMobile ? '70vh' : '80vh' }}>
        
        {/* Ringkasan Platform */}
        <section>
          <h3 className={`text-[13px] font-bold mb-2.5 uppercase tracking-widest ${
            theme === 'dark' ? 'text-white/90' : 'text-slate-800'
          }`}>
            Tentang Aplikasi
          </h3>
          <p className={`text-xs leading-relaxed text-justify ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-600'
          }`}>
            <strong className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>AUTO (Alinlabs Utility Technology Operations)</strong> adalah platform utilitas rekayasa perangkat lunak yang dirancang untuk mengotomasi alur kerja Git Version Control, pembuatan payload skrip multi-lingkungan (PowerShell, CMD, dan Bash), serta manajemen terintegrasi Git Large File Storage (LFS) untuk mencegah kegagalan build pada platform cloud hosting seperti Vercel.
          </p>
        </section>

        {/* Profil Pencipta */}
        <section>
          <h3 className={`text-[13px] font-bold mb-2.5 uppercase tracking-widest ${
            theme === 'dark' ? 'text-white/90' : 'text-slate-800'
          }`}>
            Pencipta & Pengembang
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className={`font-semibold min-w-28 ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                Nama Pencipta:
              </span>
              <span className={`font-bold text-sm ${theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-800'}`}>
                Alvareza Hilka Pratama
              </span>
            </div>
            
            <p className={`leading-relaxed text-justify ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            }`}>
              Platform ini dikonsep, dirancang, dan dikembangkan secara independen oleh <strong className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>Alvareza Hilka Pratama</strong> untuk menjawab kebutuhan operasional para pengembang perangkat lunak dalam menyederhanakan siklus deploy, menjaga keamanan integritas repositori, dan meminimalisir kesalahan manual pada tahap version control payload delivery.
            </p>
          </div>
        </section>

        {/* Visi & Perusahaan: AlinLabs Indonesia */}
        <section>
          <h3 className={`text-[13px] font-bold mb-2.5 uppercase tracking-widest ${
            theme === 'dark' ? 'text-white/90' : 'text-slate-800'
          }`}>
            Di Bawah Visi AlinLabs Indonesia
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className={`font-semibold min-w-28 ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                Entitas Perusahaan:
              </span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                AlinLabs Indonesia
              </span>
            </div>

            <p className={`leading-relaxed text-justify ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            }`}>
              <strong className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>AlinLabs Indonesia</strong> merupakan induk inovasi teknologi yang berfokus pada pengembangan utilitas perangkat lunak tingkat lanjut, otomatisasi operasional teknologi, dan arsitektur komputasi modern.
            </p>

            <p className={`leading-relaxed text-justify ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            }`}>
              <strong className={theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'}>Visi AlinLabs Indonesia: </strong>
              Menyediakan ekosistem peralatan rekayasa perangkat lunak yang tangguh, efisien, dan berdaya guna tinggi guna mempercepat lompatan produktivitas pengembang teknologi di Indonesia dan global.
            </p>
          </div>
        </section>

        {/* Jaminan Privasi & Operasional */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className={`font-bold block text-xs mb-1 ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}>
              100% Client-Side Privacy
            </h4>
            <p className={`leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
              Seluruh pembuatan berkas skrip diproses langsung di peramban lokal tanpa mengirim data kode ke server luar.
            </p>
          </div>

          <div>
            <h4 className={`font-bold block text-xs mb-1 ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}>
              PWA & Offline Ready
            </h4>
            <p className={`leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
              Dapat diinstal ke perangkat desktop/mobile dan digunakan tanpa hambatan koneksi jaringan.
            </p>
          </div>
        </section>

        {/* Footer / Copyright */}
        <div className={`pt-3 text-center text-[10px] border-t ${
          theme === 'dark' ? 'border-white/5 text-white/40' : 'border-slate-200 text-slate-500'
        }`}>
          © 2026 AlinLabs Indonesia. Diciptakan oleh <strong className={theme === 'dark' ? 'text-white/70' : 'text-slate-700'}>Alvareza Hilka Pratama</strong>. Seluruh hak cipta dilindungi undang-undang.
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
