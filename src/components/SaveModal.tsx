import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Check, Sparkles, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getExtensionInfo } from '../sidebar/fileExtensions';
import { ScriptFileItem } from '../sidebar/types';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  setFileName: (val: string) => void;
  scriptExtension: string;
  setScriptExtension?: (val: any) => void;
  scriptContent: string;
  customCommit?: string;
  scriptMode?: 'MANUAL' | 'AUTO';
  lfsExtensions?: string;
  lfsSizeLimit?: string;
}

export default function SaveModal({
  isOpen,
  onClose,
  fileName,
  setFileName,
  scriptExtension,
  setScriptExtension,
  scriptContent,
  customCommit,
  scriptMode = 'AUTO',
  lfsExtensions,
  lfsSizeLimit
}: SaveModalProps) {
  const { theme } = useTheme();

  const [inputTitle, setInputTitle] = useState(fileName || 'AUTO-PUSH');
  const [inputExt, setInputExt] = useState(scriptExtension || 'ps1');
  const [customExtInput, setCustomExtInput] = useState('');
  const [isCustomExt, setIsCustomExt] = useState(false);
  const [inputDesc, setInputDesc] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputTitle(fileName || 'AUTO-PUSH');
      const cleanExt = (scriptExtension || 'ps1').replace(/^\./, '');
      setInputExt(cleanExt);
      if (!['ps1', 'cmd', 'sh', 'bat', 'html', 'lottie'].includes(cleanExt)) {
        setIsCustomExt(true);
        setCustomExtInput(cleanExt);
      } else {
        setIsCustomExt(false);
        setCustomExtInput('');
      }
      setInputDesc(`Payload skrip ${cleanExt.toUpperCase()} tersimpan di cache lokal.`);
      setIsSaved(false);

      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, fileName, scriptExtension]);

  if (!isOpen) return null;

  const currentExt = isCustomExt 
    ? (customExtInput.trim().replace(/^\./, '').toLowerCase() || 'txt')
    : inputExt.toLowerCase();

  const extMeta = getExtensionInfo(currentExt);

  const handleSaveToCache = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = (inputTitle.trim() || 'AUTO-PUSH').replace(/\.[a-zA-Z0-9_-]+$/i, '');
    const cleanDesc = inputDesc.trim() || `Berkas ${cleanTitle}.${currentExt} di cache sistem.`;

    const newFileItem: ScriptFileItem = {
      id: 'cache-' + Date.now(),
      name: cleanTitle,
      extension: currentExt,
      mode: scriptMode,
      description: cleanDesc,
      createdAt: new Date().toISOString().split('T')[0],
      isDefault: false,
      customCommit: customCommit || undefined,
      lfsExtensions: lfsExtensions || undefined,
      lfsSizeLimit: lfsSizeLimit || undefined,
      content: scriptContent
    };

    // Save into localStorage cyberScriptFiles
    try {
      const cached = localStorage.getItem('cyberScriptFiles');
      let files: ScriptFileItem[] = [];
      if (cached) {
        files = JSON.parse(cached);
      }
      // Prepend or update
      const existingIdx = files.findIndex(f => f.name.toLowerCase() === cleanTitle.toLowerCase() && f.extension.toLowerCase() === currentExt.toLowerCase());
      if (existingIdx !== -1) {
        files[existingIdx] = newFileItem;
      } else {
        files = [newFileItem, ...files];
      }
      localStorage.setItem('cyberScriptFiles', JSON.stringify(files));
      // Dispatch custom window event so all components refresh
      window.dispatchEvent(new Event('cyberScriptFilesUpdated'));
    } catch {}

    setFileName(cleanTitle);
    if (setScriptExtension) {
      setScriptExtension(currentExt);
    }

    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4 bg-black/65 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={`w-full lg:w-[540px] max-w-lg lg:border lg:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden animate-slideUpFade shadow-2xl ${
          theme === 'dark'
            ? 'bg-[#0a0f1a] bg-gradient-to-b from-[#0a0f1a] to-[#05070a] border-[#00f3ff]/20 shadow-[0_0_50px_rgba(0,243,255,0.15)] text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top handle */}
        <div className="w-full flex justify-center pt-3 pb-1 lg:hidden" onClick={onClose}>
          <div className={`w-12 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-slate-300'}`} />
        </div>

        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 md:p-5 border-b transition-colors ${
          theme === 'dark' ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-[#00f3ff]/10 text-[#00f3ff]' : 'bg-sky-50 text-sky-600'
            }`}>
              <Database size={18} />
            </div>
            <div>
              <h2 className={`text-sm md:text-base font-bold tracking-wide uppercase ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Simpan Berkas ke Cache
              </h2>
              <p className={`text-[11px] ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
                Simpan judul, format ekstensi, dan deskripsi ke memori cache aplikasi
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

        {/* Modal Body Form */}
        <form onSubmit={handleSaveToCache} className="p-4 md:p-6 space-y-4">
          
          {/* 1. Nama Judul File */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold flex items-center justify-between ${
              theme === 'dark' ? 'text-white/80' : 'text-slate-700'
            }`}>
              <span>Nama Judul Berkas</span>
              <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                Identitas Berkas
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                placeholder="Contoh: AUTO-PUSH-PROD"
                required
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none border transition-all ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#00f3ff]/60 focus:bg-white/10'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white'
                }`}
              />
              <span className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold border shrink-0 ${
                theme === 'dark'
                  ? 'bg-black/30 border-white/10 text-[#00f3ff]'
                  : 'bg-slate-100 border-slate-200 text-sky-700'
              }`}>
                .{currentExt}
              </span>
            </div>
          </div>

          {/* 2. Format Ekstensi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold ${
                theme === 'dark' ? 'text-white/80' : 'text-slate-700'
              }`}>
                Format Ekstensi
              </label>
              <button
                type="button"
                onClick={() => setIsCustomExt(prev => !prev)}
                className={`text-[10px] font-semibold underline cursor-pointer ${
                  theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600'
                }`}
              >
                {isCustomExt ? 'Opsi Bawaan' : 'Ketik Ekstensi Kustom'}
              </button>
            </div>

            {!isCustomExt ? (
              <div className={`grid grid-cols-6 gap-1 rounded-xl p-1 border ${
                theme === 'dark' ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-100'
              }`}>
                {(['ps1', 'cmd', 'sh', 'bat', 'html', 'lottie'] as const).map(ext => (
                  <button
                    key={ext}
                    type="button"
                    onClick={() => setInputExt(ext)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer ${
                      inputExt === ext
                        ? (theme === 'dark' ? 'bg-[#00f3ff] text-black shadow-xs' : 'bg-sky-600 text-white')
                        : (theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                    }`}
                  >
                    .{ext}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className={`flex items-center px-3 py-2 rounded-xl border text-xs font-mono w-full ${
                  theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <span className="opacity-40 mr-1">.</span>
                  <input
                    type="text"
                    value={customExtInput}
                    onChange={(e) => setCustomExtInput(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    placeholder="contoh: py, ts, json, env, sql, md..."
                    className="w-full bg-transparent outline-none text-xs"
                    required
                  />
                </div>
                {customExtInput && (
                  <span className={`text-[10px] shrink-0 font-medium ${
                    theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
                  }`}>
                    {extMeta.name}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 3. Deskripsi Berkas */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${
              theme === 'dark' ? 'text-white/80' : 'text-slate-700'
            }`}>
              Deskripsi Berkas
            </label>
            <textarea
              value={inputDesc}
              onChange={(e) => setInputDesc(e.target.value)}
              rows={3}
              placeholder="Deskripsi singkat mengenai fungsi dan kegunaan berkas ini..."
              className={`w-full px-3 py-2 rounded-xl text-xs outline-none border transition-all resize-none ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#00f3ff]/60 focus:bg-white/10'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Notification status / Action Footer */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <span className={`text-[11px] font-medium flex items-center gap-1.5 ${
              theme === 'dark' ? 'text-white/40' : 'text-slate-400'
            }`}>
              <Database size={13} />
              <span>Tersimpan di Cache Browser</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  theme === 'dark' ? 'border-white/10 text-white/60 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSaved}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                  isSaved
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : theme === 'dark'
                    ? 'bg-[#00f3ff] hover:bg-[#00d8e6] text-[#030509] shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                }`}
              >
                {isSaved ? <Check size={14} /> : <Save size={14} />}
                <span>{isSaved ? 'Tersimpan!' : 'Simpan ke Cache'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
