import { Dispatch, SetStateAction, RefObject, KeyboardEvent } from 'react';
import { ScriptExtension } from '../components/OsCombobox';
import { GitCommandMode } from '../components/GitCommandCombobox';
import { ReleaseMode, ReleaseBumpType } from '../sidebar/components/GitReleaseSection';
import { ScriptFileItem } from '../sidebar/types';

export interface CodeAreaProps {
  folderPath: string;
  setFolderPath: (val: string) => void;
  fileName: string;
  setFileName: (val: string) => void;
  scriptContent: string;
  setScriptContent?: (val: string) => void;
  customCommit: string;
  isCommitTimeEnabled?: boolean;
  scriptMode: 'MANUAL' | 'AUTO';
  scriptExtension: ScriptExtension;
  setScriptExtension?: (val: ScriptExtension) => void;
  gitCommand?: GitCommandMode;
  isRepoMetaEnabled?: boolean;
  repoTopics?: string;
  repoDescription?: string;
  isReadmeDetectorEnabled?: boolean;
  readmeDetectorMode?: 'AUTO' | 'MANUAL';
  isReleaseEnabled?: boolean;
  releaseMode?: ReleaseMode;
  releaseBump?: ReleaseBumpType;
  releaseTag?: string;
  autoPath: string;
  autoUsername: string;
  autoToken: string;
  autoRepo: string;
  autoBranch: string;
  lfsExtensions: string;
  lfsSizeLimit: string;
  activeTab: 'CODE' | 'SIMULATOR';
  setActiveTab?: (tab: 'CODE' | 'SIMULATOR') => void;
  mobileView: 'KONFIGURASI' | 'WORKSPACE';
  setMobileView?: (val: 'KONFIGURASI' | 'WORKSPACE') => void;
  isGenerated: boolean;
  onGenerate: () => void;
  isInfoBannerOpen?: boolean;
  setIsInfoBannerOpen?: Dispatch<SetStateAction<boolean>>;
  sidebarView?: 'CONFIG' | 'FILES';
  fileList?: ScriptFileItem[];
  setFileList?: Dispatch<SetStateAction<ScriptFileItem[]>>;
  activeFileId?: string;
  setActiveFileId?: (id: string) => void;
  onSelectFile?: (file: ScriptFileItem) => void;
  onCreateNewFile?: () => void;
}

export interface HeaderBarProps {
  fileName: string;
  scriptExtension: ScriptExtension;
  activeTab: 'CODE' | 'SIMULATOR';
  setActiveTab?: (tab: 'CODE' | 'SIMULATOR') => void;
  mobileView: 'KONFIGURASI' | 'WORKSPACE';
  setMobileView?: (val: 'KONFIGURASI' | 'WORKSPACE') => void;
  zoom: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  isWrapText: boolean;
  setIsWrapText: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  hasStarted: boolean;
  handleStartWriting: () => void;
  canCopyOrDownload: boolean;
  copied: boolean;
  handleCopy: () => void;
  handleDownload: () => void;
  sidebarView: 'CONFIG' | 'FILES';
  setIsSaveCacheModalOpen: Dispatch<SetStateAction<boolean>>;
  activeFileId?: string;
}

export interface CodeEditorViewProps {
  scriptContent: string;
  setScriptContent?: (val: string) => void;
  scriptExtension: ScriptExtension;
  fileName: string;
  isWrapText: boolean;
  hasStarted: boolean;
  setHasStarted: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  sidebarView: 'CONFIG' | 'FILES';
  isGenerated?: boolean;
  onGenerate: () => void;
  activeFileId?: string;
  setFileList?: Dispatch<SetStateAction<ScriptFileItem[]>>;
  fontSizePx: number;
  lineHeightPx: number;
  codeLines: string[];
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  mobileView?: 'KONFIGURASI' | 'WORKSPACE';
  setMobileView?: (val: 'KONFIGURASI' | 'WORKSPACE') => void;
}

export interface BannerProps {
  isInfoBannerOpen: boolean;
  setIsInfoBannerOpen: (val: boolean) => void;
  scriptExtension: ScriptExtension;
  fileName: string;
  setIsInfoModalOpen: (val: boolean) => void;
}
