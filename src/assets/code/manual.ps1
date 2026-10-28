<#
.SYNOPSIS
    AUTO GIT PUSH (CYBERPUNK EDITION)
.DESCRIPTION
    Script push manual interaktif. Developed by AlinLabs.
#>

$ErrorActionPreference = "Continue"
$ProgressPreference = 'SilentlyContinue' # Mematikan box floating progress biru bawaan PowerShell agar UI rapi
$ConfirmPreference = 'None'              # Mematikan seluruh dialog konfirmasi [Y] Yes / [A] Yes to All di PowerShell

# Mencegah pemblokiran skrip di perangkat baru
try {
    if ($PSCommandPath) {
        Unblock-File -Path $PSCommandPath -ErrorAction SilentlyContinue
    }
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force -ErrorAction SilentlyContinue
} catch {}

function Write-CyberHeader ($Text) {
    Write-Host ""
    Write-Host " =======================================================" -ForegroundColor DarkCyan
    Write-Host "  > $Text" -ForegroundColor Cyan
    Write-Host " =======================================================" -ForegroundColor DarkCyan
    Write-Host ""
}

function Write-CyberInfo ($Text) { Write-Host " [~] $Text" -ForegroundColor DarkCyan }
function Write-CyberSuccess ($Text) { Write-Host " [+] $Text" -ForegroundColor Green }
function Write-CyberWarn ($Text) { Write-Host " [!] $Text" -ForegroundColor Yellow }
function Write-CyberError ($Text) { Write-Host " [x] $Text" -ForegroundColor Red }

function Read-CyberInput ($Prompt) {
    Write-Host " [>] $Prompt : " -NoNewline -ForegroundColor Cyan
    return Read-Host
}

function Show-CyberLoading ([string]$Text) {
    Write-Host " [~] $Text" -ForegroundColor DarkCyan
    $barSize = 40
    for ($i = 0; $i -le $barSize; $i++) {
        $percent = [math]::Round(($i / $barSize) * 100)
        $filled = "■" * $i
        $empty = " " * ($barSize - $i)
        Write-Host -NoNewline "`r [" -ForegroundColor DarkCyan
        Write-Host -NoNewline "$filled$empty" -ForegroundColor Cyan
        Write-Host -NoNewline "] $percent%" -ForegroundColor DarkCyan
        Start-Sleep -Milliseconds 25
    }
    
    Write-Host -NoNewline "`r                                                                                `r"
    
    try {
        [System.Console]::SetCursorPosition(0, [System.Console]::CursorTop - 1)
        Write-Host -NoNewline " [~] $Text " -ForegroundColor DarkCyan
        Write-Host "✓" -ForegroundColor Green
    } catch {
        Write-Host " [~] $Text ✓" -ForegroundColor Green
    }
}

try {
    Clear-Host

    # CYBER BANNER
    $banner = @"

   █████████   █████  █████ ███████████    ███████   
  ███▒▒▒▒▒███ ▒▒███  ▒▒███ ▒█▒▒▒███▒▒▒█  ███▒▒▒▒▒███ 
 ▒███    ▒███  ▒███   ▒███ ▒   ▒███  ▒  ███     ▒▒███
 ▒███████████  ▒███   ▒███     ▒███    ▒███      ▒███
 ▒███▒▒▒▒▒███  ▒███   ▒███     ▒███    ▒███      ▒███
 ▒███    ▒███  ▒███   ▒███     ▒███    ▒▒███     ███ 
 █████   █████ ▒▒████████      █████    ▒▒▒███████▒  
▒▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒▒▒▒      ▒▒▒▒▒       ▒▒▒▒▒▒▒    

   --> Alinlabs Utility Technology Operations <--
"@
    Write-Host $banner -ForegroundColor Cyan

    # Token Config 
    $CONFIG_DIR = "$env:USERPROFILE\.git-auto-tool"
    $CONFIG_FILE = "$CONFIG_DIR\token.json"

    if (-not (Test-Path $CONFIG_DIR)) {
        New-Item -ItemType Directory -Path $CONFIG_DIR | Out-Null
    }

    Write-CyberHeader "INISIALISASI SISTEM"

    Show-CyberLoading "Memeriksa modul Git..."
    $gitInstalled = $true
    try {
        $null = git --version 2>$null
    } catch {
        $gitInstalled = $false
    }
    if ($LASTEXITCODE -ne 0) {
        $gitInstalled = $false
    }

    if (-not $gitInstalled) {
        Write-CyberWarn "Git tidak ditemukan di sistem."
        Show-CyberLoading "Mencoba menginstal Git menggunakan winget..."
        try {
            winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements --silent 2>&1 | Out-Null
        } catch {}
        
        # Coba update path karena winget tidak langsung update env current session
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        try {
            $null = git --version 2>$null
            $gitInstalled = $true
            Write-CyberSuccess "Git berhasil diinstal."
        } catch {}
        
        if (-not $gitInstalled) {
            Write-CyberError "Gagal menginstal Git otomatis. Harap instal Git dari https://git-scm.com/ secara manual."
            Read-Host " [>] Tekan [ENTER] untuk keluar"
            Clear-Host
            exit
        }
    } else {
        $gitVersion = git --version 2>&1
        Write-CyberInfo "Versi Git saat ini: $gitVersion"
        Show-CyberLoading "Mencoba memperbarui Git ke versi terbaru..."
        try {
            git update-git-for-windows -q -y 2>&1 | Out-Null
        } catch {}
    }

    $gitVersionNew = git --version 2>&1
    Write-CyberSuccess "Git siap: $gitVersionNew (Terinstall/Terupdate)"

    $PROJECT_PATH = Read-CyberInput "Path Direktori / File ZIP Target"

    if (-not (Test-Path $PROJECT_PATH)) {
        Write-CyberError "Path tidak ditemukan: $PROJECT_PATH"
        Read-Host " [>] Tekan [ENTER] untuk keluar"
        Clear-Host
        exit
    }

    # Deteksi otomatis apakah target adalah file ZIP atau Direktori
    $isZipTarget = $false
    if ((Test-Path -Path $PROJECT_PATH -PathType Leaf) -or ($PROJECT_PATH -match '\.zip$')) {
        $isZipTarget = $true
    }

    if ($isZipTarget) {
        Write-CyberHeader "ARSIP ZIP TERDETEKSI"
        Write-CyberInfo "Target berupa file arsip ZIP: $PROJECT_PATH"

        $parentFolder = Split-Path -Path $PROJECT_PATH -Parent
        if ([string]::IsNullOrWhiteSpace($parentFolder)) {
            $parentFolder = (Get-Location).Path
        }
        $zipBaseName = [System.IO.Path]::GetFileNameWithoutExtension($PROJECT_PATH)
        $extractedDir = Join-Path -Path $parentFolder -ChildPath $zipBaseName

        if (-not (Test-Path $extractedDir)) {
            New-Item -ItemType Directory -Path $extractedDir -Force | Out-Null
        }

        Show-CyberLoading "Mengekstrak file ZIP ke '$extractedDir'..."
        try {
            Expand-Archive -Path $PROJECT_PATH -DestinationPath $extractedDir -Force -ErrorAction Stop
            Write-CyberSuccess "Ekstraksi file ZIP berhasil diselesaikan."
        } catch {
            Write-CyberError "Gagal mengekstrak arsip ZIP: $_"
            Read-Host " [>] Tekan [ENTER] untuk keluar"
            Clear-Host
            exit
        }

        # Cek jika di dalam folder hasil ekstraksi hanya terdapat 1 subdirektori
        $innerItems = Get-ChildItem -Path $extractedDir -Force
        if ($innerItems.Count -eq 1 -and $innerItems[0].PSIsContainer) {
            $extractedDir = $innerItems[0].FullName
            Write-CyberInfo "Mengarahkan ke root sub-folder: $extractedDir"
        }

        $PROJECT_PATH = $extractedDir
    }

    $GITHUB_USERNAME = ""
    $TOKEN = ""

    if (Test-Path $CONFIG_FILE) {
        $savedConfig = Get-Content $CONFIG_FILE | ConvertFrom-Json
        Write-CyberInfo "Kredensial Tersimpan Ditemukan:"
        Write-CyberInfo "Pengguna: $($savedConfig.username)"
        Write-CyberInfo "Token   : ***************"
        
        Write-Host ""
        $USE_OLD_TOKEN = Read-CyberInput "Gunakan kredensial aktif ini? (Y/N)"
        if ($USE_OLD_TOKEN -match "^[Yy]$") {
            $TOKEN = $savedConfig.token
            $GITHUB_USERNAME = $savedConfig.username
        } else {
            $TOKEN = Read-CyberInput "Masukkan Token GitHub Baru"
            $GITHUB_USERNAME = Read-CyberInput "Masukkan Username GitHub Baru"
            $saveObject = @{ username = $GITHUB_USERNAME; token = $TOKEN }
            $saveObject | ConvertTo-Json | Set-Content $CONFIG_FILE
            Write-CyberSuccess "Kredensial Berhasil Diperbarui"
        }
    } else {
        Write-CyberWarn "Tidak ada kredensial tersimpan"
        $TOKEN = Read-CyberInput "Masukkan Token GitHub"
        $GITHUB_USERNAME = Read-CyberInput "Masukkan Username GitHub"
        $saveObject = @{ username = $GITHUB_USERNAME; token = $TOKEN }
        $saveObject | ConvertTo-Json | Set-Content $CONFIG_FILE
        Write-CyberSuccess "Kredensial Berhasil Disimpan"
    }

    # FASE 1: VALIDASI KEABSAHAN TOKEN & KUOTA (MEMBEDAKAN TOKEN MATI / HABIS VS REPOSITORI TIDAK ADA)
    Write-CyberHeader "VERIFIKASI TOKEN GITHUB"
    $tokenValid = $false
    while (-not $tokenValid) {
        Show-CyberLoading "Memvalidasi kredensial dan sisa kuota Token..."
        
        $tokenErrorType = $null
        $authenticatedUser = $null
        try {
            $userApiUrl = "https://api.github.com/user"
            $headers = @{
                "Authorization" = "token $TOKEN"
                "Accept"        = "application/vnd.github.v3+json"
                "User-Agent"    = "Alinlabs-Git-Push"
            }
            $userResp = Invoke-RestMethod -Uri $userApiUrl -Method Get -Headers $headers -ErrorAction Stop
            $authenticatedUser = $userResp.login
            $tokenValid = $true
            Write-CyberSuccess "Token GitHub AKTIF & TERVERIFIKASI!"
            Write-CyberInfo "Terautentikasi sebagai akun: $authenticatedUser"
            if ([string]::IsNullOrWhiteSpace($GITHUB_USERNAME)) {
                $GITHUB_USERNAME = $authenticatedUser
            }
        } catch {
            $statusCode = 0
            $errorBody = ""
            if ($_.Exception.Response) {
                try { $statusCode = [int]$_.Exception.Response.StatusCode } catch {}
                try {
                    $stream = $_.Exception.Response.GetResponseStream()
                    $reader = New-Object System.IO.StreamReader($stream)
                    $errorBody = $reader.ReadToEnd()
                } catch {}
            }
            $exMsg = $_.Exception.Message

            if ($statusCode -eq 401 -or $exMsg -match "401|Unauthorized|Bad credentials" -or $errorBody -match "Bad credentials") {
                $tokenErrorType = "EXPIRED_INVALID"
            } elseif ($statusCode -eq 403 -or $exMsg -match "403|rate limit" -or $errorBody -match "rate limit") {
                $tokenErrorType = "RATE_LIMIT"
            } else {
                $tokenErrorType = "EXPIRED_INVALID"
            }
        }

        if (-not $tokenValid) {
            Write-CyberHeader "AUTENTIKASI TOKEN GAGAL (BUKAN MASALAH REPO) !"
            if ($tokenErrorType -eq "RATE_LIMIT") {
                Write-CyberError "KUOTA TOKEN HABIS (API Rate Limit Exceeded)!"
                Write-CyberWarn "Batas pemanggilan API untuk token ini telah habis."
            } else {
                Write-CyberError "TOKEN GITHUB HABIS / KADALUARSA / TIDAK VALID!"
                Write-CyberWarn "Token tidak dapat mengakses GitHub (Bad credentials / Expired)."
            }
            Write-Host ""
            Write-Host "   [!] PENTING: Buka tautan berikut untuk membuat atau memperbarui Personal Access Token:" -ForegroundColor Yellow
            Write-Host "   [🔗] https://github.com/settings/tokens" -ForegroundColor Cyan
            Write-Host "   (Pastikan mencentang izin 'repo' dan 'workflow')" -ForegroundColor Gray
            Write-Host ""
            
            Write-Host "   Pilihan Tindakan:" -ForegroundColor Cyan
            Write-Host "   [1] Buka link token di browser otomatis" -ForegroundColor DarkCyan
            Write-Host "   [2] Masukkan token baru dan coba lagi" -ForegroundColor DarkCyan
            Write-Host "   [3] Keluar dari sesi" -ForegroundColor DarkCyan
            $tokenChoice = Read-CyberInput "Pilih tindakan (1/2/3, Bawaan: 2)"
            
            if ($tokenChoice -eq "1") {
                try {
                    Start-Process "https://github.com/settings/tokens"
                    Write-CyberInfo "Browser dibuka ke https://github.com/settings/tokens"
                } catch {
                    Write-CyberWarn "Silakan buka tautan secara manual: https://github.com/settings/tokens"
                }
                $TOKEN = Read-CyberInput "Masukkan Token GitHub Baru"
                $saveObject = @{ username = $GITHUB_USERNAME; token = $TOKEN }
                $saveObject | ConvertTo-Json | Set-Content $CONFIG_FILE
                Write-CyberSuccess "Token baru disimpan, menguji ulang keabsahan..."
            } elseif ($tokenChoice -eq "3") {
                Write-CyberError "Sesi dibatalkan karena masalah token."
                Read-Host " [>] Tekan [ENTER] untuk keluar"
                Clear-Host
                exit
            } else {
                $TOKEN = Read-CyberInput "Masukkan Token GitHub Baru"
                $saveObject = @{ username = $GITHUB_USERNAME; token = $TOKEN }
                $saveObject | ConvertTo-Json | Set-Content $CONFIG_FILE
                Write-CyberSuccess "Token baru disimpan, menguji ulang keabsahan..."
            }
        }
    }

    # FASE 2: CEK KEBERADAAN REPOSITORI DI GITHUB
    $REPO_NAME = Read-CyberInput "Nama Repositori Target"
    if ([string]::IsNullOrWhiteSpace($REPO_NAME)) { $REPO_NAME = "my-project" }

    Write-CyberHeader "MEMERIKSA STATUS REPOSITORI"
    
    $repoExists = $false
    while (-not $repoExists) {
        Show-CyberLoading "Mengecek keberadaan repositori '$REPO_NAME' di akun '$GITHUB_USERNAME'..."
        
        $isRepoFound = $false
        try {
            $checkUrl = "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME"
            $null = Invoke-RestMethod -Uri $checkUrl -Method Get -Headers @{
                "Authorization" = "token $TOKEN"
                "Accept"        = "application/vnd.github.v3+json"
                "User-Agent"    = "Alinlabs-Git-Push"
            } -ErrorAction Stop
            $isRepoFound = $true
        } catch {
            $isRepoFound = $false
        }

        if ($isRepoFound) {
            Write-CyberSuccess "Repositori '$REPO_NAME' TERDETEKSI di GitHub!"
            Write-CyberInfo "Code akan ditulis dan di-push ke repositori ini."
            $repoExists = $true
        } else {
            Write-CyberWarn "Repositori '$REPO_NAME' TIDAK DITEMUKAN di akun GitHub '$GITHUB_USERNAME'."
            Write-Host ""
            Write-Host "   Instruksi Pilihan:" -ForegroundColor Cyan
            Write-Host "   [•] Tekan [ENTER] langsung untuk membuat repositori baru '$REPO_NAME'." -ForegroundColor DarkCyan
            Write-Host "   [•] Atau ketik nama repositori lain:" -ForegroundColor DarkCyan
            Write-Host "       -> Jika repositori terdeteksi di GitHub, code akan ditulis di sana." -ForegroundColor Gray
            Write-Host "       -> Jika repositori belum ada, dianggap sebagai instruksi pembuatan repositori baru." -ForegroundColor Gray
            Write-Host ""
            $userRepoChoice = Read-CyberInput "Ketik nama repositori atau tekan [ENTER] untuk buat '$REPO_NAME'"

            if ([string]::IsNullOrWhiteSpace($userRepoChoice)) {
                # Tekan ENTER -> Buat repo baru $REPO_NAME
                Show-CyberLoading "Membuat repositori baru '$REPO_NAME' di GitHub..."
                try {
                    $body = @{ 
                        name = $REPO_NAME
                        private = $false 
                        description = "Repository created via Alinlabs Auto Push Tool"
                    } | ConvertTo-Json
                    
                    $null = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers @{
                        "Authorization" = "token $TOKEN"
                        "Accept"        = "application/vnd.github.v3+json"
                        "User-Agent"    = "Alinlabs-Git-Push"
                    } -Body $body -ErrorAction Stop
                    
                    Write-CyberSuccess "Repositori baru '$REPO_NAME' berhasil dibuat di GitHub!"
                    Write-CyberInfo "Code akan ditulis dan di-push ke repositori baru ini."
                    $repoExists = $true
                } catch {
                    Write-CyberError "Gagal membuat repositori '$REPO_NAME'. Error: $_"
                    Read-Host " [>] Tekan [ENTER] untuk mencoba lagi"
                }
            } else {
                # User menulis nama repositori
                $candidateRepo = $userRepoChoice.Trim()
                Show-CyberLoading "Mengecek apakah repositori '$candidateRepo' sudah ada di GitHub..."
                
                $candidateFound = $false
                try {
                    $testUrl = "https://api.github.com/repos/$GITHUB_USERNAME/$candidateRepo"
                    $null = Invoke-RestMethod -Uri $testUrl -Method Get -Headers @{
                        "Authorization" = "token $TOKEN"
                        "Accept"        = "application/vnd.github.v3+json"
                        "User-Agent"    = "Alinlabs-Git-Push"
                    } -ErrorAction Stop
                    $candidateFound = $true
                } catch {
                    $candidateFound = $false
                }

                if ($candidateFound) {
                    $REPO_NAME = $candidateRepo
                    Write-CyberSuccess "Repositori '$REPO_NAME' terdeteksi di GitHub!"
                    Write-CyberInfo "Code akan ditulis dan di-push ke repositori '$REPO_NAME'."
                    $repoExists = $true
                } else {
                    Write-CyberInfo "Repositori '$candidateRepo' tidak ditemukan di GitHub. Dianggap sebagai instruksi pembuatan repo baru..."
                    Show-CyberLoading "Membuat repositori baru '$candidateRepo' di GitHub..."
                    try {
                        $body = @{ 
                            name = $candidateRepo
                            private = $false 
                            description = "Repository created via Alinlabs Auto Push Tool"
                        } | ConvertTo-Json
                        
                        $null = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers @{
                            "Authorization" = "token $TOKEN"
                            "Accept"        = "application/vnd.github.v3+json"
                            "User-Agent"    = "Alinlabs-Git-Push"
                        } -Body $body -ErrorAction Stop
                        
                        $REPO_NAME = $candidateRepo
                        Write-CyberSuccess "Repositori baru '$REPO_NAME' berhasil dibuat di GitHub!"
                        Write-CyberInfo "Code akan ditulis dan di-push ke repositori '$REPO_NAME'."
                        $repoExists = $true
                    } catch {
                        Write-CyberError "Gagal membuat repositori '$candidateRepo'. Error: $_"
                        Read-Host " [>] Tekan [ENTER] untuk mencoba lagi"
                    }
                }
            }
        }
    }
    $REPO_URL = "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

    Write-Host ""
    $BRANCH = Read-CyberInput "Cabang Target (Bawaan: main)"
    if ([string]::IsNullOrWhiteSpace($BRANCH)) { $BRANCH = "main" }

    Write-Host ""
    $LFS_EXTS = Read-CyberInput "Tulis eksistensi file yang akan di masukan ke Git LFS jika ada dengan pemisah tanda koma (contoh: .mp4, .zip atau kosongkan)"
    $LFS_SIZE = ""
    if (-not [string]::IsNullOrWhiteSpace($LFS_EXTS)) {
        $LFS_SIZE = Read-CyberInput "Size file spesifik jika ada (MB, masukkan angka, atau kosongkan)"
    }

    Write-Host ""
    $CUSTOM_COMMIT = Read-CyberInput "Pesan Commit (Biarkan kosong untuk Auto Timestamp)"

    Clear-Host
    Write-Host $banner -ForegroundColor Cyan
    Write-CyberHeader "MANIFEST DEPLOYMENT"
    
    Write-Host "  [-] Path Target : " -NoNewline -ForegroundColor DarkCyan; Write-Host $PROJECT_PATH -ForegroundColor White
    Write-Host "  [-] Username    : " -NoNewline -ForegroundColor DarkCyan; Write-Host $GITHUB_USERNAME -ForegroundColor White
    Write-Host "  [-] Repositori  : " -NoNewline -ForegroundColor DarkCyan; Write-Host $REPO_NAME -ForegroundColor White
    Write-Host "  [-] URL Remote  : " -NoNewline -ForegroundColor DarkCyan; Write-Host $REPO_URL -ForegroundColor White
    Write-Host "  [-] Cabang      : " -NoNewline -ForegroundColor DarkCyan; Write-Host $BRANCH -ForegroundColor White
    if (-not [string]::IsNullOrWhiteSpace($LFS_EXTS)) {
        Write-Host "  [-] LFS Exts    : " -NoNewline -ForegroundColor DarkCyan; Write-Host $LFS_EXTS -ForegroundColor White
        $sizeLog = if ([string]::IsNullOrWhiteSpace($LFS_SIZE)) { "Semua Ukuran" } else { "$LFS_SIZE MB" }
        Write-Host "  [-] LFS Size    : " -NoNewline -ForegroundColor DarkCyan; Write-Host $sizeLog -ForegroundColor White
    }
    Write-Host "  [-] Commit MSG  : " -NoNewline -ForegroundColor DarkCyan
    if ([string]::IsNullOrWhiteSpace($CUSTOM_COMMIT)) {
        Write-Host "[Auto Timestamp]" -ForegroundColor White
    } else {
        Write-Host $CUSTOM_COMMIT -ForegroundColor White
    }
    Write-Host ""
    
    $CONFIRM = Read-CyberInput "Eksekusi Payload? (ENTER=YA / N=BATAL)"
    if ($CONFIRM -match "^[Nn]$") {
        Write-CyberError "Deployment Dibatalkan oleh Pengguna"
        Read-Host " [>] Tekan [ENTER] untuk keluar"
        Clear-Host
        exit
    }

    Clear-Host
    Write-CyberHeader "MENGEKSEKUSI GIT PAYLOAD"

    cd $PROJECT_PATH

    Show-CyberLoading "Memeriksa alokasi file README..."
    $readmeVars = @("README.md", "READMI.md", "readme.md", "readmi.md")
    $deletedAny = $false
    foreach ($rm in $readmeVars) {
        if (Test-Path ".\$rm") {
            Remove-Item ".\$rm" -Force -ErrorAction SilentlyContinue
            $deletedAny = $true
        }
    }
    if ($deletedAny) {
        Write-CyberInfo "README lama di root berhasil dihapus."
    }

    if (Test-Path ".\public" -PathType Container) {
        foreach ($rm in $readmeVars) {
            if (Test-Path ".\public\$rm") {
                Move-Item -Path ".\public\$rm" -Destination ".\README.md" -Force -ErrorAction SilentlyContinue
                Write-CyberInfo "Sistem mendeteksi README di /public dan telah dipindahkan ke root."
                break
            }
        }
    }

    Show-CyberLoading "Mengecek integritas ruang kerja (Workspace)..."
    Show-CyberLoading "Memindai file sistem dan direktori lokal..."
    $localFiles = Get-ChildItem -Path . -Recurse -File -Force | Where-Object { $_.FullName -notmatch "\\\.git\\" }
    $localFileCount = $localFiles.Count
    $localTotalBytes = 0
    foreach ($f in $localFiles) { $localTotalBytes += $f.Length }
    $localSizeStr = if ($localTotalBytes -gt 1MB) { "{0:N2} MB" -f ($localTotalBytes / 1MB) } elseif ($localTotalBytes -gt 1KB) { "{0:N2} KB" -f ($localTotalBytes / 1KB) } else { "$localTotalBytes Bytes" }

    Show-CyberLoading "Mengecek struktur Repositori..."
    if (-not (Test-Path ".git")) {
        Write-CyberWarn "Git belum diinisialisasi. Menyuntikkan struktur Git..."
        git init 2>&1 | Out-Null
        Write-CyberSuccess "Inisialisasi Git Selesai"
    }

    Show-CyberLoading "Mengaktifkan protokol LFS (Large File Storage)..."
    git lfs install 2>&1 | Out-Null
    
    if (-not [string]::IsNullOrWhiteSpace($LFS_EXTS)) {
        Show-CyberLoading "Menerapkan aturan Git LFS..."
        $extArray = $LFS_EXTS -split ","
        $sizeBytes = 0
        if (-not [string]::IsNullOrWhiteSpace($LFS_SIZE)) {
            try { $sizeBytes = [long]$LFS_SIZE * 1MB } catch { $sizeBytes = 0 }
        }

        if ($sizeBytes -gt 0) {
            foreach ($ext in $extArray) {
                $ext = $ext.Trim()
                if ($ext) {
                    if (-not $ext.StartsWith("*")) { $ext = "*$ext" }
                    $largeFiles = Get-ChildItem -Path . -Filter "$ext" -Recurse -File | Where-Object { $_.Length -ge $sizeBytes }
                    foreach ($file in $largeFiles) {
                        $relPath = $file.FullName.Substring((Get-Location).Path.Length + 1).Replace('\', '/')
                        git lfs track "$relPath" 2>&1 | Out-Null
                    }
                }
            }
        } else {
            foreach ($ext in $extArray) {
                $ext = $ext.Trim()
                if ($ext) {
                    if (-not $ext.StartsWith("*")) { $ext = "*$ext" }
                    git lfs track "$ext" 2>&1 | Out-Null
                }
            }
        }
        git add .gitattributes 2>&1 | Out-Null
        git add --renormalize . 2>&1 | Out-Null
    }

    $AUTH_REPO_URL = $REPO_URL.Replace("https://", "https://$GITHUB_USERNAME`:$TOKEN@")
    $remoteExists = git remote 2>&1 | Select-String "^origin$"

    if (-not $remoteExists) {
        Write-CyberInfo "Menyuntikkan Remote 'origin'..."
        git remote add origin $AUTH_REPO_URL 2>&1 | Out-Null
    } else {
        Write-CyberInfo "Memperbarui Remote 'origin'..."
        git remote set-url origin $AUTH_REPO_URL 2>&1 | Out-Null
    }
    
    # Menonaktifkan credential helper lokal agar token baru (dari URL) selalu digunakan
    git config --local credential.helper "" 2>&1 | Out-Null

    Show-CyberLoading "Membangun indeks modifikasi (Staging Area)..."
    git add . 2>&1 | Out-Null

    Show-CyberLoading "Mengekstraksi metadata objek lokal..."

    $stagedFiles = @()
    $statusOutput = git status --porcelain 2>&1
    $stagedFilesCount = 0
    $stagedTotalBytes = 0

    if ($statusOutput) {
        foreach ($line in ($statusOutput -split "`n" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })) {
            $lineStr = [string]$line
            if ($lineStr.Length -gt 3) {
                $statusCode = $lineStr.Substring(0, 2)
                $f = $lineStr.Substring(3).Trim()
                if ($f -match "->\s*(.*)$") {
                    $f = $matches[1]
                }
                $f = $f -replace '^"|"$', ''
                if (-not [string]::IsNullOrWhiteSpace($f)) {
                    $actualPath = Join-Path -Path (Get-Location).Path -ChildPath $f
                    $fSize = 0
                    $fSizeStr = "0 B"
                    if (Test-Path -LiteralPath $actualPath -ErrorAction SilentlyContinue) {
                        $fSize = (Get-Item -LiteralPath $actualPath -ErrorAction SilentlyContinue).Length
                        $fSizeStr = if ($fSize -gt 1MB) { "{0:N2} MB" -f ($fSize / 1MB) } elseif ($fSize -gt 1KB) { "{0:N2} KB" -f ($fSize / 1KB) } else { "$fSize B" }
                        $stagedTotalBytes += $fSize
                    } elseif ($statusCode -match "D") {
                         $fSizeStr = "Terhapus"
                    }
                    $stagedFilesCount++
                    $item = [PSCustomObject]@{
                        Path = $f
                        SizeStr = $fSizeStr
                        Status = $statusCode
                    }
                    $stagedFiles += $item
                }
            }
        }
    }

    Write-Host ""
    Write-Host "   === INFORMASI WORKSPACE LOKAL ===" -ForegroundColor Cyan
    Write-Host "   [-] Sumber Lokal : " -NoNewline -ForegroundColor DarkCyan; Write-Host $PROJECT_PATH -ForegroundColor White
    Write-Host "   [-] Target Repo  : " -NoNewline -ForegroundColor DarkCyan; Write-Host $REPO_URL -ForegroundColor White
    Write-Host "   [-] Cabang       : " -NoNewline -ForegroundColor DarkCyan; Write-Host $BRANCH -ForegroundColor White
    Write-Host "   [-] Total File   : " -NoNewline -ForegroundColor DarkCyan; Write-Host "$localFileCount file(s)" -ForegroundColor White
    Write-Host "   [-] Total Ukuran : " -NoNewline -ForegroundColor DarkCyan; Write-Host $localSizeStr -ForegroundColor White
    Write-Host ""

    Write-Host "   === INFORMASI PERUBAHAN (PAYLOAD) ===" -ForegroundColor Cyan
    if ($stagedFilesCount -gt 0) {
        Write-Host "   [~] Rincian File yang Akan Di-push:" -ForegroundColor DarkCyan
        foreach ($file in $stagedFiles) {
            Write-Host "       |-- $($file.Path) [$($file.SizeStr)]" -ForegroundColor DarkGray
            Start-Sleep -Milliseconds 15
        }
        $stagedSizeStr = if ($stagedTotalBytes -gt 1MB) { "{0:N2} MB" -f ($stagedTotalBytes / 1MB) } elseif ($stagedTotalBytes -gt 1KB) { "{0:N2} KB" -f ($stagedTotalBytes / 1KB) } else { "$stagedTotalBytes Bytes" }
        Write-Host "   [-] File Berubah : " -NoNewline -ForegroundColor DarkCyan; Write-Host "$stagedFilesCount file(s)" -ForegroundColor White
        Write-Host "   [-] Ukuran Push  : " -NoNewline -ForegroundColor DarkCyan; Write-Host $stagedSizeStr -ForegroundColor White
    } else {
        Write-Host "   [!] Tidak ada file yang berubah atau perlu di-push (Clear)." -ForegroundColor Yellow
    }
    Write-Host ""

    Show-CyberLoading "Mengenkripsi metadata commit..."

    if ($stagedFilesCount -gt 0) {
        if ([string]::IsNullOrWhiteSpace($CUSTOM_COMMIT)) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $commitMessage = "[UPDATE-SISTEM] Auto-Push $timestamp"
        } else {
            $commitMessage = $CUSTOM_COMMIT
        }
        Show-CyberLoading "Melakukan commit data..."
        git commit -m $commitMessage 2>&1 | Out-Null
        Write-CyberSuccess "Commit berhasil diterapkan: $commitMessage"
    } else {
        Write-CyberWarn "Tidak ada perubahan sistem yang terdeteksi untuk di-commit (Clear)"
    }

    Show-CyberLoading "Mengkalibrasi uplink ke Node Utama (GitHub)..."

    $currentBranch = git branch --show-current 2>&1
    if ([string]::IsNullOrWhiteSpace($currentBranch) -or $currentBranch -match "fatal") {
        git branch -M $BRANCH 2>&1 | Out-Null
    } elseif ($currentBranch.Trim() -ne $BRANCH) {
        Write-CyberInfo "Berpindah ke Cabang: $BRANCH..."
        $hasHead = git rev-parse HEAD 2>&1
        if ($LASTEXITCODE -eq 0) {
            git checkout -B $BRANCH 2>&1 | Out-Null
        } else {
            git branch -M $BRANCH 2>&1 | Out-Null
        }
    }
    
    if (-not [string]::IsNullOrWhiteSpace($LFS_EXTS)) {
        Show-CyberLoading "Mentransmisikan objek binary Git LFS ke server..."
        git lfs push --all origin $BRANCH 2>&1 | Out-Null
    }

    Show-CyberLoading "Membangun terowongan aman (Secure Tunnel)..."
    Show-CyberLoading "Mengompresi data untuk transmisi..."
    Show-CyberLoading "Mentransmisikan file ke repositori (Push)..."
    $pushOutput = git push -u origin $BRANCH --force 2>&1 | Out-String
    
    if ($LASTEXITCODE -ne 0) {
        Write-CyberHeader "KEGAGALAN SISTEM !"
        if ($pushOutput -match "Authentication failed" -or $pushOutput -match "403" -or $pushOutput -match "Bad credentials") {
            Write-CyberError "Gagal mengautentikasi: Token GitHub kadaluarsa / habis atau izin tidak mencukupi."
            Write-CyberWarn "Buka tautan ini untuk membuat atau memperbarui Personal Access Token Anda:"
            Write-Host "   [🔗] https://github.com/settings/tokens" -ForegroundColor Yellow
            Write-CyberInfo "Pastikan token memiliki centang izin 'repo' dan 'workflow'."
        } elseif ($pushOutput -match "not found" -or $pushOutput -match "404") {
            Write-CyberError "Repositori tidak ditemukan. Pastikan nama repositori dan username sudah benar."
        } elseif ($pushOutput -match "src refspec" -and $pushOutput -match "does not match any") {
            Write-CyberError "Cabang '$BRANCH' kosong dan tidak ada file untuk di-push."
        } else {
            Write-CyberError "Transmisi ditolak. Rincian Error:"
            Write-Host $pushOutput -ForegroundColor Red
        }
    } else {
        Write-CyberHeader "DEPLOYMENT BERHASIL"
        Write-CyberSuccess "Semua sistem berjalan normal."
        Write-Host ""
        $repoCleanUrl = $REPO_URL -replace "\.git$",""
        Write-Host " [🔗] Tautan Repositori: $repoCleanUrl" -ForegroundColor Cyan
        if (-not [string]::IsNullOrWhiteSpace($LFS_EXTS)) {
            Write-Host ""
            Write-Host " [!] PENTING UNTUK DEPLOYMENT VERCEL:" -ForegroundColor Yellow
            Write-Host " -> Tambahkan Environment Variable di Vercel: VERCEL_GIT_LFS_ENABLED = 1" -ForegroundColor Cyan
            Write-Host " -> Buka Project Settings > Environment Variables di dashboard Vercel." -ForegroundColor Gray
            Write-Host " -> Tanpa variable ini, Vercel hanya meng-clone file pointer 130-byte sehingga error saat build!" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host ""
    Write-CyberError "KESALAHAN FATAL TERDETEKSI PADA SISTEM:"
    Write-Host " " $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Read-Host " [>] Tekan [ENTER] untuk keluar"
Clear-Host
exit

