import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { EXTENSION_REGISTRY } from '../sidebar/fileExtensions';

// Urutan prioritas ekstensi terpopuler yang tampil di posisi atas
const PRIORITY_EXTS = [
  'ps1', 'cmd', 'sh', 'bash', 'zsh',
  'html', 'lottie', 'json', 'ts', 'js',
  'tsx', 'jsx', 'py', 'css', 'sql',
  'md', 'yaml', 'yml', 'env', 'xml'
];

export interface ExtensionComboboxProps {
  value: string;
  onChange: (val: string) => void;
  theme: 'dark' | 'light';
}

function ExtensionCombobox({ value, onChange, theme }: ExtensionComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState((value || '').replace(/^\./, ''));
  const [isFiltering, setIsFiltering] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sinkronisasi saat value prop berubah
  useEffect(() => {
    setInputValue((value || '').replace(/^\./, ''));
    setIsFiltering(false);
  }, [value]);

  // Siapkan daftar ekstensi lengkap
  const allExtensionList = useMemo(() => {
    const list = Object.values(EXTENSION_REGISTRY);
    return list.sort((a, b) => {
      const aPriority = PRIORITY_EXTS.indexOf(a.ext);
      const bPriority = PRIORITY_EXTS.indexOf(b.ext);
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      return a.ext.localeCompare(b.ext);
    });
  }, []);

  // Filter pilihan berdasarkan input ketikan pengguna
  const trimmed = inputValue.trim().toLowerCase();
  const filteredList = useMemo(() => {
    if (!trimmed || !isFiltering) return allExtensionList;
    return allExtensionList.filter(
      (item) =>
        item.ext.toLowerCase().includes(trimmed) ||
        item.name.toLowerCase().includes(trimmed) ||
        (item.desc && item.desc.toLowerCase().includes(trimmed)) ||
        item.category.toLowerCase().includes(trimmed)
    );
  }, [trimmed, isFiltering, allExtensionList]);

  // Deteksi apakah input ketikan adalah ekstensi baru/kustom yang belum ada di daftar
  const exactExists = allExtensionList.some((item) => item.ext.toLowerCase() === trimmed);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [trimmed]);

  // Handle klik di luar untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFiltering(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectOption = (ext: string) => {
    const clean = ext.replace(/^\./, '').toLowerCase();
    onChange(clean);
    setInputValue(clean);
    setIsFiltering(false);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/^\./, '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    setInputValue(raw);
    setIsFiltering(true);
    onChange(raw);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (filteredList.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % filteredList.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (filteredList.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + filteredList.length) % filteredList.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredList.length > 0) {
        const chosen = filteredList[highlightedIndex] || filteredList[0];
        handleSelectOption(chosen.ext);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field Container */}
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 border transition-all cursor-text ${
          theme === 'dark'
            ? `bg-white/5 text-white ${
                isOpen ? 'border-[#00f3ff] ring-1 ring-[#00f3ff]/30' : 'border-white/10 hover:border-white/20'
              }`
            : `bg-white text-slate-800 ${
                isOpen ? 'border-sky-500 ring-1 ring-sky-200' : 'border-slate-200 hover:border-slate-300'
              }`
        }`}
      >
        <div className="flex items-center min-w-0 flex-1 font-mono text-xs">
          <span className="opacity-40 select-none mr-0.5">.</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder="ps1"
            onChange={handleInputChange}
            onFocus={() => {
              setIsOpen(true);
              inputRef.current?.select();
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none font-mono text-xs uppercase"
            aria-label="Pilih atau ketik ekstensi berkas"
          />
        </div>

        {/* Chevron Icon Dropdown */}
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            if (!isOpen) {
              inputRef.current?.focus();
            }
          }}
          className={`p-0.5 ml-1 rounded transition-colors cursor-pointer shrink-0 ${
            theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'
          }`}
          title={isOpen ? 'Tutup pilihan ekstensi' : 'Buka pilihan ekstensi'}
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#00f3ff]' : ''}`}
          />
        </button>
      </div>

      {/* Dropdown Card */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute right-0 top-full mt-1.5 z-50 w-72 sm:w-80 rounded-xl border shadow-2xl p-1.5 backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 overflow-y-auto custom-scrollbar ${
            theme === 'dark'
              ? 'bg-[#0c101d] border-white/15 text-white shadow-black/80'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60'
          }`}
        >
          {/* Custom option prompt jika user mengetik ekstensi yang belum ada di database */}
          {trimmed && !exactExists && (
            <button
              type="button"
              onClick={() => handleSelectOption(trimmed)}
              className={`w-full flex items-center justify-between p-2 mb-1 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#00f3ff]/10 text-[#00f3ff] hover:bg-[#00f3ff]/20'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span className="font-mono font-bold">.{trimmed}</span>
                <span className="text-[10px] opacity-80">(Gunakan ekstensi kustom ini)</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                Kustom
              </span>
            </button>
          )}

          {filteredList.length === 0 && exactExists ? null : filteredList.length === 0 ? (
            <div
              className={`py-4 px-3 text-center flex flex-col items-center justify-center gap-1 ${
                theme === 'dark' ? 'text-white/40' : 'text-slate-400'
              }`}
            >
              <Search size={15} className="opacity-50" />
              <span className="text-[11px]">Tekan Enter untuk menggunakan .{trimmed}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filteredList.map((item, idx) => {
                const isSelected = item.ext.toLowerCase() === (value || '').toLowerCase().replace(/^\./, '');
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={item.ext}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelectOption(item.ext)}
                    className={`w-full flex items-center justify-between p-1.5 sm:p-2 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-[#00f3ff]/15 text-[#00f3ff]'
                          : 'bg-sky-50 text-sky-700 font-medium'
                        : isHighlighted
                        ? theme === 'dark'
                          ? 'bg-white/10 text-white'
                          : 'bg-slate-100 text-slate-900'
                        : theme === 'dark'
                        ? 'text-white/80 hover:bg-white/5 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs">.{item.ext}</span>
                        <span className="text-[11px] font-semibold truncate">{item.name}</span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded border font-mono ${
                            theme === 'dark'
                              ? 'bg-white/5 border-white/10 text-white/60'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.desc && (
                        <span
                          className={`text-[10px] truncate ${
                            theme === 'dark' ? 'text-white/40' : 'text-slate-400'
                          }`}
                        >
                          {item.desc}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="shrink-0 text-current">
                        <Check size={13} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(ExtensionCombobox);
