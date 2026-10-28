import React, { useState } from 'react';
import { 
  FolderPlus, 
  FileCode, 
  FileText, 
  SlidersHorizontal, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  Terminal, 
  FileCog, 
  Globe, 
  FileJson, 
  ChevronRight,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface ProjectFile {
  id: string;
  name: string;
  extension: string;
  content: string;
  category: 'SCRIPT' | 'CONFIG' | 'DOCS' | 'CUSTOM';
  updatedAt: string;
  isSystem?: boolean;
}

export const TEMPLATE_PRESETS = [
  {
    id: 'ps1',
    label: 'PowerShell (.ps1)',
    ext: 'ps1',
    category: 'SCRIPT' as const,
    defaultName: 'custom-push.ps1',
    description: 'Skrip eksekusi otomatis untuk terminal Windows PowerShell',
    content: `# [ALINLABS UTILITY] Custom PowerShell Script
$ErrorActionPreference = "Continue"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  > Menjalankan Skrip Otomasi Kustom..." -ForegroundColor DarkCyan
Write-Host "==========================================" -ForegroundColor Cyan

# Perintah Git
git status
`
  },
  {
    id: 'cmd',
    label: 'CMD Batch (.cmd)',
    ext: 'cmd',
    category: 'SCRIPT' as const,
    defaultName: 'custom-push.cmd',
    description: 'Skrip batch Command Prompt Windows tanpa ExecutionPolicy',
    content: `@echo off
title ALINLABS UTILITY - Custom Batch Script
color 0b

echo ==========================================
echo   Menjalankan Skrip Otomasi CMD...
echo ==========================================

git status
pause
`
  },
  {
    id: 'sh',
    label: 'Bash Shell (.sh)',
    ext: 'sh',
    category: 'SCRIPT' as const,
    defaultName: 'custom-push.sh',
    description: 'Skrip shell POSIX untuk macOS, Linux, dan Git Bash',
    content: `#!/usr/bin/env bash
set -e

echo -e "\\033[1;36m==========================================\\033[0m"
echo -e "\\033[0;36m  > Menjalankan Skrip Otomasi Bash...\\033[0m"
echo -e "\\033[1;36m==========================================\\033[0m"

git status
`
  },
  {
    id: 'gitignore',
    label: 'Git Ignore (.gitignore)',
    ext: 'gitignore',
    category: 'CONFIG' as const,
    defaultName: '.gitignore',
    description: 'Aturan pengabaian file build, env, dan cache Git',
    content: `# Dependencies
node_modules/
.pnp
.pnp.js

# Production build outputs
dist/
build/
out/
.vercel/

# Environment variables
.env*
!.env.example

# Logs and system
*.log
.DS_Store
Thumbs.db
`
  },
  {
    id: 'gitattributes',
    label: 'Git LFS (.gitattributes)',
    ext: 'gitattributes',
    category: 'CONFIG' as const,
    defaultName: '.gitattributes',
    description: 'Pelacakan Git LFS untuk file media dan binary besar',
    content: `# Auto-detect text files and normalize line endings
* text=auto

# Git LFS tracking for media & large binary files
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
*.tar.gz filter=lfs diff=lfs merge=lfs -text
*.psd filter=lfs diff=lfs merge=lfs -text
*.exe filter=lfs diff=lfs merge=lfs -text
*.iso filter=lfs diff=lfs merge=lfs -text
*.glb filter=lfs diff=lfs merge=lfs -text
`
  },
  {
    id: 'vercel',
    label: 'Vercel Config (vercel.json)',
    ext: 'json',
    category: 'CONFIG' as const,
    defaultName: 'vercel.json',
    description: 'Konfigurasi routing SPA, header keamanan, dan caching Vercel',
    content: `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
`
  },
  {
    id: 'readme',
    label: 'Dokumentasi (README.md)',
    ext: 'md',
    category: 'DOCS' as const,
    defaultName: 'README.md',
    description: 'Dokumentasi panduan proyek pengembang Markdown',
    content: `# Dokumentasi Proyek

Proyek ini menggunakan sistem otomatisasi version control dari **ALINLABS UTILITY (AUTO)**.

## Langkah Menjalankan
1. Pastikan Git telah terpasang di komputer Anda.
2. Jalankan skrip automasi sesuai OS Anda:
   - Windows PowerShell: \`powershell -ExecutionPolicy Bypass -File .\\AUTO-PUSH.ps1\`
   - Windows CMD: \`AUTO-PUSH.cmd\`
   - Linux/macOS: \`chmod +x AUTO-PUSH.sh && ./AUTO-PUSH.sh\`
`
  },
  {
    id: 'blank',
    label: 'Berkas Kosong (Blank)',
    ext: 'txt',
    category: 'CUSTOM' as const,
    defaultName: 'catatan-proyek.txt',
    description: 'Berkas teks kosong untuk catatan atau skrip kustom',
    content: `# Berkas baru dibuat via Alinlabs Auto File Manager
# Dibuat pada: ${new Date().toLocaleDateString('id-ID')}
`
  }
];

export const DEFAULT_PROJECT_FILES: ProjectFile[] = [
  {
    id: 'file-ps1',
    name: 'AUTO-PUSH',
    extension: 'ps1',
    content: '',
    category: 'SCRIPT',
    updatedAt: 'Bawaan Sistem',
    isSystem: true
  },
  {
    id: 'file-cmd',
    name: 'AUTO-PUSH',
    extension: 'cmd',
    content: '',
    category: 'SCRIPT',
    updatedAt: 'Bawaan Sistem',
    isSystem: true
  },
  {
    id: 'file-sh',
    name: 'AUTO-PUSH',
    extension: 'sh',
    content: '',
    category: 'SCRIPT',
    updatedAt: 'Bawaan Sistem',
    isSystem: true
  },
  {
    id: 'file-gitignore',
    name: '.gitignore',
    extension: 'gitignore',
    content: TEMPLATE_PRESETS[3].content,
    category: 'CONFIG',
    updatedAt: 'Template Standar',
    isSystem: true
  },
  {
    id: 'file-gitattributes',
    name: '.gitattributes',
    extension: 'gitattributes',
    content: TEMPLATE_PRESETS[4].content,
    category: 'CONFIG',
    updatedAt: 'Template Standar',
    isSystem: true
  },
  {
    id: 'file-vercel',
    name: 'vercel.json',
    extension: 'json',
    content: TEMPLATE_PRESETS[5].content,
    category: 'CONFIG',
    updatedAt: 'Template Standar',
    isSystem: true
  },
  {
    id: 'file-readme',
    name: 'README.md',
    extension: 'md',
    content: TEMPLATE_PRESETS[6].content,
    category: 'DOCS',
    updatedAt: 'Template Standar',
    isSystem: true
  }
];

interface FileManagerProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (file: ProjectFile) => void;
  onCreateFile: (newFile: Omit<ProjectFile, 'id' | 'updatedAt'>) => void;
  onDeleteFile: (fileId: string) => void;
  onDuplicateFile: (fileId: string) => void;
  onBackToConfig: () => void;
}

export default function FileManager({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onDuplicateFile,
  onBackToConfig
}: FileManagerProps) {
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'SCRIPT' | 'CONFIG' | 'DOCS' | 'CUSTOM'>('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('ps1');
  const [newFileName, setNewFileName] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle template selection change
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = TEMPLATE_PRESETS.find(t => t.id === templateId);
    if (tmpl) {
      setNewFileName(tmpl.defaultName);
      setCustomContent(tmpl.content);
    }
  };

  const handleOpenCreateForm = () => {
    setIsCreating(true);
    handleTemplateChange('ps1');
  };

  const handleExecuteCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const tmpl = TEMPLATE_PRESETS.find(t => t.id === selectedTemplateId) || TEMPLATE_PRESETS[0];
    
    let rawName = newFileName.trim();
    if (!rawName) {
      rawName = tmpl.defaultName;
    }

    let ext = tmpl.ext;
    let baseName = rawName;

    // Detect if extension was explicitly typed in filename
    if (rawName.startsWith('.')) {
      // e.g. .gitignore or .gitattributes
      ext = rawName.substring(1);
      baseName = rawName;
    } else if (rawName.includes('.')) {
      const parts = rawName.split('.');
      ext = parts.pop() || tmpl.ext;
      baseName = parts.join('.');
    }

    onCreateFile({
      name: baseName,
      extension: ext,
      content: customContent || tmpl.content,
      category: tmpl.category
    });

    setIsCreating(false);
    setNewFileName('');
    setCustomContent('');
  };

  const handleDownloadFile = (e: React.MouseEvent, file: ProjectFile) => {
    e.stopPropagation();
    const fullName = file.name.includes('.') 
      ? file.name 
      : `${file.name}${file.extension ? `.${file.extension}` : ''}`;
    
    const blob = new Blob([file.content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fullName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyContent = (e: React.MouseEvent, file: ProjectFile) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.content || '');
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.extension.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (ext: string, category: string) => {
    const clean = ext.toLowerCase();
    if (clean === 'ps1') {
      return <Terminal size={16} className="text-cyan-400" />;
    } else if (clean === 'cmd' || clean === 'bat') {
      return <Terminal size={16} className="text-amber-400" />;
    } else if (clean === 'sh' || clean === 'bash') {
      return <Terminal size={16} className="text-emerald-400" />;
    } else if (clean === 'json') {
      return <FileJson size={16} className="text-yellow-400" />;
    } else if (clean === 'md') {
      return <FileText size={16} className="text-sky-400" />;
    } else if (clean === 'gitignore' || clean === 'gitattributes') {
      return <FileCog size={16} className="text-rose-400" />;
    }
    return <FileCode size={16} className={category === 'SCRIPT' ? 'text-cyan-400' : 'text-slate-400'} />;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Action Bar */}
      <div className={`p-3 sm:p-4 border-b shrink-0 flex flex-col gap-2.5 transition-colors ${
        theme === 'dark' ? 'border-white/5 bg-[#030509]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBackToConfig}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-white/10 bg-white/5 text-white/80 hover:text-[#00f3ff] hover:border-[#00f3ff]/40 hover:bg-white/10'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-sky-700 hover:bg-sky-50'
            }`}
            title="Kembali ke Panel Konfigurasi"
          >
            <SlidersHorizontal size={13} />
            <span>Konfigurasi</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateForm}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#00f3ff] hover:bg-[#00f3ff]/80 text-[#030509] shadow-[0_0_12px_rgba(0,243,255,0.25)]'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
            title="Buat Berkas Baru"
          >
            <Plus size={14} />
            <span>File Baru</span>
          </button>
        </div>

        {/* Search input */}
        <div className={`relative flex items-center rounded-lg border transition-colors ${
          theme === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-[#00f3ff]/50' : 'bg-slate-50 border-slate-200 focus-within:border-sky-500'
        }`}>
          <Search size={14} className={`absolute left-2.5 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berkas atau ekstensi..."
            className={`w-full pl-8 pr-2.5 py-1.5 text-xs outline-none bg-transparent ${
              theme === 'dark' ? 'text-white placeholder-white/30' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`mr-2 p-0.5 rounded ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5 text-[10px]">
          {(['ALL', 'SCRIPT', 'CONFIG', 'DOCS', 'CUSTOM'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 rounded-md font-semibold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? (theme === 'dark'
                      ? 'bg-[#00f3ff]/15 text-[#00f3ff] border border-[#00f3ff]/40'
                      : 'bg-sky-100 text-sky-800 border border-sky-300 font-bold')
                  : (theme === 'dark'
                      ? 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
              }`}
            >
              {cat === 'ALL' ? 'Semua' : cat === 'SCRIPT' ? 'Skrip' : cat === 'CONFIG' ? 'Config' : cat === 'DOCS' ? 'Docs' : 'Kustom'}
            </button>
          ))}
        </div>
      </div>

      {/* Creation Modal/Form (Slide Down) */}
      {isCreating && (
        <form 
          onSubmit={handleExecuteCreate}
          className={`p-3.5 sm:p-4 border-b space-y-3 shrink-0 animate-slideUpFade ${
            theme === 'dark' ? 'bg-[#0a101d] border-[#00f3ff]/30' : 'bg-sky-50/70 border-sky-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold flex items-center gap-1.5 ${
              theme === 'dark' ? 'text-[#00f3ff]' : 'text-sky-800'
            }`}>
              <Sparkles size={14} />
              <span>Buat Berkas Baru</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className={`p-1 rounded ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <X size={14} />
            </button>
          </div>

          {/* Template presets picker */}
          <div className="space-y-1">
            <label className={`text-[10px] font-bold uppercase tracking-wider block ${
              theme === 'dark' ? 'text-white/60' : 'text-slate-600'
            }`}>
              Pilih Jenis Template:
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1">
              {TEMPLATE_PRESETS.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tmpl.id)}
                  className={`p-1.5 rounded-lg text-left border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTemplateId === tmpl.id
                      ? (theme === 'dark' 
                          ? 'border-[#00f3ff] bg-[#00f3ff]/10 text-white font-bold shadow-xs' 
                          : 'border-sky-500 bg-white text-sky-900 font-bold shadow-xs')
                      : (theme === 'dark'
                          ? 'border-white/5 bg-white/5 text-white/70 hover:border-white/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300')
                  }`}
                >
                  <div className="shrink-0">{getFileIcon(tmpl.ext, tmpl.category)}</div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] block truncate">{tmpl.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filename input */}
          <div className="space-y-1">
            <label className={`text-[10px] font-bold uppercase tracking-wider block ${
              theme === 'dark' ? 'text-white/60' : 'text-slate-600'
            }`}>
              Nama Berkas:
            </label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="contoh: backup.sh atau .gitignore"
              className={`w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-black/50 border-white/10 text-white focus:border-[#00f3ff]/50'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-sky-500'
              }`}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#00f3ff] hover:bg-[#00f3ff]/80 text-[#030509]'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              Simpan & Buka
            </button>
          </div>
        </form>
      )}

      {/* Files List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
        {filteredFiles.length === 0 ? (
          <div className={`p-6 text-center rounded-xl border border-dashed my-4 ${
            theme === 'dark' ? 'border-white/10 text-white/40' : 'border-slate-300 text-slate-400'
          }`}>
            <FolderPlus size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">Tidak ada berkas yang cocok</p>
            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="mt-2 text-xs text-[#00f3ff] hover:underline"
            >
              + Buat Berkas Baru
            </button>
          </div>
        ) : (
          filteredFiles.map((file) => {
            const isActive = file.id === activeFileId;
            const fullDisplayName = file.name.includes('.') 
              ? file.name 
              : `${file.name}${file.extension ? `.${file.extension}` : ''}`;

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                  isActive
                    ? (theme === 'dark'
                        ? 'bg-[#00f3ff]/10 border-[#00f3ff]/60 shadow-[0_0_15px_rgba(0,243,255,0.15)]'
                        : 'bg-sky-50 border-sky-400 shadow-sm')
                    : (theme === 'dark'
                        ? 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs')
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isActive
                      ? (theme === 'dark' ? 'bg-[#00f3ff]/20 border-[#00f3ff]/40 text-[#00f3ff]' : 'bg-sky-100 border-sky-300 text-sky-700')
                      : (theme === 'dark' ? 'bg-white/5 border-white/10 text-white/60' : 'bg-slate-100 border-slate-200 text-slate-600')
                  }`}>
                    {getFileIcon(file.extension, file.category)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold truncate font-mono ${
                        isActive
                          ? (theme === 'dark' ? 'text-white' : 'text-sky-950')
                          : (theme === 'dark' ? 'text-white/90' : 'text-slate-800')
                      }`}>
                        {fullDisplayName}
                      </span>
                      {isActive && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                          theme === 'dark' ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'bg-sky-200 text-sky-800'
                        }`}>
                          AKTIF
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                        {file.category}
                      </span>
                      <span className={`text-[10px] ${theme === 'dark' ? 'text-white/20' : 'text-slate-300'}`}>•</span>
                      <span className={`text-[10px] truncate ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                        {file.updatedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* File Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleCopyContent(e, file)}
                    title="Salin isi berkas"
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      theme === 'dark' 
                        ? 'text-white/40 hover:text-white hover:bg-white/10' 
                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {copiedId === file.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownloadFile(e, file)}
                    title="Unduh berkas"
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      theme === 'dark' 
                        ? 'text-white/40 hover:text-white hover:bg-white/10' 
                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <Download size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateFile(file.id);
                    }}
                    title="Duplikasi berkas"
                    className={`p-1.5 rounded-md transition-colors cursor-pointer hidden sm:block ${
                      theme === 'dark' 
                        ? 'text-white/40 hover:text-white hover:bg-white/10' 
                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <FolderPlus size={13} />
                  </button>

                  {!file.isSystem && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                      title="Hapus berkas"
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        theme === 'dark' 
                          ? 'text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10' 
                          : 'text-rose-500/60 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info status footer */}
      <div className={`px-4 py-2.5 border-t text-[11px] flex items-center justify-between ${
        theme === 'dark' ? 'border-white/5 bg-black/20 text-white/40' : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>Tersimpan di Cache</span>
        </span>
        <span className="font-mono">{files.length} Berkas</span>
      </div>
    </div>
  );
}
