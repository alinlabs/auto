import React, { useState, useRef, useEffect, useMemo, useCallback, memo, lazy, Suspense } from 'react';
import HeaderBar from './HeaderBar';
import CodeEditorView from './CodeEditorView';
import EmptyFileSelectionView from './EmptyFileSelectionView';
import Banner from './Banner';
import { useTheme } from '../context/ThemeContext';
import { CodeAreaProps } from './types';

const Simulator = lazy(() => import('../simulator'));
const CodeInfoModal = lazy(() => import('../components/CodeInfoModal'));
const SaveFileModal = lazy(() => import('../components/SaveFileModal'));
const SaveToCacheModal = lazy(() => import('../components/SaveToCacheModal'));

function CodeAreaMainComponent({ 
  folderPath,
  setFolderPath,
  fileName, 
  setFileName,
  scriptContent, 
  setScriptContent,
  customCommit, 
  isCommitTimeEnabled,
  scriptMode, 
  scriptExtension, 
  setScriptExtension,
  gitCommand,
  isRepoMetaEnabled,
  repoTopics,
  repoDescription,
  isReadmeDetectorEnabled,
  readmeDetectorMode = 'AUTO',
  isReleaseEnabled,
  releaseMode,
  releaseBump,
  releaseTag,
  autoPath, 
  autoUsername, 
  autoToken, 
  autoRepo, 
  autoBranch, 
  lfsExtensions, 
  lfsSizeLimit, 
  activeTab,
  setActiveTab,
  mobileView, 
  setMobileView,
  isGenerated, 
  onGenerate,
  isInfoBannerOpen: propIsInfoBannerOpen,
  setIsInfoBannerOpen: propSetIsInfoBannerOpen,
  sidebarView = 'CONFIG',
  fileList = [],
  setFileList,
  activeFileId,
  setActiveFileId,
  onSelectFile,
  onCreateNewFile
}: CodeAreaProps) {
  const { theme } = useTheme();

  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isWrapText, setIsWrapText] = useState(() => {
    return localStorage.getItem('cyberIsWrapText') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cyberIsWrapText', String(isWrapText));
  }, [isWrapText]);

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    return Boolean(scriptContent && scriptContent.trim().length > 0);
  });
  const prevActiveFileIdRef = useRef<string | undefined>(activeFileId);

  useEffect(() => {
    if (prevActiveFileIdRef.current !== activeFileId) {
      prevActiveFileIdRef.current = activeFileId;
      if (!activeFileId && sidebarView === 'FILES') {
        setIsEditing(false);
        setHasStarted(false);
        return;
      }
      if (!scriptContent || scriptContent.trim().length === 0) {
        setHasStarted(true);
        setIsEditing(true);
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 50);
      } else {
        setHasStarted(true);
        setIsEditing(false);
      }
    }
  }, [activeFileId, scriptContent, sidebarView]);

  const handleStartWriting = () => {
    setHasStarted(true);
    setIsEditing(true);
    if (setScriptContent && !scriptContent) {
      setScriptContent('');
    }
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  const fontSizePx = Math.round(zoom * 13);
  const lineHeightPx = Math.round(zoom * 13 * 1.55);
  const codeLines = useMemo(
    () => (sidebarView === 'CONFIG' && !isGenerated ? [''] : (scriptContent || '').split('\n')),
    [scriptContent, sidebarView, isGenerated]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const updated = value.substring(0, start) + '    ' + value.substring(end);
      if (setScriptContent) setScriptContent(updated);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  }, [setScriptContent]);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [internalInfoBanner, setInternalInfoBanner] = useState(false);
  const isInfoBannerOpen = propIsInfoBannerOpen ?? internalInfoBanner;
  const setIsInfoBannerOpen = propSetIsInfoBannerOpen ?? setInternalInfoBanner;
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaveCacheModalOpen, setIsSaveCacheModalOpen] = useState(false);

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 0.2, 2.5)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 0.2, 0.6)), []);

  const canCopyOrDownload = Boolean(
    scriptContent &&
      !(sidebarView === 'FILES' && !activeFileId) &&
      (sidebarView !== 'CONFIG' || isGenerated)
  );

  const handleCopy = useCallback(() => {
    if (!canCopyOrDownload) return;
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [canCopyOrDownload, scriptContent]);

  const handleDownload = useCallback(() => {
    if (!canCopyOrDownload) return;
    setIsSaveModalOpen(true);
  }, [canCopyOrDownload]);

  const isAwaitingFileSelection = sidebarView === 'FILES' && !activeFileId;
  const isUngeneratedConfig = sidebarView === 'CONFIG' && !isGenerated;
  const isFullCover = isAwaitingFileSelection || isUngeneratedConfig;

  return (
    <section className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-250 ${
      mobileView === 'WORKSPACE' ? 'flex' : 'hidden'
    } lg:flex ${
      theme === 'dark' ? 'bg-[#030509]' : 'bg-[#f8fafc]'
    }`}>
      {/* Header Bar */}
      {!isFullCover && (
        <HeaderBar
          fileName={fileName}
          scriptExtension={scriptExtension}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileView={mobileView}
          setMobileView={setMobileView}
          zoom={zoom}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          isWrapText={isWrapText}
          setIsWrapText={setIsWrapText}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          hasStarted={hasStarted}
          handleStartWriting={handleStartWriting}
          canCopyOrDownload={canCopyOrDownload}
          copied={copied}
          handleCopy={handleCopy}
          handleDownload={handleDownload}
          sidebarView={sidebarView}
          setIsSaveCacheModalOpen={setIsSaveCacheModalOpen}
          activeFileId={activeFileId}
        />
      )}

      {/* Workspace: Empty File Selection View vs Code View vs Simulator View */}
      <div className="flex-1 overflow-hidden relative">
        {isAwaitingFileSelection ? (
          <EmptyFileSelectionView
            fileList={fileList}
            onSelectFile={onSelectFile}
            onCreateNewFile={onCreateNewFile}
            mobileView={mobileView}
            setMobileView={setMobileView}
          />
        ) : activeTab === 'CODE' ? (
          <CodeEditorView
            scriptContent={scriptContent}
            setScriptContent={setScriptContent}
            scriptExtension={scriptExtension}
            fileName={fileName}
            isWrapText={isWrapText}
            hasStarted={hasStarted}
            setHasStarted={setHasStarted}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            sidebarView={sidebarView}
            isGenerated={isGenerated}
            onGenerate={onGenerate}
            activeFileId={activeFileId}
            setFileList={setFileList}
            fontSizePx={fontSizePx}
            lineHeightPx={lineHeightPx}
            codeLines={codeLines}
            textareaRef={textareaRef}
            handleKeyDown={handleKeyDown}
            mobileView={mobileView}
            setMobileView={setMobileView}
          />
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            <Suspense fallback={null}>
              <Simulator 
                customCommit={customCommit} 
                isCommitTimeEnabled={isCommitTimeEnabled}
                scriptMode={scriptMode}
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
                zoom={zoom}
                fileName={fileName}
                scriptExtension={scriptExtension}
                scriptContent={scriptContent}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Docked Execution Guide Banner */}
      {!isFullCover && (
        <Banner
          isInfoBannerOpen={isInfoBannerOpen}
          setIsInfoBannerOpen={setIsInfoBannerOpen}
          scriptExtension={scriptExtension}
          fileName={fileName}
          setIsInfoModalOpen={setIsInfoModalOpen}
        />
      )}

      {/* Modals (Lazy-loaded on demand) */}
      <Suspense fallback={null}>
        {isInfoModalOpen && (
          <CodeInfoModal 
            isOpen={isInfoModalOpen} 
            onClose={() => setIsInfoModalOpen(false)}
            scriptExtension={scriptExtension}
          />
        )}

        {isSaveModalOpen && (
          <SaveFileModal
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            folderPath={folderPath}
            setFolderPath={setFolderPath}
            fileName={fileName}
            scriptExtension={scriptExtension}
            scriptContent={scriptContent}
          />
        )}

        {isSaveCacheModalOpen && (
          <SaveToCacheModal
            isOpen={isSaveCacheModalOpen}
            onClose={() => setIsSaveCacheModalOpen(false)}
            fileName={fileName}
            setFileName={setFileName}
            scriptExtension={scriptExtension}
            setScriptExtension={setScriptExtension}
            scriptContent={scriptContent}
            fileList={fileList}
            setFileList={setFileList}
            activeFileId={activeFileId}
            onSaved={(savedFile) => {
              setActiveFileId?.(savedFile.id);
              setFileName(savedFile.name);
              setScriptExtension?.(savedFile.extension as any);
            }}
          />
        )}
      </Suspense>
    </section>
  );
}

const CodeAreaMain = memo(CodeAreaMainComponent);
export default CodeAreaMain;
