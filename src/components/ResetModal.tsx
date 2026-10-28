import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  cacheSizeStr?: string;
}

export default function ResetModal({
  isOpen,
  onClose,
  onConfirmReset,
  cacheSizeStr = '0 B'
}: ResetModalProps) {
  const { theme } = useTheme();

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

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl border flex flex-col overflow-hidden animate-slideUpFade shadow-2xl ${
          theme === 'dark'
            ? 'bg-[#0a0f1a] bg-gradient-to-b from-[#0e1424] to-[#05070a] border-red-500/30 text-white shadow-[0_0_50px_rgba(239,68,68,0.2)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b transition-colors ${
          theme === 'dark' ? 'border-white/10 bg-red-500/10' : 'border-slate-100 bg-red-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 border border-red-500/30">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-red-500 tracking-wide uppercase">
                Konfirmasi Reset Cache
              </h2>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                : 'border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>
            Apakah Anda yakin ingin menghapus seluruh data cache dan berkas yang tersimpan? Tindakan ini akan mengosongkan seluruh library berkas yang pernah Anda buat dan mengembalikan konfigurasi ke pengaturan awal.
          </p>

          <div className={`p-3.5 rounded-xl border space-y-2 font-mono text-[11px] ${
            theme === 'dark'
              ? 'bg-black/40 border-white/10 text-white/70'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="font-bold uppercase tracking-wider text-[10px] text-red-400 mb-1 flex items-center gap-1.5">
              <Trash2 size={12} />
              <span>Item Yang Akan Dihapus:</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-red-400 shrink-0" />
              <span>Seluruh berkas kustom di library ({cacheSizeStr})</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-red-400 shrink-0" />
              <span>Data penyimpanan lokal (localStorage)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-red-400 shrink-0" />
              <span>Cache browser & file offline</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-end gap-2.5 transition-colors ${
          theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-white/10 text-white/70 hover:text-white hover:bg-white/5'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs'
            }`}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirmReset}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>Ya, Reset Semua Data</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
