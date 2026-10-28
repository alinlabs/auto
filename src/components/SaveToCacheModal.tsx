import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ScriptFileItem } from '../sidebar/types';
import ExtensionCombobox from './ExtensionCombobox';

interface SaveToCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  setFileName: (val: string) => void;
  scriptExtension: string;
  setScriptExtension?: (val: any) => void;
  scriptContent: string;
  fileList?: ScriptFileItem[];
  setFileList?: React.Dispatch<React.SetStateAction<ScriptFileItem[]>>;
  activeFileId?: string;
  onSaved?: (file: ScriptFileItem) => void;
}

function SaveToCacheModal({
  isOpen,
  onClose,
  fileName,
  setFileName,
  scriptExtension,
  setScriptExtension,
  scriptContent,
  fileList = [],
  setFileList,
  activeFileId,
  onSaved,
}: SaveToCacheModalProps) {
  const { theme } = useTheme();

  const [inputName, setInputName] = useState(fileName || 'AUTO-PUSH');
  const [inputExt, setInputExt] = useState((scriptExtension || '').replace(/^\./, ''));
  const [inputDesc, setInputDesc] = useState('');
  const [savedToastLabel, setSavedToastLabel] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Sinkronisasi saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const cleanInitialExt = (scriptExtension || '').replace(/^\./, '');
      setInputName(fileName || 'AUTO-PUSH');
      setInputExt(cleanInitialExt);

      // Cari deskripsi jika file sudah ada di fileList
      const existing = fileList.find(
        (f) =>
          (activeFileId && f.id === activeFileId) ||
          (f.name.toLowerCase() === (fileName || '').toLowerCase() &&
           (f.extension || '').toLowerCase().replace(/^\./, '') === cleanInitialExt.toLowerCase())
      );
      if (existing && existing.description && existing.description !== 'Berkas kustom') {
        setInputDesc(existing.description);
      } else if (cleanInitialExt) {
        setInputDesc(`Skrip kustom .${cleanInitialExt}`);
      } else {
        setInputDesc('');
      }
    }
  }, [isOpen, fileName, scriptExtension, fileList, activeFileId]);

  const { lineCount, sizeKb } = useMemo(() => {
    if (!isOpen) return { lineCount: 0, sizeKb: '0.00' };
    const lines = scriptContent ? scriptContent.split('\n').length : 0;
    const kb = (new Blob([scriptContent || '']).size / 1024).toFixed(2);
    return { lineCount: lines, sizeKb: kb };
  }, [isOpen, scriptContent]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const rawName = inputName.trim() || 'AUTO-PUSH';
    const extFromNameMatch = rawName.match(/\.([a-zA-Z0-9_-]+)$/);
    const extFromName = extFromNameMatch ? extFromNameMatch[1].toLowerCase() : '';

    const cleanName = rawName.replace(/\.[a-zA-Z0-9_-]+$/i, '');
    const cleanExt = (inputExt.trim() || extFromName || 'ps1').replace(/^\./, '').toLowerCase();
    const cleanDesc = inputDesc.trim() || `Skrip kustom .${cleanExt}`;

    setFileName(cleanName);
    setScriptExtension?.(cleanExt);
    setSavedToastLabel(`${cleanName}.${cleanExt}`);

    // Simpan ke fileList di cache localStorage
    if (setFileList) {
      setFileList((prev) => {
        const existingIndex = prev.findIndex(
          (f) =>
            (activeFileId && f.id === activeFileId) ||
            (f.name.toLowerCase() === cleanName.toLowerCase() &&
             (f.extension || '').toLowerCase().replace(/^\./, '') === cleanExt)
        );

        let updatedList: ScriptFileItem[];

        if (existingIndex !== -1) {
          const updatedFile: ScriptFileItem = {
            ...prev[existingIndex],
            name: cleanName,
            extension: cleanExt,
            description: cleanDesc,
            content: scriptContent,
          };
          updatedList = [...prev];
          updatedList[existingIndex] = updatedFile;
          onSaved?.(updatedFile);
        } else {
          const newFile: ScriptFileItem = {
            id: 'custom-' + Date.now(),
            name: cleanName,
            extension: cleanExt,
            mode: 'AUTO',
            description: cleanDesc,
            createdAt: new Date().toISOString().split('T')[0],
            isDefault: false,
            content: scriptContent,
          };
          updatedList = [newFile, ...prev];
          onSaved?.(newFile);
        }

        try {
          localStorage.setItem('cyberScriptFiles', JSON.stringify(updatedList));
        } catch {}

        return updatedList;
      });
    }

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 850);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all relative ${
          theme === 'dark'
            ? 'bg-[#0a0f1a] bg-gradient-to-b from-[#0a0f1a] to-[#05070a] border-[#00f3ff]/20 shadow-[0_0_50px_rgba(0,243,255,0.15)] text-white'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Judul tanpa ikon di kiri, tanpa sub-judul, dan tanpa garis pemisah di bawah */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-bold tracking-tight">
            Simpan ke Cache Lokal
          </h3>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Tutup"
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Notifikasi feedback jika baru disimpan */}
        {showToast ? (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 my-4">
            <Check size={16} className="shrink-0 text-emerald-400" />
            <span>Berkas "{savedToastLabel}" berhasil disimpan ke cache lokal!</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Nama File & Ekstensi Combobox */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              <div className="sm:col-span-3 flex flex-col gap-1">
                <label className={`text-[11px] font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
                  Nama Berkas
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Contoh: AUTO-PUSH"
                  required
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono outline-none border transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white focus:border-[#00f3ff]/60'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                  }`}
                  autoFocus
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className={`text-[11px] font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
                  Ekstensi
                </label>
                <ExtensionCombobox
                  value={inputExt}
                  onChange={setInputExt}
                  theme={theme}
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
                Deskripsi / Keterangan Berkas
              </label>
              <textarea
                value={inputDesc}
                onChange={(e) => setInputDesc(e.target.value)}
                rows={2}
                placeholder="Tuliskan keterangan berkas untuk daftar file..."
                className={`w-full px-3 py-2 rounded-xl text-xs outline-none border transition-colors resize-none ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#00f3ff]/60'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500'
                }`}
              />
            </div>

            {/* Info ringkas baris & ukuran */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] font-mono ${
                theme === 'dark'
                  ? 'bg-white/[0.02] border-white/5 text-white/50'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span>
                Panjang Kode:{' '}
                <strong className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>{lineCount}</strong> baris
              </span>
              <span>
                Ukuran:{' '}
                <strong className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>{sizeKb}</strong> KB
              </span>
            </div>

            {/* Tombol Simpan: tanpa pembatas garis di atas, tanpa tombol batal, tanpa checkmark, dan full lebar (w-full) */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm text-center ${
                  theme === 'dark'
                    ? 'bg-[#00f3ff] text-black hover:bg-[#00d8e6] active:scale-[0.99]'
                    : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-[0.99]'
                }`}
              >
                Simpan ke Cache
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

export default React.memo(SaveToCacheModal);
