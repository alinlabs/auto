import { ScriptExtension } from '../components/OsCombobox';
import { GitCommandMode } from '../components/GitCommandCombobox';
import { ReleaseMode, ReleaseBumpType } from '../sidebar/components/GitReleaseSection';

import rawScriptContent from '../assets/code/manual.ps1?raw';
import rawAutoScriptContent from '../assets/code/auto.ps1?raw';
import rawManualCmd from '../assets/code/manual.cmd?raw';
import rawAutoCmd from '../assets/code/auto.cmd?raw';
import rawManualSh from '../assets/code/manual.sh?raw';
import rawAutoSh from '../assets/code/auto.sh?raw';

export interface ScriptGeneratorParams {
  mode: 'MANUAL' | 'AUTO';
  ext: ScriptExtension;
  commit: string;
  path: string;
  username: string;
  token: string;
  repo: string;
  branch: string;
  lfsExts: string;
  lfsLimit: string;
  customBranchActive?: boolean;
  lfsActive?: boolean;
  liveLfsToken?: string;
  gitCommand?: GitCommandMode;
  releaseEnabled?: boolean;
  releaseMode?: ReleaseMode;
  releaseBump?: ReleaseBumpType;
  releaseTag?: string;
  releaseNotes?: string;
  commitTimeEnabled?: boolean;
  repoMetaEnabled?: boolean;
  repoTopics?: string;
  repoDescription?: string;
  readmeDetectorEnabled?: boolean;
  readmeDetectorMode?: 'AUTO' | 'MANUAL';
}

export function generateScriptText(
  mode: 'MANUAL' | 'AUTO',
  ext: ScriptExtension,
  commit: string,
  path: string,
  username: string,
  token: string,
  repo: string,
  branch: string,
  lfsExts: string,
  lfsLimit: string,
  customBranchActive: boolean = true,
  lfsActive: boolean = false,
  liveLfsToken: string = '',
  gitCommand: GitCommandMode = 'FORCE_PUSH',
  releaseEnabled: boolean = false,
  releaseMode: ReleaseMode = 'AUTO',
  releaseBump: ReleaseBumpType = 'patch',
  releaseTag: string = '',
  releaseNotes: string = '',
  commitTimeEnabled: boolean = true,
  repoMetaEnabled: boolean = false,
  repoTopics: string = '',
  repoDescription: string = '',
  readmeDetectorEnabled: boolean = true,
  readmeDetectorMode: 'AUTO' | 'MANUAL' = 'AUTO'
): string {
  let s = '';
  if (!ext) {
    return '# [PERINGATAN] Sistem operasi belum dipilih.\n# Silakan pilih sistem operasi (Windows PowerShell, CMD, atau Bash) pada panel konfigurasi di sebelah kiri.';
  }

  if (mode === 'MANUAL') {
    if (ext === 'ps1') s = rawScriptContent;
    else if (ext === 'cmd') s = rawManualCmd;
    else s = rawManualSh;
  } else {
    if (ext === 'ps1') s = rawAutoScriptContent;
    else if (ext === 'cmd') s = rawAutoCmd;
    else s = rawAutoSh;

    const resolvedBranch = customBranchActive ? (branch.trim() || 'main') : 'main';
    const resolvedGitCommand: GitCommandMode =
      gitCommand === 'PARTIAL_UPDATE' ? 'PARTIAL_UPDATE' : 'FORCE_PUSH';

    const gitCommandLabel =
      resolvedGitCommand === 'FORCE_PUSH'
        ? 'COMMAND GIT: FORCE PUSH - TIMPA SEMUA & HAPUS FILE YANG TIDAK SESUAI FOLDER BARU'
        : 'COMMAND GIT: PARTIAL UPDATE - HANYA UPDATE FILE YANG BERUBAH DARI FOLDER';

    // Deteksi otomatis apakah Path Target diakhiri ekstensi .zip
    const trimmedPath = path.trim();
    const isZipPath = /\.zip["']?$/i.test(trimmedPath);
    const cleanRawPath = trimmedPath.replace(/^["']|["']$/g, '');
    const extractedDirPath = isZipPath ? cleanRawPath.replace(/\.zip$/i, '') : cleanRawPath;

    const modeLabel = isZipPath
      ? 'MODE: ARSIP .ZIP - EKSTRAK OTOMATIS TANPA KONFIRMASI'
      : 'MODE: DIREKTORI / FOLDER LANGSUNG';

    let targetConfigBlock = '';
    let workspaceInitBlock = '';

    if (ext === 'ps1') {
      if (isZipPath) {
        targetConfigBlock = [
          `$TARGET_TYPE     = "ZIP_ARCHIVE"`,
          `$ZIP_FILE_PATH   = "${cleanRawPath}"`,
          `$EXTRACT_DIR     = "${extractedDirPath}"`,
          `$PROJECT_PATH    = $EXTRACT_DIR`
        ].join('\n');

        workspaceInitBlock = [
          `    if (-not (Test-Path -LiteralPath $ZIP_FILE_PATH -PathType Leaf)) {`,
          `        Write-CyberError "File arsip ZIP tidak ditemukan: $ZIP_FILE_PATH"`,
          `        Read-Host " [>] Tekan [ENTER] untuk keluar"`,
          `        Clear-Host`,
          `        exit`,
          `    }`,
          ``,
          `    Write-CyberHeader "EKSTRAKSI OTOMATIS ARSIP ZIP"`,
          `    Write-CyberInfo "File Arsip ZIP   : $ZIP_FILE_PATH"`,
          `    Write-CyberInfo "Folder Ekstraksi : $EXTRACT_DIR"`,
          ``,
          `    if ($GIT_COMMAND_MODE -eq "FORCE_PUSH" -and (Test-Path -LiteralPath $EXTRACT_DIR)) {`,
          `        Show-CyberLoading "Membersihkan folder ekstraksi lama (Force Push)..."`,
          `        Remove-Item -LiteralPath $EXTRACT_DIR -Recurse -Force -Confirm:$false -ErrorAction SilentlyContinue`,
          `    }`,
          `    if (-not (Test-Path -LiteralPath $EXTRACT_DIR)) {`,
          `        [System.IO.Directory]::CreateDirectory($EXTRACT_DIR) | Out-Null`,
          `    }`,
          ``,
          `    Show-CyberLoading "Mengekstrak arsip ZIP secara otomatis..."`,
          `    try {`,
          `        Add-Type -AssemblyName System.IO.Compression -ErrorAction SilentlyContinue`,
          `        Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction SilentlyContinue`,
          `        $zipArchive = [System.IO.Compression.ZipFile]::OpenRead($ZIP_FILE_PATH)`,
          `        try {`,
          `            foreach ($entry in $zipArchive.Entries) {`,
          `                $destPath = [System.IO.Path]::Combine($EXTRACT_DIR, $entry.FullName.Replace('/', '\\'))`,
          `                $destDir = [System.IO.Path]::GetDirectoryName($destPath)`,
          `                if ($destDir -and (-not [System.IO.Directory]::Exists($destDir))) {`,
          `                    [System.IO.Directory]::CreateDirectory($destDir) | Out-Null`,
          `                }`,
          `                if (-not [string]::IsNullOrEmpty($entry.Name)) {`,
          `                    if ([System.IO.File]::Exists($destPath)) {`,
          `                        [System.IO.File]::SetAttributes($destPath, [System.IO.FileAttributes]::Normal)`,
          `                    }`,
          `                    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destPath, $true)`,
          `                }`,
          `            }`,
          `        } finally {`,
          `            $zipArchive.Dispose()`,
          `        }`,
          `        Write-CyberSuccess "Ekstraksi file ZIP selesai secara otomatis."`,
          `    } catch {`,
          `        Write-CyberError "Gagal mengekstrak arsip ZIP: $_"`,
          `        Read-Host " [>] Tekan [ENTER] untuk keluar"`,
          `        Clear-Host`,
          `        exit`,
          `    }`,
          ``,
          `    # Jika hasil ekstraksi hanya berisi 1 sub-folder utama, arahkan otomatis ke dalamnya`,
          `    $innerItems = @(Get-ChildItem -LiteralPath $EXTRACT_DIR -Force)`,
          `    if ($innerItems.Count -eq 1 -and $innerItems[0].PSIsContainer) {`,
          `        $PROJECT_PATH = $innerItems[0].FullName`,
          `        Write-CyberInfo "Mengarahkan otomatis ke root folder ekstraksi: $PROJECT_PATH"`,
          `    } else {`,
          `        $PROJECT_PATH = $EXTRACT_DIR`,
          `    }`,
          ``,
          `    Set-Location -LiteralPath $PROJECT_PATH`,
          `    Write-CyberSuccess "Akses ruang kerja hasil ekstraksi diizinkan: $PROJECT_PATH"`
        ].join('\n');
      } else {
        targetConfigBlock = [
          `$TARGET_TYPE     = "DIRECTORY"`,
          `$PROJECT_PATH    = "${cleanRawPath}"`
        ].join('\n');

        workspaceInitBlock = [
          `    if (-not (Test-Path -LiteralPath $PROJECT_PATH -PathType Container)) {`,
          `        Write-CyberError "Direktori target tidak ditemukan: $PROJECT_PATH"`,
          `        Read-Host " [>] Tekan [ENTER] untuk keluar"`,
          `        Clear-Host`,
          `        exit`,
          `    }`,
          ``,
          `    Set-Location -LiteralPath $PROJECT_PATH`,
          `    Write-CyberSuccess "Akses direktori kerja diizinkan: $PROJECT_PATH"`
        ].join('\n');
      }
    } else if (ext === 'cmd') {
      if (isZipPath) {
        targetConfigBlock = [
          `set "TARGET_TYPE=ZIP_ARCHIVE"`,
          `set "ZIP_FILE_PATH=${cleanRawPath}"`,
          `set "EXTRACT_DIR=${extractedDirPath}"`,
          `set "PROJECT_PATH=!EXTRACT_DIR!"`
        ].join('\n');

        workspaceInitBlock = [
          `if not exist "!ZIP_FILE_PATH!" (`,
          `    echo.`,
          `    echo [x] File arsip ZIP tidak ditemukan: !ZIP_FILE_PATH!`,
          `    pause`,
          `    exit /b 1`,
          `)`,
          ``,
          `echo.`,
          `echo =======================================================`,
          `echo   ^> EKSTRAKSI OTOMATIS ARSIP ZIP`,
          `echo =======================================================`,
          `echo [~] File Arsip ZIP   : !ZIP_FILE_PATH!`,
          `echo [~] Folder Ekstraksi : !EXTRACT_DIR!`,
          `if /i "!GIT_COMMAND_MODE!"=="FORCE_PUSH" (`,
          `    if exist "!EXTRACT_DIR!" rmdir /s /q "!EXTRACT_DIR!" >nul 2>&1`,
          `)`,
          `if not exist "!EXTRACT_DIR!" mkdir "!EXTRACT_DIR!" >nul 2>&1`,
          `echo [~] Mengekstrak arsip ZIP secara otomatis...`,
          `tar -xf "!ZIP_FILE_PATH!" -C "!EXTRACT_DIR!" >nul 2>&1`,
          `if %errorlevel% neq 0 (`,
          `    powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "$ConfirmPreference='None'; Add-Type -AssemblyName System.IO.Compression.FileSystem; $z=[System.IO.Compression.ZipFile]::OpenRead('!ZIP_FILE_PATH!'); foreach($e in $z.Entries){ $p=[System.IO.Path]::Combine('!EXTRACT_DIR!',$e.FullName.Replace('/','\\')); $d=[System.IO.Path]::GetDirectoryName($p); if($d -and -not [System.IO.Directory]::Exists($d)){[System.IO.Directory]::CreateDirectory($d)|Out-Null}; if($e.Name){[System.IO.Compression.ZipFileExtensions]::ExtractToFile($e,$p,$true)} }; $z.Dispose()" >nul 2>&1`,
          `)`,
          `set "PROJECT_PATH=!EXTRACT_DIR!"`,
          `echo [+] Ekstraksi selesai secara otomatis.`,
          ``,
          `cd /d "!PROJECT_PATH!"`,
          `echo [+] Direktori kerja aktif: !CD!`
        ].join('\n');
      } else {
        targetConfigBlock = [
          `set "TARGET_TYPE=DIRECTORY"`,
          `set "PROJECT_PATH=${cleanRawPath}"`
        ].join('\n');

        workspaceInitBlock = [
          `if not exist "!PROJECT_PATH!\\" (`,
          `    echo.`,
          `    echo [x] Direktori target tidak ditemukan: !PROJECT_PATH!`,
          `    pause`,
          `    exit /b 1`,
          `)`,
          ``,
          `cd /d "!PROJECT_PATH!"`,
          `echo [+] Direktori kerja aktif: !CD!`
        ].join('\n');
      }
    } else {
      if (isZipPath) {
        targetConfigBlock = [
          `TARGET_TYPE="ZIP_ARCHIVE"`,
          `ZIP_FILE_PATH="${cleanRawPath}"`,
          `EXTRACT_DIR="${extractedDirPath}"`,
          `PROJECT_PATH="$EXTRACT_DIR"`
        ].join('\n');

        workspaceInitBlock = [
          `if [ ! -f "$ZIP_FILE_PATH" ]; then`,
          `    write_cyber_error "File arsip ZIP tidak ditemukan: $ZIP_FILE_PATH"`,
          `    read -p " [>] Tekan [ENTER] untuk keluar: "`,
          `    clear`,
          `    exit 1`,
          `fi`,
          ``,
          `write_cyber_header "EKSTRAKSI OTOMATIS ARSIP ZIP (TANPA KONFIRMASI)"`,
          `write_cyber_info "File Arsip ZIP   : $ZIP_FILE_PATH"`,
          `write_cyber_info "Folder Ekstraksi : $EXTRACT_DIR"`,
          ``,
          `if ! command -v unzip &> /dev/null; then`,
          `    show_cyber_loading "Memasang utilitas unzip..."`,
          `    if command -v pkg &> /dev/null && [ -n "$PREFIX" ] && [[ "$PREFIX" == *"com.termux"* ]]; then`,
          `        pkg install unzip -y > /dev/null 2>&1`,
          `    elif command -v apk &> /dev/null; then`,
          `        apk add unzip > /dev/null 2>&1`,
          `    elif command -v brew &> /dev/null; then`,
          `        brew install unzip > /dev/null 2>&1`,
          `    elif command -v apt-get &> /dev/null; then`,
          `        sudo apt-get install unzip -y > /dev/null 2>&1 || true`,
          `    fi`,
          `fi`,
          ``,
          `if [ "$GIT_COMMAND_MODE" = "FORCE_PUSH" ] && [ -d "$EXTRACT_DIR" ]; then`,
          `    show_cyber_loading "Membersihkan folder ekstraksi lama (Force Push)..."`,
          `    rm -rf "$EXTRACT_DIR"`,
          `fi`,
          `mkdir -p "$EXTRACT_DIR"`,
          `show_cyber_loading "Mengekstrak arsip ZIP secara otomatis tanpa konfirmasi..."`,
          `if unzip -q -o "$ZIP_FILE_PATH" -d "$EXTRACT_DIR"; then`,
          `    write_cyber_success "Ekstraksi file ZIP selesai secara otomatis."`,
          `else`,
          `    write_cyber_error "Gagal mengekstrak arsip ZIP."`,
          `    read -p " [>] Tekan [ENTER] untuk keluar: "`,
          `    clear`,
          `    exit 1`,
          `fi`,
          ``,
          `INNER_COUNT=$(find "$EXTRACT_DIR" -mindepth 1 -maxdepth 1 | wc -l)`,
          `if [ "$INNER_COUNT" -eq 1 ]; then`,
          `    FIRST_INNER=$(find "$EXTRACT_DIR" -mindepth 1 -maxdepth 1)`,
          `    if [ -d "$FIRST_INNER" ]; then`,
          `        PROJECT_PATH="$FIRST_INNER"`,
          `        write_cyber_info "Mengarahkan otomatis ke root folder ekstraksi: $PROJECT_PATH"`,
          `    fi`,
          `else`,
          `    PROJECT_PATH="$EXTRACT_DIR"`,
          `fi`,
          ``,
          `cd "$PROJECT_PATH" || exit 1`,
          `write_cyber_success "Akses ruang kerja hasil ekstraksi diizinkan: $PROJECT_PATH"`
        ].join('\n');
      } else {
        targetConfigBlock = [
          `TARGET_TYPE="DIRECTORY"`,
          `PROJECT_PATH="${cleanRawPath}"`
        ].join('\n');

        workspaceInitBlock = [
          `if [ ! -d "$PROJECT_PATH" ]; then`,
          `    write_cyber_error "Direktori target tidak ditemukan: $PROJECT_PATH"`,
          `    read -p " [>] Tekan [ENTER] untuk keluar: "`,
          `    clear`,
          `    exit 1`,
          `fi`,
          ``,
          `cd "$PROJECT_PATH" || exit 1`,
          `write_cyber_success "Akses direktori kerja diizinkan: $PROJECT_PATH"`
        ].join('\n');
      }
    }

    // Gabungkan ekstensi LFS yang sudah dipilih dengan token input yang sedang diketik secara realtime
    let combinedLfsExts = '';
    if (lfsActive) {
      const list = lfsExts
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const cleanLive = liveLfsToken.trim().replace(/\s+/g, '');
      if (cleanLive) {
        const formattedLive = cleanLive.startsWith('.') ? cleanLive : `.${cleanLive}`;
        if (!list.includes(formattedLive)) {
          list.push(formattedLive);
        }
      }
      combinedLfsExts = list.join(', ');
    }

    const resolvedLfsSize = lfsActive ? lfsLimit.trim() : '';
    const cleanCommit = commit.trim();
    const escapedCommit =
      ext === 'ps1'
        ? cleanCommit.replace(/"/g, '`"')
        : ext === 'cmd'
        ? cleanCommit.replace(/"/g, '')
        : cleanCommit.replace(/"/g, '\\"');

    const cleanReleaseTag = releaseTag.trim();
    const escapedReleaseTag =
      ext === 'ps1'
        ? cleanReleaseTag.replace(/"/g, '`"')
        : ext === 'cmd'
        ? cleanReleaseTag.replace(/"/g, '')
        : cleanReleaseTag.replace(/"/g, '\\"');

    const cleanReleaseNotes = releaseNotes.trim();
    const escapedReleaseNotes =
      ext === 'ps1'
        ? cleanReleaseNotes.replace(/"/g, '`"')
        : ext === 'cmd'
        ? cleanReleaseNotes.replace(/"/g, '')
        : cleanReleaseNotes.replace(/"/g, '\\"');

    const cleanTopicsArray = Array.from(
      new Set(
        repoTopics
          .split(/[,\s]+/)
          .map((t) =>
            t
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '-')
              .replace(/^-+|-+$/g, '')
              .slice(0, 50)
          )
          .filter(Boolean)
      )
    );
    const cleanTopicsCsv = cleanTopicsArray.join(',');
    const cleanTopicsJson = JSON.stringify(cleanTopicsArray);

    const cleanRepoDesc = repoDescription.trim().replace(/\r?\n/g, ' ').slice(0, 350);
    const escapedRepoDesc =
      ext === 'ps1'
        ? cleanRepoDesc.replace(/"/g, '`"')
        : ext === 'cmd'
        ? cleanRepoDesc.replace(/"/g, '')
        : cleanRepoDesc.replace(/"/g, '\\"');

    s = s.replace(/__PARAM_MODE_LABEL__/g, modeLabel);
    s = s.replace(/__PARAM_GIT_COMMAND_LABEL__/g, gitCommandLabel);
    s = s.replace(/__PARAM_GIT_COMMAND__/g, resolvedGitCommand);
    s = s.replace(/__PARAM_TARGET_CONFIG_BLOCK__/g, targetConfigBlock);
    s = s.replace(/__PARAM_WORKSPACE_INIT_BLOCK__/g, workspaceInitBlock);
    s = s.replace(/__PARAM_PATH__/g, cleanRawPath);
    s = s.replace(/__PARAM_USERNAME__/g, username);
    s = s.replace(/__PARAM_TOKEN__/g, token);
    s = s.replace(/__PARAM_REPO__/g, repo);
    s = s.replace(/__PARAM_BRANCH__/g, resolvedBranch);
    s = s.replace(/__PARAM_COMMIT__/g, escapedCommit);
    s = s.replace(/__PARAM_COMMIT_TIME_ENABLED__/g, commitTimeEnabled ? 'true' : 'false');
    s = s.replace(/__PARAM_REPO_META_ENABLED__/g, repoMetaEnabled ? 'true' : 'false');
    s = s.replace(/__PARAM_REPO_TOPICS_JSON__/g, cleanTopicsJson);
    s = s.replace(/__PARAM_REPO_TOPICS__/g, cleanTopicsCsv);
    s = s.replace(/__PARAM_REPO_DESC__/g, escapedRepoDesc);
    s = s.replace(/__PARAM_README_DETECTOR_ENABLED__/g, readmeDetectorEnabled ? 'true' : 'false');
    s = s.replace(/__PARAM_README_DETECTOR_MODE__/g, readmeDetectorMode);
    s = s.replace(/__PARAM_LFS_ENABLED__/g, lfsActive ? 'true' : 'false');
    s = s.replace(/__PARAM_LFS_EXTS__/g, combinedLfsExts);
    s = s.replace(/__PARAM_LFS_SIZE__/g, resolvedLfsSize);
    s = s.replace(/__PARAM_RELEASE_ENABLED__/g, releaseEnabled ? 'true' : 'false');
    s = s.replace(/__PARAM_RELEASE_MODE__/g, releaseMode);
    s = s.replace(/__PARAM_RELEASE_BUMP__/g, releaseBump);
    s = s.replace(/__PARAM_RELEASE_TAG__/g, escapedReleaseTag);
    s = s.replace(/__PARAM_RELEASE_NOTES__/g, escapedReleaseNotes);
  }
  return s;
}
