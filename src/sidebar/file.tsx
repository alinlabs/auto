import React, { useState, useRef, useEffect, useMemo, useDeferredValue, memo } from 'react';
import { 
  Filter, 
  X, 
  Check, 
  Trash2, 
  FolderPlus, 
  RotateCcw,
  MoreVertical,
  Pencil,
  Download
} from 'lucide-react';
import { ScriptFileItem } from './types';
import { ScriptExtension } from '../components/OsCombobox';
import { useTheme } from '../context/ThemeContext';
import { getExtensionInfo } from './fileExtensions';
import DownloadModal from '../components/DownloadModal';

import rawAutoPs1 from '../assets/code/auto.ps1?raw';
import rawManualPs1 from '../assets/code/manual.ps1?raw';
import rawAutoCmd from '../assets/code/auto.cmd?raw';
import rawManualCmd from '../assets/code/manual.cmd?raw';
import rawAutoSh from '../assets/code/auto.sh?raw';
import rawManualSh from '../assets/code/manual.sh?raw';

interface FileViewProps {
  fileList: ScriptFileItem[];
  setFileList: React.Dispatch<React.SetStateAction<ScriptFileItem[]>>;
  activeFileId?: string;
  activeFileName?: string;
  activeExtension?: ScriptExtension | string;
  activeMode?: 'MANUAL' | 'AUTO';
  isCreatingNewFile?: boolean;
  setIsCreatingNewFile?: React.Dispatch<React.SetStateAction<boolean>>;
  onCreateNewFile?: () => void;
  onSelectFile: (file: ScriptFileItem) => void;
  onBackToConfig?: () => void;
}

function FileViewComponent({
  fileList,
  setFileList,
  activeFileId,
  activeFileName,
  activeExtension,
  activeMode,
  onCreateNewFile,
  onSelectFile,
  onBackToConfig,
}: FileViewProps) {
  const { theme } = useTheme();

  // Search query & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExt, setFilterExt] = useState<string>('ALL');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Card popup menu state (for 3-dots)
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const cardMenuRef = useRef<HTMLDivElement>(null);

  // Download Modal state
  const [downloadTargetFile, setDownloadTargetFile] = useState<ScriptFileItem | null>(null);

  // Edit file modal states
  const [editTargetFile, setEditTargetFile] = useState<ScriptFileItem | null>(null);
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldExt, setEditFieldExt] = useState('txt');
  const [editFieldDesc, setEditFieldDesc] = useState('');
  const editNameInputRef = useRef<HTMLInputElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Listen to external cache updates
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem('cyberScriptFiles');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFileList(parsed);
          }
        }
      } catch {}
    };
    window.addEventListener('cyberScriptFilesUpdated', handleUpdate);
    return () => window.removeEventListener('cyberScriptFilesUpdated', handleUpdate);
  }, [setFileList]);

  // Close filter popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    }
    if (isFilterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isFilterMenuOpen]);

  // Close card 3-dots popup when clicking outside
  useEffect(() => {
    function handleMenuClickOutside(event: MouseEvent | TouchEvent) {
      if (cardMenuRef.current && !cardMenuRef.current.contains(event.target as Node)) {
        setActiveMenuFileId(null);
      }
    }
    if (activeMenuFileId) {
      document.addEventListener('mousedown', handleMenuClickOutside);
      document.addEventListener('touchstart', handleMenuClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleMenuClickOutside);
      document.removeEventListener('touchstart', handleMenuClickOutside);
    };
  }, [activeMenuFileId]);

  // Focus name input field when edit modal opens
  useEffect(() => {
    if (editTargetFile) {
      setTimeout(() => {
        editNameInputRef.current?.focus();
        editNameInputRef.current?.select();
      }, 50);
    }
  }, [editTargetFile]);

  // Dynamically extract ONLY the file extensions that ACTUALLY exist in fileList
  const activeExtensionsInList = useMemo(() => {
    const set = new Set<string>();
    fileList.forEach(file => {
      if (file.extension) {
        const cleanExt = file.extension.replace(/^\./, '').toLowerCase().trim();
        if (cleanExt) {
          set.add(cleanExt);
        }
      }
    });
    return Array.from(set).sort();
  }, [fileList]);

  // If the currently filtered extension is no longer in fileList, reset to ALL
  useEffect(() => {
    if (filterExt !== 'ALL' && !activeExtensionsInList.includes(filterExt.toLowerCase())) {
      setFilterExt('ALL');
    }
  }, [activeExtensionsInList, filterExt]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelect = (file: ScriptFileItem) => {
    onSelectFile(file);
  };

  const handleOpenEdit = (file: ScriptFileItem) => {
    setEditTargetFile(file);
    setEditFieldName(file.name);
    setEditFieldExt(file.extension ? file.extension.replace(/^\./, '') : '');
    setEditFieldDesc(file.description || '');
    setActiveMenuFileId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetFile) return;

    const cleanName = (editFieldName.trim() || editTargetFile.name).replace(/\.[a-zA-Z0-9_-]+$/i, '');
    const cleanExt = editFieldExt.trim().replace(/^\./, '').toLowerCase();
    const cleanDesc = editFieldDesc.trim() || 'Belum ada deskripsi';

    const updatedFile: ScriptFileItem = {
      ...editTargetFile,
      name: cleanName,
      extension: cleanExt,
      description: cleanDesc
    };

    setFileList(prev => {
      const updated = prev.map(f => f.id === editTargetFile.id ? updatedFile : f);
      try {
        localStorage.setItem('cyberScriptFiles', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (activeFileId === editTargetFile.id || activeFileName?.toLowerCase() === editTargetFile.name.toLowerCase()) {
      onSelectFile(updatedFile);
    }

    setEditTargetFile(null);
    showToast(`Berkas diperbarui: "${cleanName}${cleanExt ? `.${cleanExt}` : ''}"`);
  };

  // Helper to extract content for a file item
  const getFileScriptContent = (file: ScriptFileItem): string => {
    if (file.content !== undefined) return file.content;
    const ext = file.extension?.toLowerCase().replace(/^\./, '');
    if (ext === 'ps1') {
      return file.mode === 'MANUAL' ? rawManualPs1 : rawAutoPs1;
    } else if (ext === 'cmd' || ext === 'bat') {
      return file.mode === 'MANUAL' ? rawManualCmd : rawAutoCmd;
    } else if (ext === 'sh' || ext === 'bash') {
      return file.mode === 'MANUAL' ? rawManualSh : rawAutoSh;
    } else if (ext === 'html' || ext === 'htm') {
      return `<!DOCTYPE html>\n<html lang="id">\n<head>\n  <meta charset="UTF-8">\n  <title>${file.name}</title>\n</head>\n<body>\n  <h1>${file.name}</h1>\n  <p>${file.description || ''}</p>\n</body>\n</html>`;
    }
    return `# ${file.name}${file.extension ? `.${file.extension}` : ''}\n# ${file.description || ''}\n`;
  };

  const handleOpenDownloadModal = (e: React.MouseEvent, file: ScriptFileItem) => {
    e.stopPropagation();
    setActiveMenuFileId(null);
    setDownloadTargetFile(file);
  };

  const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    const target = fileList.find(f => f.id === fileId);
    const targetExt = target?.extension ? target.extension.replace(/^\./, '') : '';
    setFileList(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      try {
        localStorage.setItem('cyberScriptFiles', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActiveMenuFileId(null);
    showToast(`Berkas ${target ? `"${target.name}${targetExt ? `.${targetExt}` : ''}"` : ''} berhasil dihapus.`);
  };

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Filtered files according to search query and detected extensions (deferred for ultra-smooth typing)
  const filteredList = useMemo(() => {
    return fileList.filter((f) => {
      // 1. Extension filter
      if (filterExt !== 'ALL') {
        const fExt = f.extension?.replace(/^\./, '').toLowerCase();
        if (fExt !== filterExt.toLowerCase()) {
          return false;
        }
      }

      // 2. Search query filter
      if (!deferredSearchQuery.trim()) return true;
      const q = deferredSearchQuery.toLowerCase().trim();
      const nameMatch = f.name?.toLowerCase().includes(q);
      const descMatch = f.description?.toLowerCase().includes(q);
      const extMatch = f.extension?.toLowerCase().includes(q);
      const modeMatch = f.mode?.toLowerCase().includes(q);
      const commitMatch = f.customCommit?.toLowerCase().includes(q);

      return nameMatch || descMatch || extMatch || modeMatch || commitMatch;
    });
  }, [fileList, filterExt, deferredSearchQuery]);

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 custom-scrollbar relative">
      <div className="w-full flex flex-col space-y-3 pb-6">

        {/* Searchbar Card: Clean input without magnifying glass, and filter icon on right */}
        <div className="relative w-full" ref={filterMenuRef}>
          <div className={`relative flex items-center rounded-xl border transition-all ${
            theme === 'dark'
              ? 'bg-white/[0.04] border-white/10 focus-within:border-[#00f3ff]/60 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_12px_rgba(0,243,255,0.15)]'
              : 'bg-slate-50 border-slate-200 focus-within:border-sky-500 focus-within:bg-white focus-within:shadow-sm'
          }`}>
            {/* Search Input without magnifying glass icon */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama berkas, deskripsi, atau kata kunci..."
              className={`w-full pl-3.5 pr-2 py-2 text-xs outline-none bg-transparent ${
                theme === 'dark' 
                  ? 'text-white placeholder-white/35' 
                  : 'text-slate-800 placeholder-slate-400'
              }`}
            />

            {/* Clear Search Button if query exists */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`p-1 mr-1 transition-colors cursor-pointer ${
                  theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Hapus pencarian"
              >
                <X size={13} />
              </button>
            )}

            {/* Filter Icon Button on the Far Right: Pure icon only, NO card wrapper */}
            <div className="pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setIsFilterMenuOpen(prev => !prev)}
                className={`p-1 transition-colors cursor-pointer relative flex items-center justify-center ${
                  isFilterMenuOpen || filterExt !== 'ALL'
                    ? (theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600')
                    : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700')
                }`}
                title="Filter Ekstensi Berkas"
                aria-label="Filter Ekstensi Berkas"
              >
                <Filter size={15} />
                {filterExt !== 'ALL' && (
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-[#00f3ff] shadow-[0_0_6px_#00f3ff]' : 'bg-sky-600'
                  }`} />
                )}
              </button>
            </div>
          </div>

          {/* Interactive Popup Menu for File Extensions */}
          {isFilterMenuOpen && (
            <div className={`absolute right-0 top-full mt-1.5 w-64 rounded-xl border p-1.5 z-40 shadow-2xl animate-slideUpFade backdrop-blur-md ${
              theme === 'dark'
                ? 'bg-[#060a12]/95 border-white/15 text-white shadow-[0_12px_28px_rgba(0,0,0,0.65)]'
                : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl'
            }`}>
              <div className={`px-2.5 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between border-b ${
                theme === 'dark' ? 'text-white/40 border-white/10' : 'text-slate-400 border-slate-100'
              }`}>
                <span>Filter Ekstensi Terdeteksi</span>
                {filterExt !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterExt('ALL');
                      setIsFilterMenuOpen(false);
                    }}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer lowercase"
                  >
                    reset
                  </button>
                )}
              </div>

              <div className="space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
                {/* Opsi Semua Ekstensi */}
                <button
                  type="button"
                  onClick={() => {
                    setFilterExt('ALL');
                    setIsFilterMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filterExt === 'ALL'
                      ? (theme === 'dark' ? 'bg-[#00f3ff]/15 text-[#00f3ff] font-bold' : 'bg-sky-50 text-sky-700 font-bold')
                      : (theme === 'dark' ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Semua Ekstensi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white/50' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {fileList.length}
                    </span>
                    {filterExt === 'ALL' && <Check size={13} className="text-[#00f3ff]" />}
                  </div>
                </button>

                {/* Ekstensi yang terdeteksi secara aktual di daftar file */}
                {activeExtensionsInList.length === 0 ? (
                  <div className={`p-3 text-center text-[11px] ${
                    theme === 'dark' ? 'text-white/40' : 'text-slate-400'
                  }`}>
                    Tidak ada berkas yang tersimpan
                  </div>
                ) : (
                  activeExtensionsInList.map((ext) => {
                    const extMeta = getExtensionInfo(ext);
                    const count = fileList.filter(f => f.extension?.replace(/^\./, '').toLowerCase() === ext).length;
                    const isSelected = filterExt.toLowerCase() === ext.toLowerCase();

                    return (
                      <button
                        key={ext}
                        type="button"
                        onClick={() => {
                          setFilterExt(ext);
                          setIsFilterMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          isSelected
                            ? (theme === 'dark' ? 'bg-[#00f3ff]/15 text-[#00f3ff] font-bold' : 'bg-sky-50 text-sky-700 font-bold')
                            : (theme === 'dark' ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold">.{ext}</span>
                            <span className={`text-[10px] truncate ${
                              theme === 'dark' ? 'text-white/40' : 'text-slate-400'
                            }`}>
                              {extMeta.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                            theme === 'dark' ? 'bg-white/5 border-white/10 text-white/50' : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {count}
                          </span>
                          {isSelected && <Check size={13} className="text-[#00f3ff]" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Indicator Tag Row */}
        {(filterExt !== 'ALL' || searchQuery.trim() !== '') && (
          <div className="flex items-center justify-between text-[11px] px-1 pt-0.5">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className={`text-[11px] truncate ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
                Menampilkan <strong className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>{filteredList.length}</strong> berkas
              </span>
              {filterExt !== 'ALL' && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                  theme === 'dark' ? 'bg-[#00f3ff]/10 text-[#00f3ff] border-[#00f3ff]/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  .{filterExt} ({getExtensionInfo(filterExt).name})
                  <button 
                    type="button"
                    onClick={() => setFilterExt('ALL')}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                    title="Hapus filter ekstensi"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterExt('ALL');
              }}
              className={`text-[10px] font-semibold hover:underline cursor-pointer shrink-0 ml-2 ${
                theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600'
              }`}
            >
              Reset
            </button>
          </div>
        )}

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-slideUpFade">
            <Check size={14} className="shrink-0 text-emerald-400" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* List of Files: Card with 3-dots popup on the right aligned with title */}
        <div className="space-y-2 pt-1">
          {filteredList.length === 0 ? (
            <div className={`p-6 text-center rounded-xl border border-dashed my-2 ${
              theme === 'dark' ? 'border-white/10 text-white/40' : 'border-slate-300 text-slate-400'
            }`}>
              <FolderPlus size={26} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">
                {searchQuery || filterExt !== 'ALL'
                  ? 'Tidak ada berkas yang cocok dengan filter pencarian'
                  : 'Belum ada berkas dalam library'}
              </p>
              {searchQuery || filterExt !== 'ALL' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterExt('ALL');
                  }}
                  className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <RotateCcw size={12} />
                  <span>Reset Filter & Pencarian</span>
                </button>
              ) : onCreateNewFile ? (
                <button
                  type="button"
                  onClick={onCreateNewFile}
                  className={`mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-[#00f3ff]/40 bg-[#00f3ff]/10 text-[#00f3ff] hover:bg-[#00f3ff]/20'
                      : 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  <FolderPlus size={14} />
                  <span>Tambah Berkas Baru</span>
                </button>
              ) : null}
            </div>
          ) : (
            filteredList.map((file) => {
              const fileCleanExt = (file.extension || '').replace(/^\./, '').toLowerCase().trim();
              const activeCleanExt = (activeExtension || '').replace(/^\./, '').toLowerCase().trim();
              const isActive = activeFileId 
                ? file.id === activeFileId
                : ((activeFileName?.trim().toLowerCase() === file.name.trim().toLowerCase()) && 
                   (activeCleanExt === fileCleanExt) && 
                   (activeMode === undefined || activeMode === file.mode));

              const extMeta = fileCleanExt ? getExtensionInfo(fileCleanExt) : null;
              const isMenuOpen = activeMenuFileId === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => handleSelect(file)}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer relative group select-none ${
                    isActive
                      ? (theme === 'dark'
                          ? 'bg-[#00f3ff]/10 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.15)]'
                          : 'bg-sky-50 border-sky-400 shadow-xs')
                      : (theme === 'dark'
                          ? 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs')
                  }`}
                  title={`Klik untuk membuka ${file.name}${fileCleanExt ? `.${fileCleanExt}` : ''} di editor`}
                >
                  {/* Judul & Titik Tiga Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono text-xs font-bold truncate ${
                      isActive
                        ? (theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700')
                        : (theme === 'dark' ? 'text-white group-hover:text-[#00f3ff]' : 'text-slate-900 group-hover:text-sky-600')
                    }`}>
                      {file.name}{fileCleanExt ? `.${fileCleanExt}` : ''}
                    </span>

                    {/* Titik Tiga (MoreVertical) Menu Popup */}
                    <div 
                      className="relative shrink-0" 
                      ref={isMenuOpen ? cardMenuRef : undefined}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuFileId(prev => prev === file.id ? null : file.id);
                        }}
                        className={`p-1 rounded-md transition-colors cursor-pointer flex items-center justify-center ${
                          isMenuOpen
                            ? (theme === 'dark' ? 'text-[#00f3ff] bg-white/10' : 'text-sky-700 bg-sky-100')
                            : (theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100')
                        }`}
                        title="Opsi Berkas"
                        aria-label="Opsi Berkas"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {/* Menu Popup: Unduh, Ubah Nama, Hapus */}
                      {isMenuOpen && (
                        <div 
                          className={`absolute right-0 top-full mt-1 w-40 rounded-xl border p-1 z-30 shadow-2xl animate-slideUpFade backdrop-blur-md ${
                            theme === 'dark' 
                              ? 'bg-[#060a12]/95 border-white/15 text-white shadow-[0_8px_20px_rgba(0,0,0,0.6)]' 
                              : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl'
                          }`}
                        >
                          {/* 1. Unduh (Membuka Modal Unduh Fisik) */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenDownloadModal(e, file)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              theme === 'dark' ? 'hover:bg-white/10 text-white/90' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Download size={13} className={theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600'} />
                            <span>Unduh</span>
                          </button>

                          {/* 2. Ubah Nama */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(file);
                            }}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              theme === 'dark' ? 'hover:bg-white/10 text-white/90' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Pencil size={13} className={theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-600'} />
                            <span>Ubah Nama</span>
                          </button>

                          <div className={`my-1 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`} />

                          {/* 3. Hapus */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFile(e, file.id)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              theme === 'dark' ? 'hover:bg-rose-500/20 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                            }`}
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deskripsi Ringkas */}
                  <p className={`text-[11px] leading-relaxed mt-1 line-clamp-2 ${
                    theme === 'dark' ? 'text-white/60' : 'text-slate-500'
                  }`}>
                    {file.description || (extMeta ? extMeta.name : 'Berkas kustom')}
                  </p>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Modal Unduh Berkas Fisik */}
      {downloadTargetFile && (
        <DownloadModal
          isOpen={Boolean(downloadTargetFile)}
          onClose={() => setDownloadTargetFile(null)}
          fileName={downloadTargetFile.name}
          scriptExtension={downloadTargetFile.extension}
          scriptContent={getFileScriptContent(downloadTargetFile)}
        />
      )}

      {/* Modal Ubah Nama / Berkas */}
      {editTargetFile && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setEditTargetFile(null)}
        >
          <div 
            className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl transition-all ${
              theme === 'dark' ? 'bg-[#070b14] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${
              theme === 'dark' ? 'border-white/10' : 'border-slate-100'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-700'
              }`}>
                <Pencil size={14} />
                <span>Ubah Berkas Library</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditTargetFile(null)}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className={`block text-[11px] font-medium mb-1 ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
                    Nama Berkas
                  </label>
                  <input
                    ref={editNameInputRef}
                    type="text"
                    value={editFieldName}
                    onChange={(e) => setEditFieldName(e.target.value)}
                    required
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono outline-none border transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white focus:border-[#00f3ff]/60'
                        : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
                    Ekstensi
                  </label>
                  <div className={`flex items-center px-2 py-1.5 rounded-lg border text-xs font-mono ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <span className="opacity-40 select-none mr-0.5">.</span>
                    <input
                      type="text"
                      value={editFieldExt}
                      onChange={(e) => setEditFieldExt(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      placeholder="-"
                      className="w-full bg-transparent outline-none font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
                  Deskripsi Berkas
                </label>
                <textarea
                  value={editFieldDesc}
                  onChange={(e) => setEditFieldDesc(e.target.value)}
                  rows={2}
                  placeholder="Keterangan singkat berkas..."
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border transition-colors resize-none ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white focus:border-[#00f3ff]/60'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTargetFile(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    theme === 'dark' ? 'border-white/10 text-white/60 hover:text-white' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    theme === 'dark'
                      ? 'bg-[#00f3ff] text-black hover:bg-[#00d8e6]'
                      : 'bg-sky-600 text-white hover:bg-sky-700'
                  }`}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const FileView = memo(FileViewComponent);
export default FileView;

