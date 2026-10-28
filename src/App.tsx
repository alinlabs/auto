import React, { useState, useEffect, useCallback, useMemo, useRef, useTransition } from 'react';
import Sidebar from './sidebar/Sidebar';
import CodeArea from './code-area/CodeArea';
import Footer from './components/Footer';
import SidebarResizer from './components/SidebarResizer';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ScriptExtension } from './components/OsCombobox';
import { GitCommandMode } from './components/GitCommandCombobox';
import { ReleaseMode, ReleaseBumpType } from './sidebar/components/GitReleaseSection';
import { ScriptFileItem } from './sidebar/types';
import { DEFAULT_FILES } from './sidebar/utils';
import { generateScriptText } from './utils/scriptGenerator';
import { useSidebarResize } from './hooks/useSidebarResize';

function MainApp() {
  const { theme } = useTheme();

  const [folderPath, setFolderPath] = useState(() => {
    return localStorage.getItem('cyberFolderPath') || '';
  });

  const [fileName, setFileName] = useState(() => {
    const initialSidebarView = (localStorage.getItem('cyberSidebarView') as 'CONFIG' | 'FILES') || 'CONFIG';
    if (initialSidebarView === 'CONFIG') {
      return 'AUTO-PUSH';
    }
    const cached = localStorage.getItem('cyberFileName');
    if (!cached || cached === 'auto' || cached === 'cyber-push' || cached.toLowerCase() === 'auto') {
      return 'AUTO-PUSH';
    }
    return cached;
  });

  const [customCommit, setCustomCommit] = useState(() => {
    return localStorage.getItem('cyberCustomCommit') || '';
  });
  const [isCommitTimeEnabled, setIsCommitTimeEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyberIsCommitTimeEnabled');
    if (saved !== null) return saved === 'true';
    return false; // Default: Tidak Aktif
  });

  const [scriptMode, setScriptMode] = useState<'MANUAL' | 'AUTO'>('AUTO');
  const [scriptExtension, setScriptExtension] = useState<ScriptExtension>(() => {
    const cached = localStorage.getItem('cyberScriptExtension');
    if (cached === 'ps1' || cached === 'cmd' || cached === 'sh') {
      return cached;
    }
    return 'ps1'; // Default: Power Shell (.ps1)
  });
  const [gitCommand, setGitCommand] = useState<GitCommandMode>(() => {
    const cached = localStorage.getItem('cyberGitCommand');
    if (cached === 'FORCE_PUSH' || cached === 'PARTIAL_UPDATE') {
      return cached;
    }
    return 'FORCE_PUSH'; // Default: Force Push
  });
  
  const [autoPath, setAutoPath] = useState(() => localStorage.getItem('cyberAutoPath') || '');
  const [isZipTarget, setIsZipTarget] = useState<boolean>(() => {
    return localStorage.getItem('cyberIsZipTarget') === 'true';
  });
  const [autoUsername, setAutoUsername] = useState(() => localStorage.getItem('cyberAutoUsername') || '');
  const [autoToken, setAutoToken] = useState(() => localStorage.getItem('cyberAutoToken') || '');
  const [autoRepo, setAutoRepo] = useState(() => localStorage.getItem('cyberAutoRepo') || '');
  const [isCustomBranch, setIsCustomBranch] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyberIsCustomBranch');
    if (saved !== null) return saved === 'true';
    return false; // Default: Tidak Aktif
  });
  const [autoBranch, setAutoBranch] = useState(() => {
    const isCustom = localStorage.getItem('cyberIsCustomBranch') === 'true';
    if (!isCustom) return 'main'; // Default branch: main
    const cached = localStorage.getItem('cyberAutoBranch');
    if (!cached) return 'main';
    return cached;
  });
  const [lfsExtensions, setLfsExtensions] = useState(() => localStorage.getItem('cyberLfsExtensions') || '');
  const [lfsLiveInput, setLfsLiveInput] = useState('');
  const [lfsSizeLimit, setLfsSizeLimit] = useState(() => localStorage.getItem('cyberLfsSizeLimit') || '');
  const [isLfsEnabled, setIsLfsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyberIsLfsEnabled');
    if (saved !== null) return saved === 'true';
    return false; // Default: Tidak Aktif
  });
  const [isRepoMetaEnabled, setIsRepoMetaEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyberIsRepoMetaEnabled');
    if (saved !== null) return saved === 'true';
    return false; // Default: Tidak Aktif
  });
  const [repoTopics, setRepoTopics] = useState(() => localStorage.getItem('cyberRepoTopics') || '');
  const [repoDescription, setRepoDescription] = useState(() => (localStorage.getItem('cyberRepoDescription') || '').slice(0, 350));
  const [isReadmeDetectorEnabled, setIsReadmeDetectorEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyberIsReadmeDetectorEnabled');
    if (saved !== null) return saved === 'true';
    return true; // Default: Aktif
  });
  const [readmeDetectorMode, setReadmeDetectorMode] = useState<'AUTO' | 'MANUAL'>(() => {
    const saved = localStorage.getItem('cyberReadmeDetectorMode');
    return saved === 'MANUAL' ? 'MANUAL' : 'AUTO'; // Default: Tab Auto Change
  });
  const [isReleaseEnabled, setIsReleaseEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyberIsReleaseEnabled');
    if (saved !== null) return saved === 'true';
    return true; // Default: Aktif
  });
  const [releaseMode, setReleaseMode] = useState<ReleaseMode>(() => {
    const saved = localStorage.getItem('cyberReleaseMode');
    return saved === 'MANUAL' ? 'MANUAL' : 'AUTO'; // Default: Tab Auto Versi
  });
  const [releaseBump, setReleaseBump] = useState<ReleaseBumpType>(() => {
    const saved = localStorage.getItem('cyberReleaseBump');
    if (saved === 'minor' || saved === 'major') return saved;
    return 'patch';
  });
  const [releaseTag, setReleaseTag] = useState(() => localStorage.getItem('cyberReleaseTag') || '');
  const [releaseNotes, setReleaseNotes] = useState(() => localStorage.getItem('cyberReleaseNotes') || '');
  const [activeTab, setActiveTab] = useState<'CODE' | 'SIMULATOR'>('CODE');
  const [isInfoBannerOpen, setIsInfoBannerOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'KONFIGURASI' | 'WORKSPACE'>('KONFIGURASI');

  // Sidebar view ('CONFIG' | 'FILES') and cached files
  const [sidebarView, setSidebarView] = useState<'CONFIG' | 'FILES'>(() => {
    return (localStorage.getItem('cyberSidebarView') as 'CONFIG' | 'FILES') || 'CONFIG';
  });

  const [fileList, setFileList] = useState<ScriptFileItem[]>(() => {
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

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    const cached = localStorage.getItem('cyberActiveFileId') || '';
    if (cached.startsWith('default-')) return '';
    return cached;
  });

  useEffect(() => {
    localStorage.setItem('cyberActiveFileId', activeFileId);
  }, [activeFileId]);

  useEffect(() => {
    localStorage.setItem('cyberSidebarView', sidebarView);
  }, [sidebarView]);

  useEffect(() => {
    localStorage.setItem('cyberScriptFiles', JSON.stringify(fileList));
  }, [fileList]);

  const {
    sidebarWidth,
    widthRef,
    rafIdRef,
    applyWidthToDom,
    updateSidebarWidth
  } = useSidebarResize();

  const handleScriptModeChange = (mode: 'MANUAL' | 'AUTO') => {
    setScriptMode(mode);
    setActiveTab('CODE');
  };

  // Smart Cache: Debounced saving to localStorage to optimize performance and reduce heavy writes
  useEffect(() => {
    const cacheTimer = setTimeout(() => {
      localStorage.setItem('cyberFolderPath', folderPath);
      localStorage.setItem('cyberFileName', fileName);
      localStorage.setItem('cyberCustomCommit', customCommit);
      localStorage.setItem('cyberScriptMode', scriptMode);
      localStorage.setItem('cyberScriptExtension', scriptExtension);
      localStorage.setItem('cyberGitCommand', gitCommand);
      localStorage.setItem('cyberAutoPath', autoPath);
      localStorage.setItem('cyberIsZipTarget', String(isZipTarget));
      localStorage.setItem('cyberAutoUsername', autoUsername);
      localStorage.setItem('cyberAutoToken', autoToken);
      localStorage.setItem('cyberAutoRepo', autoRepo);
      localStorage.setItem('cyberAutoBranch', autoBranch);
      localStorage.setItem('cyberLfsExtensions', lfsExtensions);
      localStorage.setItem('cyberLfsSizeLimit', lfsSizeLimit);
      localStorage.setItem('cyberIsRepoMetaEnabled', String(isRepoMetaEnabled));
      localStorage.setItem('cyberRepoTopics', repoTopics);
      localStorage.setItem('cyberRepoDescription', repoDescription);
      localStorage.setItem('cyberIsReadmeDetectorEnabled', String(isReadmeDetectorEnabled));
      localStorage.setItem('cyberReadmeDetectorMode', readmeDetectorMode);
      localStorage.setItem('cyberIsReleaseEnabled', String(isReleaseEnabled));
      localStorage.setItem('cyberReleaseMode', releaseMode);
      localStorage.setItem('cyberReleaseBump', releaseBump);
      localStorage.setItem('cyberReleaseTag', releaseTag);
      localStorage.setItem('cyberReleaseNotes', releaseNotes);
      localStorage.setItem('cyberIsCommitTimeEnabled', String(isCommitTimeEnabled));
    }, 800); // 800ms debounce
    return () => clearTimeout(cacheTimer);
  }, [folderPath, fileName, customCommit, isCommitTimeEnabled, scriptMode, scriptExtension, gitCommand, autoPath, isZipTarget, autoUsername, autoToken, autoRepo, autoBranch, lfsExtensions, lfsSizeLimit, isRepoMetaEnabled, repoTopics, repoDescription, isReadmeDetectorEnabled, readmeDetectorMode, isReleaseEnabled, releaseMode, releaseBump, releaseTag, releaseNotes]);

  const [fileScriptContent, setFileScriptContent] = useState<string>('');
  const [isGenerated, setIsGenerated] = useState(false);
  const isFirstRenderRef = useRef(true);

  const buildCurrentScript = useCallback(
    (extOverride?: ScriptExtension) =>
      generateScriptText(
        'AUTO',
        extOverride !== undefined ? extOverride : scriptExtension,
        customCommit,
        autoPath,
        autoUsername,
        autoToken,
        autoRepo,
        autoBranch,
        lfsExtensions,
        lfsSizeLimit,
        isCustomBranch,
        isLfsEnabled,
        lfsLiveInput,
        gitCommand,
        isReleaseEnabled,
        releaseMode,
        releaseBump,
        releaseTag,
        releaseNotes,
        isCommitTimeEnabled,
        isRepoMetaEnabled,
        repoTopics,
        repoDescription,
        isReadmeDetectorEnabled,
        readmeDetectorMode
      ),
    [
      scriptExtension,
      gitCommand,
      customCommit,
      isCommitTimeEnabled,
      autoPath,
      isZipTarget,
      autoUsername,
      autoToken,
      autoRepo,
      autoBranch,
      isCustomBranch,
      isLfsEnabled,
      lfsExtensions,
      lfsLiveInput,
      lfsSizeLimit,
      isRepoMetaEnabled,
      repoTopics,
      repoDescription,
      isReadmeDetectorEnabled,
      readmeDetectorMode,
      isReleaseEnabled,
      releaseMode,
      releaseBump,
      releaseTag,
      releaseNotes
    ]
  );

  const [syncedConfigScript, setSyncedConfigScript] = useState<string>(() =>
    generateScriptText(
      'AUTO',
      scriptExtension,
      customCommit,
      autoPath,
      autoUsername,
      autoToken,
      autoRepo,
      autoBranch,
      lfsExtensions,
      lfsSizeLimit,
      isCustomBranch,
      isLfsEnabled,
      lfsLiveInput,
      gitCommand,
      isReleaseEnabled,
      releaseMode,
      releaseBump,
      releaseTag,
      releaseNotes,
      isCommitTimeEnabled,
      isRepoMetaEnabled,
      repoTopics,
      repoDescription,
      isReadmeDetectorEnabled,
      readmeDetectorMode
    )
  );

  // Setiap kali ada teks atau opsi di sidebar yang diubah, jeda render kode (tampilkan card hitam)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setIsGenerated(false);
  }, [
    scriptExtension,
    gitCommand,
    customCommit,
    isCommitTimeEnabled,
    autoPath,
    isZipTarget,
    autoUsername,
    autoToken,
    autoRepo,
    autoBranch,
    isCustomBranch,
    isLfsEnabled,
    lfsExtensions,
    lfsLiveInput,
    lfsSizeLimit,
    isRepoMetaEnabled,
    repoTopics,
    repoDescription,
    isReadmeDetectorEnabled,
    readmeDetectorMode,
    isReleaseEnabled,
    releaseMode,
    releaseBump,
    releaseTag,
    releaseNotes
  ]);

  const generatedScript = sidebarView === 'FILES' ? fileScriptContent : syncedConfigScript;

  const setGeneratedScript = useCallback(
    (val: string) => {
      if (sidebarView === 'FILES') {
        setFileScriptContent(val);
      } else {
        setSyncedConfigScript(val);
      }
    },
    [sidebarView]
  );

  // Simpan ekstensi skrip auto-push yang dipilih di sidebar agar diingat
  useEffect(() => {
    if (scriptExtension === 'ps1' || scriptExtension === 'cmd' || scriptExtension === 'sh') {
      localStorage.setItem('cyberAutoScriptExtension', scriptExtension);
    }
  }, [scriptExtension]);

  const handleGenerateCode = useCallback(
    (forcedExt?: ScriptExtension) => {
      const validExt =
        typeof forcedExt === 'string' && (forcedExt === 'ps1' || forcedExt === 'cmd' || forcedExt === 'sh')
          ? forcedExt
          : undefined;
      if (validExt !== undefined && validExt !== scriptExtension) {
        setScriptExtension(validExt);
      }
      setSyncedConfigScript(buildCurrentScript(validExt));
      setIsGenerated(true);
    },
    [scriptExtension, buildCurrentScript]
  );

  const handleSelectFile = useCallback((file: ScriptFileItem) => {
    setActiveFileId(file.id);
    setFileName(file.name);
    setScriptExtension(file.extension as any);
    setScriptMode(file.mode);
    if (file.gitCommand !== undefined) {
      setGitCommand(file.gitCommand);
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
    const content = file.content !== undefined ? file.content : '';
    setFileScriptContent(content);
    try {
      localStorage.setItem('cyberActiveFileId', file.id);
      localStorage.setItem('cyberFileName', file.name);
    } catch {}
  }, []);

  const handleCreateNewFile = useCallback(() => {
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
  }, [fileList.length, handleSelectFile]);

  // Ketika menutup list file dan kembali ke mode CONFIG (Auto-Push):
  // 1. Nama file di header otomatis kembali ke default "AUTO-PUSH"
  // 2. Unbind activeFileId
  // 3. Pastikan ekstensi file tetap sesuai yang dipilih di sidebar (ps1 / cmd / sh)
  useEffect(() => {
    if (sidebarView === 'CONFIG') {
      setFileName('AUTO-PUSH');
      setActiveFileId('');
      try {
        localStorage.setItem('cyberFileName', 'AUTO-PUSH');
        localStorage.removeItem('cyberActiveFileId');
      } catch {}

      if (scriptExtension !== 'ps1' && scriptExtension !== 'cmd' && scriptExtension !== 'sh') {
        const cached = localStorage.getItem('cyberAutoScriptExtension');
        const targetExt = (cached === 'ps1' || cached === 'cmd' || cached === 'sh') ? (cached as ScriptExtension) : 'ps1';
        setScriptExtension(targetExt);
      }
    } else if (sidebarView === 'FILES') {
      setActiveFileId('');
      try {
        localStorage.removeItem('cyberActiveFileId');
      } catch {}
    }
  }, [sidebarView]);

  const [, startTransition] = useTransition();

  const handleCustomCommitChange = useCallback((val: string) => {
    startTransition(() => setCustomCommit(val));
  }, []);
  const handleAutoPathChange = useCallback((val: string) => {
    startTransition(() => setAutoPath(val));
  }, []);
  const handleAutoUsernameChange = useCallback((val: string) => {
    startTransition(() => setAutoUsername(val));
  }, []);
  const handleAutoTokenChange = useCallback((val: string) => {
    startTransition(() => setAutoToken(val));
  }, []);
  const handleAutoRepoChange = useCallback((val: string) => {
    startTransition(() => setAutoRepo(val));
  }, []);
  const handleAutoBranchChange = useCallback((val: string) => {
    startTransition(() => setAutoBranch(val));
  }, []);
  const handleLfsExtensionsChange = useCallback((val: string) => {
    startTransition(() => setLfsExtensions(val));
  }, []);
  const handleLfsSizeLimitChange = useCallback((val: string) => {
    startTransition(() => setLfsSizeLimit(val));
  }, []);
  const handleRepoTopicsChange = useCallback((val: string) => {
    startTransition(() => setRepoTopics(val));
  }, []);
  const handleRepoDescriptionChange = useCallback((val: string) => {
    startTransition(() => setRepoDescription(val));
  }, []);
  const handleReleaseTagChange = useCallback((val: string) => {
    startTransition(() => setReleaseTag(val));
  }, []);
  const handleReleaseNotesChange = useCallback((val: string) => {
    startTransition(() => setReleaseNotes(val));
  }, []);
  const handleGitCommandChange = useCallback((val: GitCommandMode) => {
    startTransition(() => setGitCommand(val));
  }, []);
  const handleScriptExtensionChange = useCallback((val: ScriptExtension) => {
    startTransition(() => setScriptExtension(val));
  }, []);

  return (
    <div className={`h-screen w-screen font-sans flex flex-col lg:flex-row overflow-hidden selection:bg-[#00f3ff]/30 transition-colors duration-250 ${
      theme === 'dark' ? 'bg-[#030509] text-[#e2e8f0]' : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      {/* Left: Full Height Sidebar */}
      <Sidebar 
        fileName={fileName}
        setFileName={setFileName}
        customCommit={customCommit} 
        setCustomCommit={handleCustomCommitChange}
        isCommitTimeEnabled={isCommitTimeEnabled}
        setIsCommitTimeEnabled={setIsCommitTimeEnabled}
        scriptMode={scriptMode}
        setScriptMode={handleScriptModeChange}
        scriptExtension={scriptExtension}
        setScriptExtension={handleScriptExtensionChange}
        gitCommand={gitCommand}
        setGitCommand={handleGitCommandChange}
        isRepoMetaEnabled={isRepoMetaEnabled}
        setIsRepoMetaEnabled={setIsRepoMetaEnabled}
        repoTopics={repoTopics}
        setRepoTopics={handleRepoTopicsChange}
        repoDescription={repoDescription}
        setRepoDescription={handleRepoDescriptionChange}
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
        setReleaseTag={handleReleaseTagChange}
        releaseNotes={releaseNotes}
        setReleaseNotes={handleReleaseNotesChange}
        autoPath={autoPath} setAutoPath={handleAutoPathChange}
        isZipTarget={isZipTarget} setIsZipTarget={setIsZipTarget}
        autoUsername={autoUsername} setAutoUsername={handleAutoUsernameChange}
        autoToken={autoToken} setAutoToken={handleAutoTokenChange}
        autoRepo={autoRepo} setAutoRepo={handleAutoRepoChange}
        autoBranch={autoBranch} setAutoBranch={handleAutoBranchChange}
        lfsExtensions={lfsExtensions} setLfsExtensions={handleLfsExtensionsChange}
        lfsSizeLimit={lfsSizeLimit} setLfsSizeLimit={handleLfsSizeLimitChange}
        isCustomBranch={isCustomBranch} setIsCustomBranch={setIsCustomBranch}
        isLfsEnabled={isLfsEnabled} setIsLfsEnabled={setIsLfsEnabled}
        lfsLiveInput={lfsLiveInput} setLfsLiveInput={setLfsLiveInput}
        mobileView={mobileView}
        setMobileView={setMobileView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarWidth={sidebarWidth}
        setScriptContent={setGeneratedScript}
        sidebarView={sidebarView}
        setSidebarView={setSidebarView}
        fileList={fileList}
        setFileList={setFileList}
        activeFileId={activeFileId}
        setActiveFileId={setActiveFileId}
      />

      {/* Draggable Resizer Bar between Sidebar and Code Area (Desktop) */}
      <SidebarResizer
        sidebarWidth={sidebarWidth}
        widthRef={widthRef}
        rafIdRef={rafIdRef}
        applyWidthToDom={applyWidthToDom}
        updateSidebarWidth={updateSidebarWidth}
      />

      {/* Right Column: Workspace (CodeArea) and Footer */}
      <div className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10 ${
        mobileView === 'WORKSPACE' ? 'flex' : 'hidden lg:flex'
      }`}>
        {/* Main Workspace Area with integrated header bar */}
        <main className={`flex-1 flex flex-col overflow-hidden relative min-h-0 transition-colors duration-250 ${
          theme === 'dark' ? 'bg-[#030509]' : 'bg-[#f8fafc]'
        }`}>
          <CodeArea 
            folderPath={folderPath}
            setFolderPath={setFolderPath}
            fileName={fileName} 
            setFileName={setFileName}
            scriptContent={generatedScript} 
            setScriptContent={setGeneratedScript}
            customCommit={customCommit} 
            isCommitTimeEnabled={isCommitTimeEnabled}
            scriptMode={scriptMode}
            scriptExtension={scriptExtension}
            setScriptExtension={setScriptExtension}
            gitCommand={gitCommand}
            isRepoMetaEnabled={isRepoMetaEnabled}
            repoTopics={repoTopics}
            repoDescription={repoDescription}
            isReadmeDetectorEnabled={isReadmeDetectorEnabled}
            readmeDetectorMode={readmeDetectorMode}
            isReleaseEnabled={isReleaseEnabled}
            releaseMode={releaseMode}
            releaseBump={releaseBump}
            releaseTag={releaseTag}
            autoPath={autoPath}
            autoUsername={autoUsername}
            autoToken={autoToken}
            autoRepo={autoRepo}
            autoBranch={autoBranch}
            lfsExtensions={lfsExtensions}
            lfsSizeLimit={lfsSizeLimit}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mobileView={mobileView}
            setMobileView={setMobileView}
            isGenerated={isGenerated}
            onGenerate={handleGenerateCode}
            isInfoBannerOpen={isInfoBannerOpen}
            setIsInfoBannerOpen={setIsInfoBannerOpen}
            sidebarView={sidebarView}
            fileList={fileList}
            setFileList={setFileList}
            activeFileId={activeFileId}
            setActiveFileId={setActiveFileId}
            onSelectFile={handleSelectFile}
            onCreateNewFile={handleCreateNewFile}
          />
        </main>

        {!(sidebarView === 'FILES' && !activeFileId) && !(sidebarView === 'CONFIG' && !isGenerated) && (
          <Footer 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            isInfoBannerOpen={isInfoBannerOpen}
            setIsInfoBannerOpen={setIsInfoBannerOpen}
            scriptContent={generatedScript} 
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
