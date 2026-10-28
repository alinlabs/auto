import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FolderOpen, Archive, AlertTriangle } from 'lucide-react';
import { extractFileOrFolderPath, resolveTargetFullPath, updateBaseDirFromPath } from '../utils';
import { FastInput } from '../../components/FastInput';

interface TargetPathFieldProps {
  theme: 'dark' | 'light';
  autoPath: string;
  setAutoPath: (val: string) => void;
  setIsZipTarget: (val: boolean) => void;
  autoUsername: string;
}

const TargetPathField: React.FC<TargetPathFieldProps> = ({
  theme,
  autoPath,
  setAutoPath,
  setIsZipTarget,
  autoUsername,
}) => {
  const [isDraggingOverPath, setIsDraggingOverPath] = useState(false);
  const [isPickerMenuOpen, setIsPickerMenuOpen] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const zipPickerRef = useRef<HTMLInputElement>(null);
  const folderPickerRef = useRef<HTMLInputElement>(null);
  const pickerMenuRef = useRef<HTMLDivElement>(null);

  const handlePathChange = useCallback((val: string) => {
    setAutoPath(val);
    updateBaseDirFromPath(val);
    setIsZipTarget(val.trim().toLowerCase().endsWith('.zip'));
  }, [setAutoPath, setIsZipTarget]);

  const showZipError = (msg: string) => {
    setZipError(msg);
    setTimeout(() => setZipError(null), 4000);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerMenuRef.current && !pickerMenuRef.current.contains(e.target as Node)) {
        setIsPickerMenuOpen(false);
      }
    };
    if (isPickerMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerMenuOpen]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverPath(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverPath(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverPath(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const isZip = file.name.toLowerCase().endsWith('.zip');
      const direct = extractFileOrFolderPath(file, !isZip);
      const targetPath = direct || resolveTargetFullPath(file.name, isZip, autoPath, autoUsername);
      setAutoPath(targetPath);
      updateBaseDirFromPath(targetPath);
      setIsZipTarget(isZip);
      return;
    }

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const item = items[0];
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) {
        const isZip = entry.isFile && entry.name.toLowerCase().endsWith('.zip');
        const fileObj = item.getAsFile ? item.getAsFile() : null;
        const direct = fileObj ? extractFileOrFolderPath(fileObj, !isZip) : null;
        const targetPath = direct || resolveTargetFullPath(entry.name, isZip, autoPath, autoUsername);
        setAutoPath(targetPath);
        updateBaseDirFromPath(targetPath);
        setIsZipTarget(isZip);
      }
    }
  };

  const handlePickFolder = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-expect-error showDirectoryPicker modern browser API
        const dirHandle = await window.showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          let detectedPath: string | null = null;
          try {
            for await (const entry of (dirHandle as any).values()) {
              if (entry.kind === 'file') {
                const f = await entry.getFile();
                const p = extractFileOrFolderPath(f, true);
                if (p) {
                  detectedPath = p;
                  break;
                }
              }
            }
          } catch {}

          const fullPath = detectedPath || resolveTargetFullPath(dirHandle.name, false, autoPath, autoUsername);
          setAutoPath(fullPath);
          updateBaseDirFromPath(fullPath);
          setIsZipTarget(false);
          return;
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') return;
      }
    }
    folderPickerRef.current?.click();
  };

  const handlePickZip = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        // @ts-expect-error showOpenFilePicker modern browser API
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'File Arsip ZIP (*.zip)',
              accept: {
                'application/zip': ['.zip'],
                'application/x-zip-compressed': ['.zip']
              }
            }
          ],
          excludeAcceptAllOption: true,
          multiple: false
        });
        if (fileHandle && fileHandle.name) {
          if (!fileHandle.name.toLowerCase().endsWith('.zip')) {
            showZipError('Format salah: Pilihan harus berupa file berekstensi .zip');
            return;
          }
          let detectedPath: string | null = null;
          try {
            const f = await fileHandle.getFile();
            detectedPath = extractFileOrFolderPath(f, false);
          } catch {}

          const fullPath = detectedPath || resolveTargetFullPath(fileHandle.name, true, autoPath, autoUsername);
          setAutoPath(fullPath);
          updateBaseDirFromPath(fullPath);
          setIsZipTarget(true);
          return;
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') return;
      }
    }
    zipPickerRef.current?.click();
  };

  const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        showZipError('Format salah: Pilihan harus berupa file berekstensi .zip');
        e.target.value = '';
        return;
      }
      const direct = extractFileOrFolderPath(file, false);
      const fullPath = direct || resolveTargetFullPath(file.name, true, autoPath, autoUsername);
      setAutoPath(fullPath);
      updateBaseDirFromPath(fullPath);
      setIsZipTarget(true);
    }
    e.target.value = '';
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      let detectedPath: string | null = null;
      for (let i = 0; i < Math.min(files.length, 10); i++) {
        const p = extractFileOrFolderPath(files[i], true);
        if (p) {
          detectedPath = p;
          break;
        }
      }

      let fullPath = detectedPath;
      if (!fullPath) {
        const relativePath = files[0].webkitRelativePath;
        const folderName = (relativePath ? relativePath.split('/')[0] : '') || files[0].name;
        fullPath = resolveTargetFullPath(folderName, false, autoPath, autoUsername);
      }

      setAutoPath(fullPath);
      updateBaseDirFromPath(fullPath);
      setIsZipTarget(false);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      <input 
        type="file" 
        ref={zipPickerRef} 
        accept=".zip,application/zip,application/x-zip-compressed" 
        onChange={handleZipFileChange} 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={folderPickerRef} 
        onChange={handleFolderChange} 
        className="hidden" 
        {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
      />

      <div className="flex items-center justify-between gap-1.5">
        <span className={`text-[11px] font-medium truncate ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
          Path Target
        </span>
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex items-center rounded-lg transition-all ${
          isDraggingOverPath ? 'ring-2 ring-[#00f3ff] scale-[1.01]' : ''
        }`}
      >
        <FastInput 
          type="text" 
          value={autoPath}
          onChange={handlePathChange}
          className={`w-full rounded-lg pl-2.5 pr-8 py-1.5 md:pl-3 md:pr-9 md:py-2 font-mono outline-none text-[11px] md:text-sm lg:text-xs border transition-colors ${
            theme === 'dark' 
              ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#00f3ff]/50' 
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
          }`}
        />

        <div className="absolute right-2 md:right-2.5 flex items-center" ref={pickerMenuRef}>
          <button
            type="button"
            onClick={() => setIsPickerMenuOpen(!isPickerMenuOpen)}
            title="Pilih Folder atau File ZIP"
            className={`p-1 rounded transition-colors cursor-pointer flex items-center justify-center outline-none ${
              isPickerMenuOpen
                ? (theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600')
                : (theme === 'dark' 
                    ? 'text-white/40 hover:text-[#00f3ff]' 
                    : 'text-slate-400 hover:text-sky-600')
            }`}
            aria-label="Pilih Folder atau File ZIP"
          >
            <FolderOpen size={16} />
          </button>

          {isPickerMenuOpen && (
            <div 
              className={`absolute right-0 top-full mt-1.5 w-52 rounded-xl border p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                theme === 'dark'
                  ? 'bg-[#0b101b] border-white/15 text-white shadow-[0_10px_30px_rgba(0,0,0,0.7)]'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsPickerMenuOpen(false);
                  handlePickFolder();
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'hover:bg-white/10 text-white/90 hover:text-[#00f3ff]'
                    : 'hover:bg-sky-50 text-slate-700 hover:text-sky-700'
                }`}
              >
                <div className={`p-1.5 rounded-md shrink-0 ${theme === 'dark' ? 'bg-[#00f3ff]/10 text-[#00f3ff]' : 'bg-sky-100 text-sky-700'}`}>
                  <FolderOpen size={15} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-xs leading-tight">Pilih Folder</span>
                  <span className="text-[10px] opacity-60 leading-tight mt-0.5">Alamat lengkap (C:\...)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPickerMenuOpen(false);
                  handlePickZip();
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer mt-1 ${
                  theme === 'dark'
                    ? 'hover:bg-white/10 text-white/90 hover:text-amber-400'
                    : 'hover:bg-amber-50 text-slate-700 hover:text-amber-700'
                }`}
              >
                <div className={`p-1.5 rounded-md shrink-0 ${theme === 'dark' ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                  <Archive size={15} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-xs leading-tight">Pilih File ZIP</span>
                  <span className="text-[10px] opacity-60 leading-tight mt-0.5">Spesifik hanya file .zip</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
      {zipError && (
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-medium flex items-center gap-1.5 animate-slideUpFade">
          <AlertTriangle size={13} className="shrink-0" />
          <span>{zipError}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(TargetPathField);
