import React, { useState } from 'react';
import OsCombobox, { ScriptExtension } from '../components/OsCombobox';
import GitCommandCombobox, { GitCommandMode } from '../components/GitCommandCombobox';
import { useTheme } from '../context/ThemeContext';
import TargetPathField from './components/TargetPathField';
import GitCredentialsFields from './components/GitCredentialsFields';
import GitRepoMetaSection from './components/GitRepoMetaSection';
import ReadmeDetectorSection from './components/ReadmeDetectorSection';
import GitReleaseSection, { ReleaseMode, ReleaseBumpType } from './components/GitReleaseSection';
import GitLfsSection from './components/GitLfsSection';

interface AutoViewProps {
  scriptExtension: ScriptExtension;
  setScriptExtension: (val: ScriptExtension) => void;
  gitCommand?: GitCommandMode;
  setGitCommand?: (val: GitCommandMode) => void;
  isRepoMetaEnabled?: boolean;
  setIsRepoMetaEnabled?: (val: boolean) => void;
  repoTopics?: string;
  setRepoTopics?: (val: string) => void;
  repoDescription?: string;
  setRepoDescription?: (val: string) => void;
  isReadmeDetectorEnabled?: boolean;
  setIsReadmeDetectorEnabled?: (val: boolean) => void;
  readmeDetectorMode?: 'AUTO' | 'MANUAL';
  setReadmeDetectorMode?: (val: 'AUTO' | 'MANUAL') => void;
  isReleaseEnabled?: boolean;
  setIsReleaseEnabled?: (val: boolean) => void;
  releaseMode?: ReleaseMode;
  setReleaseMode?: (val: ReleaseMode) => void;
  releaseBump?: ReleaseBumpType;
  setReleaseBump?: (val: ReleaseBumpType) => void;
  releaseTag?: string;
  setReleaseTag?: (val: string) => void;
  releaseNotes?: string;
  setReleaseNotes?: (val: string) => void;
  autoPath: string;
  setAutoPath: (val: string) => void;
  isZipTarget: boolean;
  setIsZipTarget: (val: boolean) => void;
  autoUsername: string;
  setAutoUsername: (val: string) => void;
  autoToken: string;
  setAutoToken: (val: string) => void;
  autoRepo: string;
  setAutoRepo: (val: string) => void;
  autoBranch: string;
  setAutoBranch: (val: string) => void;
  customCommit: string;
  setCustomCommit: (val: string) => void;
  isCommitTimeEnabled?: boolean;
  setIsCommitTimeEnabled?: (val: boolean) => void;
  lfsExtensions: string;
  setLfsExtensions: (val: string) => void;
  lfsSizeLimit: string;
  setLfsSizeLimit: (val: string) => void;
  isCustomBranch?: boolean;
  setIsCustomBranch?: (val: boolean) => void;
  isLfsEnabled?: boolean;
  setIsLfsEnabled?: (val: boolean) => void;
  lfsLiveInput?: string;
  setLfsLiveInput?: (val: string) => void;
  onOpenVercelModal: () => void;
}

function AutoView({
  scriptExtension,
  setScriptExtension,
  gitCommand: propGitCommand,
  setGitCommand: propSetGitCommand,
  isRepoMetaEnabled: propIsRepoMetaEnabled,
  setIsRepoMetaEnabled: propSetIsRepoMetaEnabled,
  repoTopics: propRepoTopics,
  setRepoTopics: propSetRepoTopics,
  repoDescription: propRepoDescription,
  setRepoDescription: propSetRepoDescription,
  isReadmeDetectorEnabled: propIsReadmeDetectorEnabled,
  setIsReadmeDetectorEnabled: propSetIsReadmeDetectorEnabled,
  readmeDetectorMode: propReadmeDetectorMode,
  setReadmeDetectorMode: propSetReadmeDetectorMode,
  isReleaseEnabled: propIsReleaseEnabled,
  setIsReleaseEnabled: propSetIsReleaseEnabled,
  releaseMode: propReleaseMode,
  setReleaseMode: propSetReleaseMode,
  releaseBump: propReleaseBump,
  setReleaseBump: propSetReleaseBump,
  releaseTag: propReleaseTag,
  setReleaseTag: propSetReleaseTag,
  releaseNotes: propReleaseNotes,
  setReleaseNotes: propSetReleaseNotes,
  autoPath,
  setAutoPath,
  setIsZipTarget,
  autoUsername,
  setAutoUsername,
  autoToken,
  setAutoToken,
  autoRepo,
  setAutoRepo,
  autoBranch,
  setAutoBranch,
  customCommit,
  setCustomCommit,
  isCommitTimeEnabled: propIsCommitTimeEnabled,
  setIsCommitTimeEnabled: propSetIsCommitTimeEnabled,
  lfsExtensions,
  setLfsExtensions,
  lfsSizeLimit,
  setLfsSizeLimit,
  isCustomBranch: propIsCustomBranch,
  setIsCustomBranch: propSetIsCustomBranch,
  isLfsEnabled: propIsLfsEnabled,
  setIsLfsEnabled: propSetIsLfsEnabled,
  lfsLiveInput: propLfsLiveInput,
  setLfsLiveInput: propSetLfsLiveInput,
  onOpenVercelModal
}: AutoViewProps) {
  const { theme } = useTheme();

  const [internalGitCommand, setInternalGitCommand] = useState<GitCommandMode>(() => {
    const saved = localStorage.getItem('cyberGitCommand');
    if (saved === 'FORCE_PUSH' || saved === 'PARTIAL_UPDATE') {
      return saved;
    }
    return 'FORCE_PUSH';
  });
  const gitCommand = propGitCommand !== undefined ? propGitCommand : internalGitCommand;
  const setGitCommand = propSetGitCommand || setInternalGitCommand;

  const [internalIsRepoMetaEnabled, setInternalIsRepoMetaEnabled] = useState<boolean>(() => {
    return localStorage.getItem('cyberIsRepoMetaEnabled') === 'true';
  });
  const isRepoMetaEnabled = propIsRepoMetaEnabled !== undefined ? propIsRepoMetaEnabled : internalIsRepoMetaEnabled;
  const setIsRepoMetaEnabled = propSetIsRepoMetaEnabled || setInternalIsRepoMetaEnabled;

  const [internalRepoTopics, setInternalRepoTopics] = useState<string>(() => {
    return localStorage.getItem('cyberRepoTopics') || '';
  });
  const repoTopics = propRepoTopics !== undefined ? propRepoTopics : internalRepoTopics;
  const setRepoTopics = propSetRepoTopics || setInternalRepoTopics;

  const [internalRepoDescription, setInternalRepoDescription] = useState<string>(() => {
    return (localStorage.getItem('cyberRepoDescription') || '').slice(0, 350);
  });
  const repoDescription = propRepoDescription !== undefined ? propRepoDescription : internalRepoDescription;
  const setRepoDescription = propSetRepoDescription || setInternalRepoDescription;

  const [internalIsReadmeDetectorEnabled, setInternalIsReadmeDetectorEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyberIsReadmeDetectorEnabled');
    if (saved !== null) return saved === 'true';
    return true; // Default always active at start
  });
  const isReadmeDetectorEnabled =
    propIsReadmeDetectorEnabled !== undefined ? propIsReadmeDetectorEnabled : internalIsReadmeDetectorEnabled;
  const setIsReadmeDetectorEnabled = propSetIsReadmeDetectorEnabled || setInternalIsReadmeDetectorEnabled;

  const [internalReadmeDetectorMode, setInternalReadmeDetectorMode] = useState<'AUTO' | 'MANUAL'>(() => {
    const saved = localStorage.getItem('cyberReadmeDetectorMode');
    return saved === 'MANUAL' ? 'MANUAL' : 'AUTO';
  });
  const readmeDetectorMode = propReadmeDetectorMode !== undefined ? propReadmeDetectorMode : internalReadmeDetectorMode;
  const setReadmeDetectorMode = propSetReadmeDetectorMode || setInternalReadmeDetectorMode;

  const [internalIsReleaseEnabled, setInternalIsReleaseEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyberIsReleaseEnabled');
    if (saved !== null) return saved === 'true';
    return true; // Default: Aktif
  });
  const isReleaseEnabled = propIsReleaseEnabled !== undefined ? propIsReleaseEnabled : internalIsReleaseEnabled;
  const setIsReleaseEnabled = propSetIsReleaseEnabled || setInternalIsReleaseEnabled;

  const [internalReleaseMode, setInternalReleaseMode] = useState<ReleaseMode>(() => {
    const saved = localStorage.getItem('cyberReleaseMode');
    return saved === 'MANUAL' ? 'MANUAL' : 'AUTO';
  });
  const releaseMode = propReleaseMode !== undefined ? propReleaseMode : internalReleaseMode;
  const setReleaseMode = propSetReleaseMode || setInternalReleaseMode;

  const [internalReleaseBump, setInternalReleaseBump] = useState<ReleaseBumpType>(() => {
    const saved = localStorage.getItem('cyberReleaseBump');
    if (saved === 'minor' || saved === 'major') return saved;
    return 'patch';
  });
  const releaseBump = propReleaseBump !== undefined ? propReleaseBump : internalReleaseBump;
  const setReleaseBump = propSetReleaseBump || setInternalReleaseBump;

  const [internalReleaseTag, setInternalReleaseTag] = useState(() => {
    return localStorage.getItem('cyberReleaseTag') || '';
  });
  const releaseTag = propReleaseTag !== undefined ? propReleaseTag : internalReleaseTag;
  const setReleaseTag = propSetReleaseTag || setInternalReleaseTag;

  const [internalReleaseNotes, setInternalReleaseNotes] = useState(() => {
    return localStorage.getItem('cyberReleaseNotes') || '';
  });
  const releaseNotes = propReleaseNotes !== undefined ? propReleaseNotes : internalReleaseNotes;
  const setReleaseNotes = propSetReleaseNotes || setInternalReleaseNotes;

  const [internalLfsInputToken, setInternalLfsInputToken] = useState('');
  const lfsInputToken = propLfsLiveInput !== undefined ? propLfsLiveInput : internalLfsInputToken;
  const setLfsInputToken = propSetLfsLiveInput || setInternalLfsInputToken;

  const [internalIsCustomBranch, setInternalIsCustomBranch] = useState(() => {
    const saved = localStorage.getItem('cyberIsCustomBranch');
    if (saved !== null) return saved === 'true';
    return false; // Default: Tidak Aktif
  });
  const isCustomBranch = propIsCustomBranch !== undefined ? propIsCustomBranch : internalIsCustomBranch;
  const setIsCustomBranch = propSetIsCustomBranch || setInternalIsCustomBranch;

  const [internalIsCommitTimeEnabled, setInternalIsCommitTimeEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyberIsCommitTimeEnabled');
    if (saved !== null) return saved === 'true';
    return false; // Default: Tidak Aktif
  });
  const isCommitTimeEnabled = propIsCommitTimeEnabled !== undefined ? propIsCommitTimeEnabled : internalIsCommitTimeEnabled;
  const setIsCommitTimeEnabled = propSetIsCommitTimeEnabled || setInternalIsCommitTimeEnabled;

  const [internalIsLfsEnabled, setInternalIsLfsEnabled] = useState(() => {
    const saved = localStorage.getItem('cyberIsLfsEnabled');
    if (saved !== null) return saved === 'true';
    return false; // Default: Tidak Aktif
  });
  const isLfsEnabled = propIsLfsEnabled !== undefined ? propIsLfsEnabled : internalIsLfsEnabled;
  const setIsLfsEnabled = propSetIsLfsEnabled || setInternalIsLfsEnabled;

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 custom-scrollbar">
      <div className="w-full flex flex-col space-y-3.5 md:space-y-4 pb-6">
        {/* Opsi Sistem Operasi */}
        <div className="flex flex-col gap-1.5 md:gap-2">
          <span className={`text-[11px] font-medium ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-700'
          }`}>
            Sistem Operasi
          </span>

          <OsCombobox 
            value={scriptExtension} 
            onChange={setScriptExtension} 
          />
        </div>

        {/* Opsi Command Git (Force Push & Partial Update) */}
        <div className="flex flex-col gap-1.5 md:gap-2">
          <span className={`text-[11px] font-medium ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-700'
          }`}>
            Command Git
          </span>

          <GitCommandCombobox
            value={gitCommand}
            onChange={(val) => {
              setGitCommand(val);
              try {
                localStorage.setItem('cyberGitCommand', val);
              } catch {}
            }}
          />
        </div>

        {/* Path Target Picker */}
        <TargetPathField
          theme={theme}
          autoPath={autoPath}
          setAutoPath={setAutoPath}
          setIsZipTarget={setIsZipTarget}
          autoUsername={autoUsername}
        />

        {/* Token, Username, Repositori, Branch & Commit */}
        <GitCredentialsFields
          theme={theme}
          autoToken={autoToken}
          setAutoToken={setAutoToken}
          autoUsername={autoUsername}
          setAutoUsername={setAutoUsername}
          autoRepo={autoRepo}
          setAutoRepo={setAutoRepo}
          autoBranch={autoBranch}
          setAutoBranch={setAutoBranch}
          customCommit={customCommit}
          setCustomCommit={setCustomCommit}
          isCustomBranch={isCustomBranch}
          setIsCustomBranch={setIsCustomBranch}
          isCommitTimeEnabled={isCommitTimeEnabled}
          setIsCommitTimeEnabled={setIsCommitTimeEnabled}
        />

        {/* Readme Detector Section */}
        <ReadmeDetectorSection
          theme={theme}
          isReadmeDetectorEnabled={isReadmeDetectorEnabled}
          setIsReadmeDetectorEnabled={setIsReadmeDetectorEnabled}
          readmeDetectorMode={readmeDetectorMode}
          setReadmeDetectorMode={setReadmeDetectorMode}
        />

        {/* Version Update Section */}
        <GitReleaseSection
          theme={theme}
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
        />

        {/* Topic & Deskripsi Repository Section */}
        <GitRepoMetaSection
          theme={theme}
          isRepoMetaEnabled={isRepoMetaEnabled}
          setIsRepoMetaEnabled={setIsRepoMetaEnabled}
          repoTopics={repoTopics}
          setRepoTopics={setRepoTopics}
          repoDescription={repoDescription}
          setRepoDescription={setRepoDescription}
        />

        {/* Git LFS Section */}
        <GitLfsSection
          theme={theme}
          lfsExtensions={lfsExtensions}
          setLfsExtensions={setLfsExtensions}
          lfsSizeLimit={lfsSizeLimit}
          setLfsSizeLimit={setLfsSizeLimit}
          isLfsEnabled={isLfsEnabled}
          setIsLfsEnabled={setIsLfsEnabled}
          lfsInputToken={lfsInputToken}
          setLfsInputToken={setLfsInputToken}
          onOpenVercelModal={onOpenVercelModal}
        />
      </div>
    </div>
  );
}

export default React.memo(AutoView);
