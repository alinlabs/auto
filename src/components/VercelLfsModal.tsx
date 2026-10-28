import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Copy, Check, ExternalLink, HelpCircle, FileCode, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface VercelLfsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VercelLfsModal({ isOpen, onClose }: VercelLfsModalProps) {
  const { theme } = useTheme();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

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

  const copyText = (text: string, type: 'key' | 'val' | 'script') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'val') {
      setCopiedValue(true);
      setTimeout(() => setCopiedValue(false), 2000);
    } else {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden border shadow-2xl animate-slideUpFade ${
          theme === 'dark' 
            ? 'bg-[#0a0f1a] border-amber-500/30 text-white shadow-[0_0_50px_rgba(245,158,11,0.15)]' 
            : 'bg-white border-amber-200 text-slate-900 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${
          theme === 'dark' ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-100 bg-amber-50/60'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className={`text-base font-bold leading-tight ${
                theme === 'dark' ? 'text-amber-400' : 'text-amber-900'
              }`}>
                Solusi Error Git LFS di Vercel Build
              </h2>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                Penyebab file dianggap corrupt / tidak terbaca saat build di Vercel
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar">
          
          {/* Alur Kerja: Lokal -> GitHub -> Vercel */}
          <section className={`p-3.5 rounded-xl border ${
            theme === 'dark' ? 'bg-[#00f3ff]/5 border-[#00f3ff]/20' : 'bg-sky-50 border-sky-200'
          }`}>
            <h3 className={`font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
            }`}>
              <CheckCircle2 size={15} />
              Konfirmasi Alur Kerja (Sesuai Kebutuhan Anda)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center my-2.5">
              <div className={`p-2 rounded-lg border flex flex-col justify-center items-center ${
                theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <span className="font-bold text-[11px] text-emerald-400">1. File Lokal Anda</span>
                <span className="text-[10px] text-white/50 dark:text-white/50 text-slate-500">Semua file dasar web</span>
              </div>
              <div className={`p-2 rounded-lg border flex flex-col justify-center items-center ${
                theme === 'dark' ? 'bg-[#00f3ff]/10 border-[#00f3ff]/30' : 'bg-sky-100 border-sky-300'
              }`}>
                <span className={`font-bold text-[11px] ${theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-800'}`}>2. GitHub (Otomatis)</span>
                <span className="text-[10px] text-white/50 dark:text-white/50 text-slate-500">Skrip ini push ke GitHub</span>
              </div>
              <div className={`p-2 rounded-lg border flex flex-col justify-center items-center ${
                theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <span className="font-bold text-[11px] text-amber-400">3. Vercel (Manual)</span>
                <span className="text-[10px] text-white/50 dark:text-white/50 text-slate-500">Tarik dari GitHub & deploy</span>
              </div>
            </div>
            <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
              <strong>Tepat Sekali!</strong> Skrip ini 100% bertugas mengirim semua file dasar proyek Anda ke <strong>GitHub</strong>. Tidak ada yang langsung dipaksa ke Vercel. Vercel baru akan mem-build web Anda saat Anda menghubungkan atau menekan deploy di dashboard Vercel secara manual.
            </p>
          </section>

          {/* Kenapa Error? */}
          <section className={`p-3.5 rounded-xl border ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-bold flex items-center gap-1.5 mb-2 text-sm ${
              theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
            }`}>
              <HelpCircle size={16} />
              Mengapa File LFS "Seolah Tidak Terbaca" di Vercel?
            </h3>
            <p className={`leading-relaxed ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
              Ketika Git LFS diaktifkan, GitHub <strong>tidak menyimpan file asli secara langsung di repo Git</strong>, melainkan hanya menyimpan <em>Pointer File</em> teks kecil berukuran ~130 byte yang berisi hash SHA-256.
            </p>
            <div className={`mt-2.5 p-2 rounded-lg font-mono text-[11px] border ${
              theme === 'dark' ? 'bg-black/60 border-white/10 text-white/70' : 'bg-slate-200/70 border-slate-300 text-slate-800'
            }`}>
              version https://git-lfs.github.com/spec/v1<br/>
              oid sha256:7f83b165...<br/>
              size 15420310
            </div>
            <p className={`leading-relaxed mt-2.5 ${theme === 'dark' ? 'text-amber-300/90' : 'text-amber-800 font-medium'}`}>
              ⚡ Secara default, <strong>Vercel menonaktifkan download Git LFS</strong> saat proses cloning untuk mempercepat build. Akibatnya, bundler (Vite, Next.js, Webpack) mengira file teks 130 byte tersebut adalah file video/gambar Anda, sehingga build crash dengan error: <span className="font-mono text-red-400">"Unsupported format"</span> atau <span className="font-mono text-red-400">"Corrupt file"</span>.
            </p>
          </section>

          {/* Solusi 1: Paling Mudah */}
          <section className={`p-4 rounded-xl border ${
            theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-[10px]">
                1
              </span>
              <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-900'}`}>
                Solusi Resmi & Cepat (Cukup Tambah Env Variable di Vercel)
              </h3>
            </div>
            
            <p className={`leading-relaxed mb-3 ${theme === 'dark' ? 'text-emerald-200/90' : 'text-emerald-800'}`}>
              Buka <strong>Vercel Dashboard</strong> &gt; Pilih Proyek Web Anda &gt; <strong>Settings</strong> &gt; <strong>Environment Variables</strong>, lalu tambahkan:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                theme === 'dark' ? 'bg-black/50 border-emerald-500/30' : 'bg-white border-emerald-300 shadow-sm'
              }`}>
                <div>
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block">Key</span>
                  <span className="font-mono font-bold text-xs">VERCEL_GIT_LFS_ENABLED</span>
                </div>
                <button 
                  onClick={() => copyText('VERCEL_GIT_LFS_ENABLED', 'key')}
                  className={`p-1.5 rounded transition-colors ${
                    theme === 'dark' ? 'hover:bg-white/10 text-emerald-400' : 'hover:bg-emerald-100 text-emerald-700'
                  }`}
                  title="Salin Key"
                >
                  {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                theme === 'dark' ? 'bg-black/50 border-emerald-500/30' : 'bg-white border-emerald-300 shadow-sm'
              }`}>
                <div>
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block">Value</span>
                  <span className="font-mono font-bold text-xs">1</span>
                </div>
                <button 
                  onClick={() => copyText('1', 'val')}
                  className={`p-1.5 rounded transition-colors ${
                    theme === 'dark' ? 'hover:bg-white/10 text-emerald-400' : 'hover:bg-emerald-100 text-emerald-700'
                  }`}
                  title="Salin Value"
                >
                  {copiedValue ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-emerald-200/70' : 'text-emerald-800'}`}>
                Setelah disimpan, lakukan <strong>Redeploy</strong> di Vercel (buka menu Deployments &gt; titik tiga [...] &gt; Redeploy). Vercel akan otomatis mengunduh file asli LFS saat cloning!
              </span>
            </div>
          </section>

          {/* Solusi 2: Tambah script build */}
          <section className={`p-4 rounded-xl border ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-slate-500 text-white font-bold flex items-center justify-center text-[10px]">
                2
              </span>
              <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Alternatif: Tarik File LFS di package.json
              </h3>
            </div>
            
            <p className={`leading-relaxed mb-2.5 ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
              Jika Anda ingin memastikan via script build lokal/CI, tambahkan perintah <code className="bg-white/10 px-1 rounded font-mono">git lfs pull</code> sebelum perintah build di <code className="font-mono">package.json</code>:
            </p>

            <div className={`p-2.5 rounded-lg border font-mono text-[11px] flex items-center justify-between ${
              theme === 'dark' ? 'bg-black/60 border-white/10 text-[#00f3ff]' : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}>
              <code>"vercel-build": "git lfs pull && npm run build"</code>
              <button 
                onClick={() => copyText('"vercel-build": "git lfs pull && npm run build"', 'script')}
                className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Salin Script"
              >
                {copiedScript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </section>

          {/* Pembaruan Skrip Kami */}
          <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
            theme === 'dark' ? 'bg-[#00f3ff]/5 border-[#00f3ff]/20 text-white/80' : 'bg-sky-50 border-sky-200 text-sky-950'
          }`}>
            <FileCode size={16} className={theme === 'dark' ? 'text-[#00f3ff] shrink-0 mt-0.5' : 'text-sky-600 shrink-0 mt-0.5'} />
            <p className="text-[11px] leading-relaxed">
              <strong>Pembaruan Sistem:</strong> Skrip Alinlabs Utility telah diperbarui secara otomatis dengan menambahkan perintah <code className="font-mono font-bold">git add --renormalize .</code> dan <code className="font-mono font-bold">git lfs push --all</code>, memastikan seluruh data binary LFS ter-upload 100% ke GitHub dan tidak ada file pointer yang cacat.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${
          theme === 'dark' ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50'
        }`}>
          <button 
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${
              theme === 'dark'
                ? 'bg-[#00f3ff] hover:bg-[#00f3ff]/80 text-[#030509]'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
            }`}
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
