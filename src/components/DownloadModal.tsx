import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FolderOpen, Copy, Check, Download, Terminal, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { useTheme } from '../context/ThemeContext';
import { ScriptFileItem } from '../sidebar/types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderPath?: string;
  setFolderPath?: (val: string) => void;
  fileName: string;
  scriptExtension: string;
  scriptContent: string;
}

export default function DownloadModal({
  isOpen,
  onClose,
  folderPath: propFolderPath = '',
  setFolderPath: propSetFolderPath,
  fileName,
  scriptExtension,
  scriptContent,
}: DownloadModalProps) {
  const { theme } = useTheme();
  const [internalFolderPath, setInternalFolderPath] = useState(() => {
    return localStorage.getItem('cyberFolderPath') || propFolderPath || 'C:\\Project';
  });

  const folderPath = propFolderPath || internalFolderPath;
  const setFolderPath = propSetFolderPath || ((p: string) => {
    setInternalFolderPath(p);
    localStorage.setItem('cyberFolderPath', p);
  });

  const folderPickerRef = useRef<HTMLInputElement>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDownloadSuccess(false);
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetFileName = fileName?.trim() ? fileName.trim() : 'AUTO-PUSH';
  const cleanExt = (scriptExtension || '').replace(/^\./, '').toLowerCase();

  // Generate real command to execute in terminal
  let executionCommand = '';
  if (cleanExt === 'ps1') {
    executionCommand = `powershell -ExecutionPolicy Bypass -File "${folderPath ? `${folderPath.replace(/[\\/]$/, '')}\\${targetFileName}.ps1` : `.\\${targetFileName}.ps1`}"`;
  } else if (cleanExt === 'cmd' || cleanExt === 'bat') {
    executionCommand = folderPath ? `"${folderPath.replace(/[\\/]$/, '')}\\${targetFileName}.cmd"` : `.\\${targetFileName}.cmd`;
  } else if (cleanExt === 'sh' || cleanExt === 'bash') {
    executionCommand = `bash "${folderPath ? `${folderPath.replace(/\/$/, '')}/${targetFileName}.sh` : `./${targetFileName}.sh`}"`;
  } else if (cleanExt === 'html' || cleanExt === 'htm') {
    executionCommand = `npx serve "${folderPath || '.'}" -p 3000`;
  } else {
    executionCommand = `cat "${folderPath ? `${folderPath.replace(/[\\/]$/, '')}\\${targetFileName}.${cleanExt}` : `.\\${targetFileName}.${cleanExt}`}"`;
  }

  const handlePickDirectory = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-expect-error showDirectoryPicker modern browser API
        const dirHandle = await window.showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          let newPath = dirHandle.name;
          if (folderPath.includes('\\')) {
            const lastSlash = folderPath.lastIndexOf('\\');
            newPath = folderPath.substring(0, lastSlash + 1) + dirHandle.name;
          } else if (folderPath.includes('/')) {
            const lastSlash = folderPath.lastIndexOf('/');
            newPath = folderPath.substring(0, lastSlash + 1) + dirHandle.name;
          }
          setFolderPath(newPath);
          return;
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') return;
      }
    }
    folderPickerRef.current?.click();
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const relativePath = files[0].webkitRelativePath;
      const folderName = (relativePath ? relativePath.split('/')[0] : '') || files[0].name;
      let newPath = folderName;
      if (folderPath.includes('\\')) {
        const lastSlash = folderPath.lastIndexOf('\\');
        newPath = folderPath.substring(0, lastSlash + 1) + folderName;
      } else if (folderPath.includes('/')) {
        const lastSlash = folderPath.lastIndexOf('/');
        newPath = folderPath.substring(0, lastSlash + 1) + folderName;
      }
      setFolderPath(newPath);
    }
    e.target.value = '';
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(executionCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleExecuteDownload = async () => {
    try {
      if (cleanExt === 'lottie') {
        const response = await fetch('/indonesian-maps-white.lottie');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${targetFileName}.lottie`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([scriptContent || ''], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${targetFileName}${cleanExt ? `.${cleanExt}` : '.txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setDownloadSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1100);
    } catch {}
  };

  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      const cached = localStorage.getItem('cyberScriptFiles');
      let files: ScriptFileItem[] = [];
      if (cached) {
        try {
          files = JSON.parse(cached);
        } catch {}
      }

      if (files && files.length > 0) {
        files.forEach((f) => {
          const ext = f.extension ? f.extension.replace(/^\./, '') : 'txt';
          const name = `${f.name || 'file'}.${ext}`;
          zip.file(name, f.content || '');
        });
      } else {
        const ext = cleanExt || 'txt';
        zip.file(`${targetFileName}.${ext}`, scriptContent || '');
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ALINLABS-CODE-NOTEPAD-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
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
              <Download size={18} />
            </div>
            <div>
              <h2 className={`text-sm md:text-base font-bold tracking-wide uppercase ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Unduh Berkas Fisik
              </h2>
              <p className={`text-[11px] ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
                Unduh file skrip ke komputer lokal dan panduan eksekusi terminal
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

        {/* Modal Body */}
        <div className="p-4 md:p-6 space-y-4">
          
          {/* 1. Folder Path */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold flex items-center justify-between ${
              theme === 'dark' ? 'text-white/80' : 'text-slate-700'
            }`}>
              <span>Folder Path (Direktori Penyimpanan)</span>
              <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                Path Komputer Lokal
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="Contoh: C:\Users\Dev\Documents\Project"
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none border transition-all ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#00f3ff]/60 focus:bg-white/10'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={handlePickDirectory}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
                  theme === 'dark'
                    ? 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:border-[#00f3ff]/50 hover:text-[#00f3ff]'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-sky-700'
                }`}
                title="Pilih folder di komputer lokal"
              >
                <FolderOpen size={14} />
                <span className="hidden sm:inline">Telusuri</span>
              </button>
              <input
                type="file"
                ref={folderPickerRef}
                onChange={handleFolderInputChange}
                // @ts-expect-error webkitdirectory is standard for folder picker
                webkitdirectory=""
                directory=""
                className="hidden"
              />
            </div>
          </div>

          {/* 2 & 3. Nama File & Ekstensi */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                Nama File
              </label>
              <div className={`px-3 py-2 rounded-xl text-xs font-mono border truncate font-bold ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {targetFileName}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                Ekstensi
              </label>
              <div className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-[#00f3ff]' : 'bg-slate-50 border-slate-200 text-sky-700'
              }`}>
                .{cleanExt || 'txt'}
              </div>
            </div>
          </div>

          {/* 4. Perintah Eksekusi di Terminal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${
                theme === 'dark' ? 'text-white/80' : 'text-slate-700'
              }`}>
                <Terminal size={13} className={theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600'} />
                <span>Perintah Eksekusi di Terminal</span>
              </label>
              <button
                type="button"
                onClick={handleCopyCommand}
                className={`text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  copiedCmd
                    ? 'text-emerald-400'
                    : theme === 'dark'
                    ? 'text-[#00f3ff] hover:underline'
                    : 'text-sky-600 hover:underline'
                }`}
              >
                {copiedCmd ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedCmd ? 'Tersalin' : 'Salin Perintah'}</span>
              </button>
            </div>

            <div className={`p-2.5 rounded-xl border font-mono text-[11px] leading-relaxed break-all select-all ${
              theme === 'dark'
                ? 'bg-black/60 border-white/10 text-[#00f3ff]/90'
                : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}>
              {executionCommand}
            </div>
          </div>

          {/* 5. Tombol Unduh & Footer */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownloadZip}
              title="Unduh seluruh proyek berkas sebagai arsip ZIP"
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-xs active:scale-95 ${
                theme === 'dark'
                  ? 'border-[#00f3ff]/40 bg-[#00f3ff]/10 text-[#00f3ff] hover:bg-[#00f3ff]/20'
                  : 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <Archive size={14} />
              <span>Unduh ZIP</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteDownload}
              disabled={downloadSuccess}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                downloadSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : theme === 'dark'
                  ? 'bg-[#00f3ff] hover:bg-[#00d8e6] text-[#030509] shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
              }`}
            >
              {downloadSuccess ? <Check size={14} /> : <Download size={14} />}
              <span>{downloadSuccess ? 'Tersimpan!' : 'Unduh Berkas'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
