import React, { useState, useEffect, lazy, Suspense, memo } from 'react';
import { 
  ChevronRight, 
  FolderPlus, 
  Info,
  Headset, 
  Sun, 
  Moon 
} from 'lucide-react';
import { usePWAInstall } from '../components/usePWAInstall';
import { useTheme } from '../context/ThemeContext';
import { ScriptFileItem, SidebarProps } from './types';
import { DEFAULT_FILES } from './utils';
import AutoView from './auto';
import FileView from './file';

const InfoModal = lazy(() => import('../components/InfoModal'));
const AboutModal = lazy(() => import('../components/AboutModal'));
const InstallModal = lazy(() => import('../components/InstallModal'));
const VercelLfsModal = lazy(() => import('../components/VercelLfsModal'));
const ResetModal = lazy(() => import('../components/ResetModal'));

function SidebarContainerComponent({
  customCommit,
  setCustomCommit,
  isCommitTimeEnabled,
  setIsCommitTimeEnabled,
  scriptMode,
  setScriptMode,
  scriptExtension,
  setScriptExtension,
  gitCommand,
  setGitCommand,
  isRepoMetaEnabled,
  setIsRepoMetaEnabled,
  repoTopics,
  setRepoTopics,
  repoDescription,
  setRepoDescription,
  isReadmeDetectorEnabled,
  setIsReadmeDetectorEnabled,
  readmeDetectorMode,
  setReadmeDetectorMode,
  isReleaseEnabled,
  setIsReleaseEnabled,
  releaseMode,
  setReleaseMode,
  releaseBump,
  setReleaseBump,
  releaseTag,
  setReleaseTag,
  releaseNotes,
  setReleaseNotes,
  autoPath,
  setAutoPath,
  isZipTarget,
  setIsZipTarget,
  autoUsername,
  setAutoUsername,
  autoToken,
  setAutoToken,
  autoRepo,
  setAutoRepo,
  autoBranch,
  setAutoBranch,
  lfsExtensions,
  setLfsExtensions,
  lfsSizeLimit,
  setLfsSizeLimit,
  isCustomBranch,
  setIsCustomBranch,
  isLfsEnabled,
  setIsLfsEnabled,
  lfsLiveInput,
  setLfsLiveInput,
  mobileView,
  setMobileView,
  activeTab,
  setActiveTab,
  sidebarWidth,
  fileName,
  setFileName,
  setScriptContent,
  sidebarView: propSidebarView,
  setSidebarView: propSetSidebarView,
  fileList: propFileList,
  setFileList: propSetFileList,
  activeFileId,
  setActiveFileId
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePWAInstall();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await triggerInstall();
      if (res.outcome === 'unsupported' || res.outcome === 'dismissed') {
        if (res.outcome === 'unsupported') {
          setIsInstallModalOpen(true);
        }
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const handleConfirmReset = () => {
    try {
      localStorage.clear();
      caches.keys().then((names) => {
        for (let name of names) {
          caches.delete(name);
        }
      }).finally(() => {
        window.location.reload();
      });
    } catch {
      window.location.reload();
    }
  };

  // View mode: 'CONFIG' (form konfigurasi) | 'FILES' (daftar berkas yang bisa dipilih)
  const [internalSidebarView, setInternalSidebarView] = useState<'CONFIG' | 'FILES'>(() => {
    return (localStorage.getItem('cyberSidebarView') as 'CONFIG' | 'FILES') || 'CONFIG';
  });
  const sidebarView = propSidebarView ?? internalSidebarView;
  const setSidebarView = propSetSidebarView ?? setInternalSidebarView;

  useEffect(() => {
    localStorage.setItem('cyberSidebarView', sidebarView);
  }, [sidebarView]);

  // List file state with localStorage cache
  const [internalFileList, setInternalFileList] = useState<ScriptFileItem[]>(() => {
    try {
      const cached = localStorage.getItem('cyberScriptFiles');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const userOnly = parsed.filter(f => !f.isDefault && !f.id?.startsWith('default-'));
          return userOnly;
        }
      }
    } catch {}
    return DEFAULT_FILES;
  });
  const fileList = propFileList ?? internalFileList;
  const setFileList = propSetFileList ?? setInternalFileList;

  useEffect(() => {
    localStorage.setItem('cyberScriptFiles', JSON.stringify(fileList));
  }, [fileList]);

  const [cacheSizeStr, setCacheSizeStr] = useState<string>('Menghitung...');

  useEffect(() => {
    async function calculateCacheSize() {
      try {
        let total = 0;
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              total += blob.size;
            }
          }
        }
        
        if (total === 0) {
          if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            if (estimate.usage) {
              total = estimate.usage;
            }
          }
        }
        
        if (total === 0) {
          setCacheSizeStr('0 B');
          return;
        }
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(total) / Math.log(k));
        setCacheSizeStr(parseFloat((total / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]);
      } catch (e) {
        setCacheSizeStr('-');
      }
    }
    calculateCacheSize();
  }, []);

  const handleSelectFile = (file: ScriptFileItem) => {
    setActiveFileId?.(file.id);
    setFileName?.(file.name);
    setScriptExtension(file.extension as any);
    setScriptMode?.(file.mode);
    if (file.gitCommand !== undefined) {
      setGitCommand?.(file.gitCommand);
    }
    if (file.customCommit !== undefined) {
      setCustomCommit(file.customCommit);
    }
    if (file.lfsExtensions !== undefined) {
      setLfsExtensions(file.lfsExtensions);
    }
    if (file.lfsSizeLimit !== undefined) {
      setLfsSizeLimit(file.lfsSizeLimit);
    }
    if (setScriptContent) {
      setScriptContent(file.content !== undefined ? file.content : '');
    }
    try {
      localStorage.setItem('cyberActiveFileId', file.id);
    } catch {}
  };

  const handleCreateNewFile = () => {
    const nextNum = fileList.length + 1;
    const newFile: ScriptFileItem = {
      id: 'file-' + Date.now(),
      name: `Untitled-${nextNum}`,
      extension: '',
      mode: 'AUTO',
      description: 'Berkas kustom',
      createdAt: new Date().toISOString().split('T')[0],
      isDefault: false,
      content: '',
    };

    setFileList((prev) => {
      const updated = [newFile, ...prev];
      try {
        localStorage.setItem('cyberScriptFiles', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    handleSelectFile(newFile);
  };

  return (
    <aside 
      id="auto-sidebar-aside"
      style={sidebarWidth ? ({ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties) : undefined}
      className={`@container w-full lg:w-[var(--sidebar-w,24rem)] flex-col shrink-0 h-full overflow-hidden gpu-accelerate contain-paint transition-colors duration-250 border-b lg:border-b-0 lg:border-r-0 ${
      mobileView === 'KONFIGURASI' ? 'flex' : 'hidden'
    } lg:flex ${
      theme === 'dark' ? 'border-white/5 bg-[#030509]' : 'border-slate-200 bg-white'
    }`}>
      {/* Brand Header: Logo & Title (Aligned with FolderPlus Action) */}
      <div className={`h-16 shrink-0 border-b flex items-center justify-between px-3 sm:px-4 transition-colors ${
        theme === 'dark' ? 'border-white/5 bg-[#030509]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img 
            src={theme === 'dark' ? '/gambar/logo-cyan.webp' : '/gambar/logo-biru.webp'} 
            alt="Alinlabs Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 object-contain shadow-xs transition-opacity duration-200" 
          />
          <div className="min-w-0">
            <h1 className={`text-xs sm:text-sm font-bold truncate ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              ALINLABS UTILITY
            </h1>
            <p className={`text-[10px] sm:text-xs tracking-tight truncate ${
              theme === 'dark' ? 'text-white/50' : 'text-slate-500'
            }`}>
              Technology Operations
            </p>
          </div>
        </div>

        {/* Right side of sidebar header: FolderPlus Button & Mobile Workspace Shortcut */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Tombol Icon Folder Baru / Dir Plus (FolderPlus) */}
          <button
            type="button"
            onClick={() => {
              const nextView = sidebarView === 'FILES' ? 'CONFIG' : 'FILES';
              setSidebarView(nextView);
              if (nextView === 'CONFIG') {
                setFileName?.('AUTO-PUSH');
                setActiveFileId?.('');
                try {
                  localStorage.setItem('cyberFileName', 'AUTO-PUSH');
                  localStorage.removeItem('cyberActiveFileId');
                } catch {}
              } else if (nextView === 'FILES') {
                setActiveFileId?.('');
                try {
                  localStorage.removeItem('cyberActiveFileId');
                } catch {}
              }
            }}
            title={sidebarView === 'FILES' ? "Beralih ke Form Konfigurasi Parameter (AUTO-PUSH)" : "Buka Daftar Berkas & Buat File Baru"}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative shrink-0 ${
              sidebarView === 'FILES'
                ? (theme === 'dark'
                    ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff] shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                    : 'bg-sky-100 text-sky-700 border-sky-400 shadow-sm')
                : (theme === 'dark'
                    ? 'bg-white/5 text-white/80 border-white/10 hover:border-[#00f3ff]/60 hover:text-[#00f3ff] hover:bg-white/10'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300 hover:text-sky-600 hover:bg-slate-100 shadow-xs')
            }`}
            aria-label="Daftar Berkas dan Buat File Baru"
          >
            <FolderPlus size={18} className="transition-transform active:scale-90" />
            <span className={`absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full border leading-tight ${
              theme === 'dark'
                ? 'bg-[#030509] text-[#00f3ff] border-[#00f3ff]/50'
                : 'bg-white text-sky-700 border-sky-300 shadow-xs'
            }`}>
              {fileList.length}
            </span>
          </button>

          {/* Mobile workspace shortcut */}
          {setMobileView && (
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileView('WORKSPACE')}
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-[#00f3ff]/30 bg-[#00f3ff]/10 text-[#00f3ff] hover:bg-[#00f3ff]/20'
                    : 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                <span>Code</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Content: Files List Manager vs Generator Config Form */}
      {sidebarView === 'FILES' ? (
        <FileView
          fileList={fileList}
          setFileList={setFileList}
          activeFileId={activeFileId}
          activeFileName={fileName}
          activeExtension={scriptExtension}
          activeMode={scriptMode}
          onCreateNewFile={handleCreateNewFile}
          onSelectFile={handleSelectFile}
          onBackToConfig={() => {
            setSidebarView('CONFIG');
            setFileName?.('AUTO-PUSH');
            setActiveFileId?.('');
            try {
              localStorage.setItem('cyberFileName', 'AUTO-PUSH');
              localStorage.removeItem('cyberActiveFileId');
            } catch {}
          }}
        />
      ) : (
        <AutoView
          scriptExtension={scriptExtension}
          setScriptExtension={setScriptExtension}
          gitCommand={gitCommand}
          setGitCommand={setGitCommand}
          isRepoMetaEnabled={isRepoMetaEnabled}
          setIsRepoMetaEnabled={setIsRepoMetaEnabled}
          repoTopics={repoTopics}
          setRepoTopics={setRepoTopics}
          repoDescription={repoDescription}
          setRepoDescription={setRepoDescription}
          isReadmeDetectorEnabled={isReadmeDetectorEnabled}
          setIsReadmeDetectorEnabled={setIsReadmeDetectorEnabled}
          readmeDetectorMode={readmeDetectorMode}
          setReadmeDetectorMode={setReadmeDetectorMode}
          isReleaseEnabled={isReleaseEnabled}
          setIsReleaseEnabled={setIsReleaseEnabled}
          releaseMode={releaseMode}
          setReleaseMode={setReleaseMode}
          releaseBump={releaseBump}
          setReleaseBump={setReleaseBump}
          releaseTag={releaseTag}
          setReleaseTag={setReleaseTag}
          releaseNotes={releaseNotes}
          setReleaseNotes={setReleaseNotes}
          autoPath={autoPath}
          setAutoPath={setAutoPath}
          isZipTarget={isZipTarget}
          setIsZipTarget={setIsZipTarget}
          autoUsername={autoUsername}
          setAutoUsername={setAutoUsername}
          autoToken={autoToken}
          setAutoToken={setAutoToken}
          autoRepo={autoRepo}
          setAutoRepo={setAutoRepo}
          autoBranch={autoBranch}
          setAutoBranch={setAutoBranch}
          customCommit={customCommit}
          setCustomCommit={setCustomCommit}
          isCommitTimeEnabled={isCommitTimeEnabled}
          setIsCommitTimeEnabled={setIsCommitTimeEnabled}
          lfsExtensions={lfsExtensions}
          setLfsExtensions={setLfsExtensions}
          lfsSizeLimit={lfsSizeLimit}
          setLfsSizeLimit={setLfsSizeLimit}
          isCustomBranch={isCustomBranch}
          setIsCustomBranch={setIsCustomBranch}
          isLfsEnabled={isLfsEnabled}
          setIsLfsEnabled={setIsLfsEnabled}
          lfsLiveInput={lfsLiveInput}
          setLfsLiveInput={setLfsLiveInput}
          onOpenVercelModal={() => setIsVercelModalOpen(true)}
        />
      )}

      {/* Sticky Bottom Footer (Sidebar Only) */}
      <div className={`h-14 shrink-0 border-t px-3 sm:px-4 flex items-center gap-2 transition-colors ${
        theme === 'dark' 
          ? 'border-white/10 bg-[#030509]' 
          : 'border-slate-200 bg-white'
      }`}>
        {/* Tombol Kiri: Reset atau Buat Berkas Baru */}
        {sidebarView === 'FILES' ? (
          <button 
            type="button"
            onClick={handleCreateNewFile}
            className={`flex-1 h-8 flex items-center justify-center px-1.5 @[340px]:px-3 rounded-lg font-bold text-[9px] leading-[10px] tracking-tight @[340px]:text-xs @[340px]:leading-normal @[340px]:tracking-wider uppercase transition-all active:scale-[0.98] cursor-pointer text-center bg-transparent border ${
              theme === 'dark'
                ? 'border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff]/10 hover:shadow-[0_0_12px_rgba(0,243,255,0.2)]'
                : 'border-sky-600 text-sky-700 hover:bg-sky-50'
            }`}
            title="Tambah berkas baru langsung ke library"
          >
            BUAT BERKAS BARU
          </button>
        ) : (
          <button 
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="flex-1 h-8 flex items-center justify-center px-3 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] cursor-pointer text-center"
            title={`Reset cache sistem (${cacheSizeStr}) dan muat ulang aplikasi`}
          >
            RESET
          </button>
        )}

        {/* Card Tombol Instal App (Teks 2 line kecil di samping kiri icon 'i') */}
        <button
          type="button"
          onClick={handleInstallClick}
          className={`h-8 px-2 rounded-lg border flex flex-col items-center justify-center text-center cursor-pointer shrink-0 transition-all select-none active:scale-95 ${
            isInstallModalOpen
              ? (theme === 'dark'
                  ? 'border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff]'
                  : 'border-sky-500 bg-sky-50 text-sky-600')
              : (theme === 'dark'
                  ? 'border-white/10 bg-white/5 text-white/90 hover:text-[#00f3ff] hover:border-[#00f3ff]/40 hover:bg-white/10'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-slate-100 shadow-sm')
          }`}
          title="Instal AUTO sebagai Aplikasi PWA"
          aria-label="Instal Aplikasi PWA"
        >
          <span className="text-[9px] font-bold leading-[10px] tracking-tight">Instal</span>
          <span className="text-[9px] font-bold leading-[10px] tracking-tight">App</span>
        </button>

        {/* Tombol Informasi Web & Pencipta (Icon 'i' di samping kiri icon call center) */}
        <button 
          type="button"
          onClick={() => setIsAboutModalOpen(true)}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isAboutModalOpen
              ? (theme === 'dark' 
                  ? 'border-[#00f3ff] bg-transparent text-[#00f3ff]' 
                  : 'border-sky-500 bg-transparent text-sky-600')
              : (theme === 'dark' 
                  ? 'border-white/10 bg-white/5 text-white hover:text-[#00f3ff] hover:border-[#00f3ff]/40' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-sky-600 hover:border-sky-300 shadow-sm')
          }`}
          title="Tentang AUTO & Pengembang"
          aria-label="Tentang AUTO & Pengembang"
        >
          <Info size={16} />
        </button>

        {/* Tombol Tatacara & Bantuan (Call Center / Support) */}
        <button 
          type="button"
          onClick={() => setIsInfoModalOpen(true)}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isInfoModalOpen
              ? (theme === 'dark' 
                  ? 'border-[#00f3ff] bg-transparent text-[#00f3ff]' 
                  : 'border-sky-500 bg-transparent text-sky-600')
              : (theme === 'dark' 
                  ? 'border-white/10 bg-white/5 text-white hover:text-[#00f3ff] hover:border-[#00f3ff]/40' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-sky-600 hover:border-sky-300 shadow-sm')
          }`}
          title="Tatacara & Bantuan"
          aria-label="Tatacara & Bantuan"
        >
          <Headset size={16} />
        </button>

        {/* Tema */}
        <button 
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? "Beralih ke Tema Terang (Light Mode)" : "Beralih ke Tema Gelap (Dark Mode)"}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            theme === 'dark' 
              ? 'border-white/10 bg-white/5 text-white hover:text-white/80 hover:bg-white/10 hover:border-white/30 active:scale-95' 
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 active:scale-95 shadow-sm'
          }`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun size={16} className="text-white transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon size={16} className="transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>
      </div>

      <Suspense fallback={null}>
        {isInstallModalOpen && (
          <InstallModal 
            isOpen={isInstallModalOpen} 
            onClose={() => setIsInstallModalOpen(false)} 
            isInstalled={isInstalled}
            isIOS={isIOS}
            onTryDirectInstall={triggerInstall}
          />
        )}
        {isAboutModalOpen && (
          <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
        )}
        {isInfoModalOpen && (
          <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
        )}
        {isVercelModalOpen && (
          <VercelLfsModal isOpen={isVercelModalOpen} onClose={() => setIsVercelModalOpen(false)} />
        )}
        {isResetModalOpen && (
          <ResetModal 
            isOpen={isResetModalOpen} 
            onClose={() => setIsResetModalOpen(false)} 
            onConfirmReset={handleConfirmReset} 
            cacheSizeStr={cacheSizeStr} 
          />
        )}
      </Suspense>
    </aside>
  );
}

const SidebarContainer = memo(SidebarContainerComponent);
export default SidebarContainer;

