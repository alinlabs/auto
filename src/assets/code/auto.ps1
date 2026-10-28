<#
.SYNOPSIS
    Cyber Auto Git-Push Script
.DESCRIPTION
    Script push otomatis dengan parameter yang sudah dikonfigurasi. Developed by AlinLabs.
#>

$ErrorActionPreference = "Continue"
$ProgressPreference = 'SilentlyContinue' # Mematikan box floating progress biru bawaan PowerShell agar UI rapi
$ConfirmPreference = 'None'              # Mematikan seluruh dialog konfirmasi [Y] Yes / [A] Yes to All di PowerShell

# =======================================================
#  KONFIGURASI PARAMETER OTOMATIS (__PARAM_MODE_LABEL__)
#  __PARAM_GIT_COMMAND_LABEL__
# =======================================================
__PARAM_TARGET_CONFIG_BLOCK__
$GIT_COMMAND_MODE = "__PARAM_GIT_COMMAND__"
$GITHUB_TOKEN     = "__PARAM_TOKEN__"
$GITHUB_USERNAME  = "__PARAM_USERNAME__"
$REPO_NAME        = "__PARAM_REPO__"
$TARGET_BRANCH    = "__PARAM_BRANCH__"
$CUSTOM_COMMIT    = "__PARAM_COMMIT__"
$USE_COMMIT_TIME  = $__PARAM_COMMIT_TIME_ENABLED__
$USE_REPO_META    = $__PARAM_REPO_META_ENABLED__
$REPO_TOPICS      = "__PARAM_REPO_TOPICS__"
$REPO_DESC        = "__PARAM_REPO_DESC__"
$USE_README_DETECTOR = $__PARAM_README_DETECTOR_ENABLED__
$README_DETECTOR_MODE = "__PARAM_README_DETECTOR_MODE__"
$USE_GIT_LFS      = $__PARAM_LFS_ENABLED__
$LFS_EXTS         = "__PARAM_LFS_EXTS__"
$LFS_SIZE         = "__PARAM_LFS_SIZE__"
$USE_GIT_RELEASE  = $__PARAM_RELEASE_ENABLED__
$RELEASE_MODE     = "__PARAM_RELEASE_MODE__"
$RELEASE_BUMP     = "__PARAM_RELEASE_BUMP__"
$RELEASE_TAG_IN   = "__PARAM_RELEASE_TAG__"
$RELEASE_NOTES_IN = "__PARAM_RELEASE_NOTES__"

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
    Write-Host @"

   █████████   █████  █████ ███████████    ███████   
  ███▒▒▒▒▒███ ▒▒███  ▒▒███ ▒█▒▒▒███▒▒▒█  ███▒▒▒▒▒███ 
 ▒███    ▒███  ▒███   ▒███ ▒   ▒███  ▒  ███     ▒▒███
 ▒███████████  ▒███   ▒███     ▒███    ▒███      ▒███
 ▒███▒▒▒▒▒███  ▒███   ▒███     ▒███    ▒███      ▒███
 ▒███    ▒███  ▒███   ▒███     ▒███    ▒▒███     ███ 
 █████   █████ ▒▒████████      █████    ▒▒▒███████▒  
▒▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒▒▒▒      ▒▒▒▒▒       ▒▒▒▒▒▒▒    

   --> Alinlabs Utility Technology Operations <--
"@ -ForegroundColor Cyan

    Write-CyberHeader "INISIALISASI SISTEM (AUTO MODE)"

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

__PARAM_WORKSPACE_INIT_BLOCK__

    if ($USE_README_DETECTOR) {
        Write-CyberHeader "README DETECTOR (PEMINDAI FILE README.MD)"

        if ($README_DETECTOR_MODE -eq "AUTO") {
            Show-CyberLoading "Memeriksa direktori public/ untuk file README.md (Auto Change)..."
            $publicReadmePath = $null
            if (Test-Path -LiteralPath ".\public" -PathType Container) {
                foreach ($rm in @("README.md", "readme.md", "READMI.md", "readmi.md")) {
                    if (Test-Path -LiteralPath ".\public\$rm" -PathType Leaf) {
                        $publicReadmePath = ".\public\$rm"
                        break
                    }
                }
            }

            if ($publicReadmePath) {
                foreach ($rm in @("README.md", "readme.md", "READMI.md", "readmi.md")) {
                    if (Test-Path -LiteralPath ".\$rm" -PathType Leaf) {
                        Remove-Item -LiteralPath ".\$rm" -Force -Confirm:$false -ErrorAction SilentlyContinue
                    }
                }
                Move-Item -LiteralPath $publicReadmePath -Destination ".\README.md" -Force -Confirm:$false -ErrorAction SilentlyContinue
                Write-CyberSuccess "Auto Change: Berkas $publicReadmePath berhasil dipindahkan ke .\README.md (Root)!"
            } else {
                Write-CyberInfo "Auto Change: Tidak ditemukan berkas README.md di direktori public/. Melanjutkan proses otomatis..."
            }
        } else {
            Show-CyberLoading "Mencari keberadaan file README.md di Root dan direktori public..."

            $readmeDone = $false
            while (-not $readmeDone) {
                $rootReadmePath = $null
                foreach ($rm in @("README.md", "readme.md", "READMI.md", "readmi.md")) {
                    if (Test-Path -LiteralPath ".\$rm" -PathType Leaf) {
                        $rootReadmePath = ".\$rm"
                        break
                    }
                }

                $publicReadmePath = $null
                if (Test-Path -LiteralPath ".\public" -PathType Container) {
                    foreach ($rm in @("README.md", "readme.md", "READMI.md", "readmi.md")) {
                        if (Test-Path -LiteralPath ".\public\$rm" -PathType Leaf) {
                            $publicReadmePath = ".\public\$rm"
                            break
                        }
                    }
                }

                if ($rootReadmePath -and $publicReadmePath) {
                    Write-CyberWarn "Terdeteksi file README.md di 2 lokasi sekaligus:"
                    Write-CyberInfo "Lokasi Root   : $rootReadmePath"
                    Write-CyberInfo "Lokasi Public : $publicReadmePath"
                    Write-Host ""
                    Write-Host "   Pilihan Tindakan Readme Detector (Manual Change):" -ForegroundColor Cyan
                    Write-Host "   [1] Pindahkan public/README.md ke Root (Menimpa README.md di Root)" -ForegroundColor DarkCyan
                    Write-Host "   [2] Buka & Cek README.md di Root menggunakan Notepad" -ForegroundColor DarkCyan
                    Write-Host "   [3] Buka & Cek public/README.md menggunakan Notepad" -ForegroundColor DarkCyan
                    Write-Host "   [4] Skip / Lanjutkan proses (Atau tekan [ENTER])" -ForegroundColor DarkCyan
                    Write-Host "   [>] Pilih opsi (1/2/3/4, Bawaan: Skip): " -NoNewline -ForegroundColor Cyan
                    $rmChoice = Read-Host

                    if ($rmChoice -eq "1") {
                        if ($rootReadmePath -ne ".\README.md") {
                            Remove-Item -LiteralPath $rootReadmePath -Force -Confirm:$false -ErrorAction SilentlyContinue
                        }
                        Move-Item -LiteralPath $publicReadmePath -Destination ".\README.md" -Force -Confirm:$false -ErrorAction SilentlyContinue
                        Write-CyberSuccess "File $publicReadmePath berhasil dipindahkan dan menimpa .\README.md di Root!"
                        Write-Host ""
                    } elseif ($rmChoice -eq "2") {
                        Write-CyberInfo "Membuka $rootReadmePath di Notepad untuk dicek dan dilihat..."
                        Start-Process notepad.exe -ArgumentList $rootReadmePath -Wait
                        Write-Host ""
                    } elseif ($rmChoice -eq "3") {
                        Write-CyberInfo "Membuka $publicReadmePath di Notepad untuk dicek dan dilihat..."
                        Start-Process notepad.exe -ArgumentList $publicReadmePath -Wait
                        Write-Host ""
                    } else {
                        Write-CyberInfo "Melewati perubahan README.md, melanjutkan proses..."
                        $readmeDone = $true
                    }
                } elseif ($publicReadmePath -and (-not $rootReadmePath)) {
                    Write-CyberWarn "Terdeteksi file README.md di direktori public: $publicReadmePath (Belum ada di Root)"
                    Write-Host ""
                    Write-Host "   Pilihan Tindakan Readme Detector (Manual Change):" -ForegroundColor Cyan
                    Write-Host "   [1] Pindahkan public/README.md ke Root (.\README.md)" -ForegroundColor DarkCyan
                    Write-Host "   [2] Buka & Cek public/README.md menggunakan Notepad" -ForegroundColor DarkCyan
                    Write-Host "   [3] Skip / Lanjutkan proses (Atau tekan [ENTER])" -ForegroundColor DarkCyan
                    Write-Host "   [>] Pilih opsi (1/2/3, Bawaan: Skip): " -NoNewline -ForegroundColor Cyan
                    $rmChoice = Read-Host

                    if ($rmChoice -eq "1") {
                        Move-Item -LiteralPath $publicReadmePath -Destination ".\README.md" -Force -Confirm:$false -ErrorAction SilentlyContinue
                        Write-CyberSuccess "File $publicReadmePath berhasil dipindahkan ke .\README.md (Root)!"
                        Write-Host ""
                    } elseif ($rmChoice -eq "2") {
                        Write-CyberInfo "Membuka $publicReadmePath di Notepad untuk dicek dan dilihat..."
                        Start-Process notepad.exe -ArgumentList $publicReadmePath -Wait
                        Write-Host ""
                    } else {
                        Write-CyberInfo "Melewati pemindahan README.md, melanjutkan proses..."
                        $readmeDone = $true
                    }
                } elseif ($rootReadmePath -and (-not $publicReadmePath)) {
                    Write-CyberSuccess "Terdeteksi file README.md di Root: $rootReadmePath"
                    Write-Host ""
                    Write-Host "   Pilihan Tindakan Readme Detector (Manual Change):" -ForegroundColor Cyan
                    Write-Host "   [1] Buka & Cek README.md di Root menggunakan Notepad" -ForegroundColor DarkCyan
                    Write-Host "   [2] Skip / Lanjutkan proses (Atau tekan [ENTER])" -ForegroundColor DarkCyan
                    Write-Host "   [>] Pilih opsi (1/2, Bawaan: Skip): " -NoNewline -ForegroundColor Cyan
                    $rmChoice = Read-Host

                    if ($rmChoice -eq "1") {
                        Write-CyberInfo "Membuka $rootReadmePath di Notepad untuk dicek dan dilihat..."
                        Start-Process notepad.exe -ArgumentList $rootReadmePath -Wait
                        Write-CyberSuccess "Pengecekan $rootReadmePath di Notepad selesai."
                        Write-Host ""
                    } else {
                        Write-CyberInfo "Melanjutkan proses eksekusi..."
                        $readmeDone = $true
                    }
                } else {
                    Write-CyberInfo "Tidak ditemukan file README.md di Root maupun di direktori public/."
                    $readmeDone = $true
                }
            }
        }
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
                "Authorization" = "token $GITHUB_TOKEN"
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
            Write-Host "   [>] Pilihan (1/2/3, Bawaan: 2): " -NoNewline -ForegroundColor Cyan
            $tokenChoice = Read-Host
            
            if ($tokenChoice -eq "1") {
                try {
                    Start-Process "https://github.com/settings/tokens"
                    Write-CyberInfo "Browser dibuka ke https://github.com/settings/tokens"
                } catch {
                    Write-CyberWarn "Silakan buka tautan secara manual: https://github.com/settings/tokens"
                }
                Write-Host "   [>] Masukkan Token GitHub Baru: " -NoNewline -ForegroundColor Cyan
                $newTokenInput = Read-Host
                if (-not [string]::IsNullOrWhiteSpace($newTokenInput)) {
                    $GITHUB_TOKEN = $newTokenInput.Trim()
                }
                Write-CyberSuccess "Menguji ulang keabsahan token..."
            } elseif ($tokenChoice -eq "3") {
                Write-CyberError "Sesi dibatalkan karena masalah token."
                Read-Host " [>] Tekan [ENTER] untuk keluar"
                Clear-Host
                exit
            } else {
                Write-Host "   [>] Masukkan Token GitHub Baru: " -NoNewline -ForegroundColor Cyan
                $newTokenInput = Read-Host
                if (-not [string]::IsNullOrWhiteSpace($newTokenInput)) {
                    $GITHUB_TOKEN = $newTokenInput.Trim()
                }
                Write-CyberSuccess "Menguji ulang keabsahan token..."
            }
        }
    }

    # FASE 2: CEK KEBERADAAN REPOSITORI DI GITHUB
    Write-CyberHeader "MEMERIKSA STATUS REPOSITORI"
    
    $repoExists = $false
    while (-not $repoExists) {
        Show-CyberLoading "Mengecek keberadaan repositori '$REPO_NAME' di akun '$GITHUB_USERNAME'..."
        
        $isRepoFound = $false
        try {
            $checkUrl = "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME"
            $null = Invoke-RestMethod -Uri $checkUrl -Method Get -Headers @{
                "Authorization" = "token $GITHUB_TOKEN"
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
            Write-Host "   [>] Ketik nama repositori atau [ENTER] untuk buat '$REPO_NAME': " -NoNewline -ForegroundColor Cyan
            $newRepoInput = Read-Host
            
            if ([string]::IsNullOrWhiteSpace($newRepoInput)) {
                # User tekan ENTER langsung -> buat repo $REPO_NAME
                Show-CyberLoading "Membuat repositori baru '$REPO_NAME' di GitHub..."
                try {
                    $body = @{ 
                        name = $REPO_NAME
                        private = $false 
                        description = "Repository created via Alinlabs Auto Push Tool"
                    } | ConvertTo-Json
                    
                    $null = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers @{
                        "Authorization" = "token $GITHUB_TOKEN"
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
                $candidateRepo = $newRepoInput.Trim()
                Show-CyberLoading "Mengecek apakah repositori '$candidateRepo' sudah ada di GitHub..."
                
                $candidateFound = $false
                try {
                    $testUrl = "https://api.github.com/repos/$GITHUB_USERNAME/$candidateRepo"
                    $null = Invoke-RestMethod -Uri $testUrl -Method Get -Headers @{
                        "Authorization" = "token $GITHUB_TOKEN"
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
                            "Authorization" = "token $GITHUB_TOKEN"
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

    if ($USE_REPO_META -and ((-not [string]::IsNullOrWhiteSpace($REPO_DESC)) -or (-not [string]::IsNullOrWhiteSpace($REPO_TOPICS)))) {
        Write-CyberHeader "SINKRONISASI TOPIC & DESKRIPSI REPOSITORY"
        if (-not [string]::IsNullOrWhiteSpace($REPO_DESC)) {
            Show-CyberLoading "Memperbarui deskripsi repositori di GitHub (Maks 350 karakter)..."
            try {
                $trimmedDesc = if ($REPO_DESC.Length -gt 350) { $REPO_DESC.Substring(0, 350) } else { $REPO_DESC }
                $descBody = @{ description = $trimmedDesc } | ConvertTo-Json -Compress
                $null = Invoke-RestMethod -Uri "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME" -Method Patch -Headers @{
                    "Authorization" = "token $GITHUB_TOKEN"
                    "Accept"        = "application/vnd.github.v3+json"
                    "User-Agent"    = "Alinlabs-Git-Push"
                    "Content-Type"  = "application/json; charset=utf-8"
                } -Body ([System.Text.Encoding]::UTF8.GetBytes($descBody)) -ErrorAction Stop
                Write-CyberSuccess "Deskripsi Repository berhasil diperbarui!"
            } catch {
                Write-CyberWarn "Gagal memperbarui deskripsi repositori: $_"
            }
        }

        if (-not [string]::IsNullOrWhiteSpace($REPO_TOPICS)) {
            Show-CyberLoading "Memperbarui topik (Topics) repositori di GitHub..."
            try {
                $topicItems = @($REPO_TOPICS -split "[,\s]+" | ForEach-Object { $_.Trim().ToLower() -replace "[^a-z0-9-]", "-" -replace "^-+|-+$", "" } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
                $topicsBody = @{ names = $topicItems } | ConvertTo-Json -Compress
                if ($topicItems.Count -eq 1) {
                    $topicsBody = "{`"names`":[`"$($topicItems[0])`"]}"
                }
                $null = Invoke-RestMethod -Uri "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/topics" -Method Put -Headers @{
                    "Authorization" = "token $GITHUB_TOKEN"
                    "Accept"        = "application/vnd.github.mercy-preview+json"
                    "User-Agent"    = "Alinlabs-Git-Push"
                    "Content-Type"  = "application/json; charset=utf-8"
                } -Body ([System.Text.Encoding]::UTF8.GetBytes($topicsBody)) -ErrorAction Stop
                Write-CyberSuccess "Topik Repository berhasil diperbarui: $($topicItems -join ', ')"
            } catch {
                Write-CyberWarn "Gagal memperbarui topik repositori: $_"
            }
        }
    }

    $remoteUrl = "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

    Show-CyberLoading "Mengecek status repositori lokal..."
    if (-not (Test-Path ".git")) {
        Write-CyberWarn "Repositori Git belum diinisialisasi. Memulai inisialisasi..."
        git init 2>&1 | Out-Null
        git branch -M $TARGET_BRANCH 2>&1 | Out-Null
        git remote add origin $remoteUrl 2>&1 | Out-Null
        Write-CyberSuccess "Repositori lokal berhasil dibuat."
    } else {
        $currentRemote = git remote get-url origin 2>$null
        if (-not $currentRemote) {
            git remote add origin $remoteUrl 2>&1 | Out-Null
            Write-CyberSuccess "Remote URL (origin) ditambahkan."
        } else {
            git remote set-url origin $remoteUrl 2>&1 | Out-Null
            Write-CyberSuccess "Remote URL (origin) diperbarui."
        }
    }
    
    # Menonaktifkan credential helper lokal agar token baru selalu digunakan (logout effect)
    git config --local credential.helper "" 2>&1 | Out-Null

    $existingGitUser = git config user.name 2>$null
    if ([string]::IsNullOrWhiteSpace($existingGitUser)) {
        git config user.name "$GITHUB_USERNAME" 2>&1 | Out-Null
    }
    $existingGitEmail = git config user.email 2>$null
    if ([string]::IsNullOrWhiteSpace($existingGitEmail)) {
        git config user.email "$GITHUB_USERNAME@users.noreply.github.com" 2>&1 | Out-Null
    }

    Write-CyberHeader "MENGEKSEKUSI GIT PAYLOAD ($GIT_COMMAND_MODE)"

    Show-CyberLoading "Mengecek integritas ruang kerja (Workspace)..."
    
    Show-CyberLoading "Memindai file sistem dan direktori lokal..."
    $localFiles = @(Get-ChildItem -Path . -Recurse -File -Force | Where-Object { $_.FullName -notmatch "\\\.git\\" })
    $localFileCount = $localFiles.Count
    $localTotalBytes = 0
    foreach ($f in $localFiles) { $localTotalBytes += $f.Length }
    $localSizeStr = if ($localTotalBytes -gt 1MB) { "{0:N2} MB" -f ($localTotalBytes / 1MB) } elseif ($localTotalBytes -gt 1KB) { "{0:N2} KB" -f ($localTotalBytes / 1KB) } else { "$localTotalBytes Bytes" }

    Show-CyberLoading "Mengambil referensi cabang '$TARGET_BRANCH' dari GitHub..."
    git fetch origin $TARGET_BRANCH 2>&1 | Out-Null
    $remoteBranchExists = $false
    $null = git rev-parse --verify "origin/$TARGET_BRANCH" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $remoteBranchExists = $true
    }

    if ($GIT_COMMAND_MODE -eq "FORCE_PUSH") {
        Write-CyberInfo "Command Git: FORCE PUSH (Menimpa semua file & menghapus yang tidak sesuai folder baru)"
        Show-CyberLoading "Mereset indeks untuk sinkronisasi penuh folder baru..."
        git checkout --orphan __cyber_force_branch__ 2>&1 | Out-Null
        git rm -rf --cached . 2>&1 | Out-Null
    } else {
        Write-CyberInfo "Command Git: PARTIAL UPDATE (Hanya mengupdate file yang berubah dari folder)"
        if ($remoteBranchExists) {
            Show-CyberLoading "Menyelaraskan state remote (mempertahankan file yang tidak disentuh)..."
            git symbolic-ref HEAD "refs/heads/$TARGET_BRANCH" 2>&1 | Out-Null
            git update-ref "refs/heads/$TARGET_BRANCH" "refs/remotes/origin/$TARGET_BRANCH" 2>&1 | Out-Null
            git read-tree "refs/remotes/origin/$TARGET_BRANCH" 2>&1 | Out-Null
        } else {
            Write-CyberInfo "Cabang '$TARGET_BRANCH' belum ada di remote. Menyiapkan inisialisasi cabang..."
            git checkout -B $TARGET_BRANCH 2>&1 | Out-Null
        }
    }

    if ($USE_GIT_LFS) {
        Show-CyberLoading "Mengaktifkan protokol LFS (Large File Storage)..."
        git lfs install 2>&1 | Out-Null
    }
    
    if ($USE_GIT_LFS -and (-not [string]::IsNullOrWhiteSpace($LFS_EXTS))) {
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
        if (Test-Path -LiteralPath ".gitattributes") {
            git add .gitattributes 2>&1 | Out-Null
        }
    }

    if ($GIT_COMMAND_MODE -eq "FORCE_PUSH") {
        Show-CyberLoading "Membangun indeks penuh seluruh file di folder baru (git add -A)..."
        git add -A 2>&1 | Out-Null
    } else {
        Show-CyberLoading "Memindai hanya file yang berubah dari folder (Partial Update)..."
        git add --ignore-removal . 2>&1 | Out-Null
    }

    # RESOLUSI VERSI & SMART SEMVER ANALYZER OTOMATIS (JIKA TAG & RELEASE AKTIF)
    $FINAL_RELEASE_TAG = ""
    $CLEAN_VERSION = ""
    if ($USE_GIT_RELEASE) {
        Write-CyberHeader "KONFIGURASI VERSI, GIT TAG & RELEASE ($RELEASE_MODE)"
        if ($RELEASE_MODE -eq "MANUAL" -and (-not [string]::IsNullOrWhiteSpace($RELEASE_TAG_IN))) {
            $rawTag = $RELEASE_TAG_IN.Trim()
            if ($rawTag.StartsWith("v") -or $rawTag.StartsWith("V")) {
                $FINAL_RELEASE_TAG = "v" + $rawTag.Substring(1)
                $CLEAN_VERSION = $rawTag.Substring(1)
            } else {
                $FINAL_RELEASE_TAG = "v$rawTag"
                $CLEAN_VERSION = $rawTag
            }
            Write-CyberInfo "Mode Versi Manual: Menggunakan Tag '$FINAL_RELEASE_TAG'"
        } else {
            Show-CyberLoading "Menganalisa skala perubahan kode secara otomatis (Smart SemVer Analyzer)..."
            $addedCount = 0
            $modifiedCount = 0
            $deletedCount = 0
            $semVerDiff = if ($remoteBranchExists) { git diff "origin/$TARGET_BRANCH" --cached --name-status 2>$null } else { git diff --cached --name-status 2>$null }
            if ($semVerDiff) {
                foreach ($dLine in ($semVerDiff -split "`n")) {
                    $trimmedLine = ([string]$dLine).Trim()
                    if ($trimmedLine -match "^A\s+") { $addedCount++ }
                    elseif ($trimmedLine -match "^D\s+") { $deletedCount++ }
                    elseif ($trimmedLine -match "^[MR C]\s*") { $modifiedCount++ }
                }
            }
            $totalChanged = $addedCount + $modifiedCount + $deletedCount
            $autoDetectedBump = "patch"
            $bumpReason = "Perbaikan/modifikasi ringan ($modifiedCount file diubah)"

            if ($CUSTOM_COMMIT -match "(?i)\b(breaking|major|rombak|arsitektur|rewrite)\b") {
                $autoDetectedBump = "major"
                $bumpReason = "Kata kunci perubahan besar (Major/Breaking) terdeteksi pada pesan commit"
            } elseif ($deletedCount -ge 5 -or ($totalChanged -ge 25 -and $deletedCount -ge 2)) {
                $autoDetectedBump = "major"
                $bumpReason = "Perubahan struktural besar (+$addedCount baru, ~$modifiedCount diubah, -$deletedCount dihapus)"
            } elseif ($CUSTOM_COMMIT -match "(?i)\b(feat|feature|fitur|minor|modul|tambah)\b") {
                $autoDetectedBump = "minor"
                $bumpReason = "Kata kunci fitur baru (Feature/Minor) terdeteksi pada pesan commit"
            } elseif ($addedCount -ge 1 -or $totalChanged -ge 5) {
                $autoDetectedBump = "minor"
                $bumpReason = "Penambahan fitur/file menengah (+$addedCount file baru, ~$modifiedCount diubah)"
            }

            Write-CyberInfo "Hasil Analisa Otomatis: +$addedCount baru, ~$modifiedCount diubah, -$deletedCount dihapus -> Level: $($autoDetectedBump.ToUpper()) ($bumpReason)"

            Show-CyberLoading "Mendeteksi versi/tag terakhir dari repositori GitHub..."
            $latestTag = ""
            try {
                $tagsUrl = "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/tags?per_page=1"
                $tagsResp = Invoke-RestMethod -Uri $tagsUrl -Method Get -Headers @{
                    "Authorization" = "token $GITHUB_TOKEN"
                    "Accept"        = "application/vnd.github.v3+json"
                    "User-Agent"    = "Alinlabs-Git-Push"
                } -ErrorAction Stop
                if ($tagsResp -and $tagsResp.Count -gt 0 -and $tagsResp[0].name) {
                    $latestTag = [string]$tagsResp[0].name
                }
            } catch {}

            if (-not [string]::IsNullOrWhiteSpace($latestTag) -and ($latestTag -match "^v?(\d+)\.(\d+)\.(\d+)")) {
                $maj = [int]$matches[1]
                $min = [int]$matches[2]
                $pat = [int]$matches[3]
                if ($autoDetectedBump -eq "major") {
                    $maj++; $min = 0; $pat = 0
                } elseif ($autoDetectedBump -eq "minor") {
                    $min++; $pat = 0
                } else {
                    $pat++
                }
                $CLEAN_VERSION = "$maj.$min.$pat"
                $FINAL_RELEASE_TAG = "v$CLEAN_VERSION"
                Write-CyberSuccess "Tag sebelumnya '$latestTag' -> Otomatis dinaikkan ($($autoDetectedBump.ToUpper())) ke '$FINAL_RELEASE_TAG'"
            } else {
                $CLEAN_VERSION = "1.0.0"
                $FINAL_RELEASE_TAG = "v1.0.0"
                Write-CyberInfo "Belum ada tag SemVer di GitHub -> Memulai rilis perdana '$FINAL_RELEASE_TAG'"
            }
        }

        if (Test-Path -LiteralPath ".\package.json" -PathType Leaf) {
            try {
                $pkgRaw = [System.IO.File]::ReadAllText((Resolve-Path ".\package.json").Path)
                if ($pkgRaw -match '"version"\s*:\s*"[^"]*"') {
                    $pkgUpdated = [regex]::Replace($pkgRaw, '"version"\s*:\s*"[^"]*"', "`"version`": `"$CLEAN_VERSION`"", 1)
                    if ($pkgUpdated -ne $pkgRaw) {
                        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
                        [System.IO.File]::WriteAllText((Resolve-Path ".\package.json").Path, $pkgUpdated, $utf8NoBom)
                        git add package.json 2>&1 | Out-Null
                        Write-CyberSuccess "Versi di package.json otomatis diperbarui ke: $CLEAN_VERSION"
                    }
                }
            } catch {}
        }
    }

    Show-CyberLoading "Mengekstraksi metadata objek yang di-stage..."

    $stagedFiles = @()
    $diffOutput = git diff --cached --name-status 2>&1
    $stagedFilesCount = 0
    $stagedTotalBytes = 0

    if ($diffOutput) {
        foreach ($line in ($diffOutput -split "`n" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })) {
            $lineStr = ([string]$line).Trim()
            $parts = $lineStr -split "\t+"
            if ($parts.Count -ge 2) {
                $statusCode = $parts[0].Trim()
                $f = $parts[$parts.Count - 1].Trim()
                $f = $f -replace '^"|"$', ''
                if (-not [string]::IsNullOrWhiteSpace($f)) {
                    $actualPath = Join-Path -Path (Get-Location).Path -ChildPath ($f.Replace('/', '\'))
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
    Write-Host "   [-] Target Repo  : " -NoNewline -ForegroundColor DarkCyan; Write-Host "github.com/$GITHUB_USERNAME/$REPO_NAME" -ForegroundColor White
    Write-Host "   [-] Cabang       : " -NoNewline -ForegroundColor DarkCyan; Write-Host $TARGET_BRANCH -ForegroundColor White
    Write-Host "   [-] Command Git  : " -NoNewline -ForegroundColor DarkCyan; Write-Host $(if ($GIT_COMMAND_MODE -eq "FORCE_PUSH") { "Force Push (Timpa Semua & Hapus Yang Tidak Sesuai)" } else { "Partial Update (Hanya Update File yang Berubah)" }) -ForegroundColor White
    Write-Host "   [-] Total File   : " -NoNewline -ForegroundColor DarkCyan; Write-Host "$localFileCount file(s)" -ForegroundColor White
    Write-Host "   [-] Total Ukuran : " -NoNewline -ForegroundColor DarkCyan; Write-Host $localSizeStr -ForegroundColor White
    Write-Host ""

    Write-Host "   === INFORMASI PERUBAHAN (PAYLOAD) ===" -ForegroundColor Cyan
    if ($stagedFilesCount -gt 0) {
        $payloadHeader = if ($GIT_COMMAND_MODE -eq "FORCE_PUSH") { "Rincian Seluruh File yang Akan Menimpa Remote (Force Push):" } else { "Rincian File yang Berubah & Akan Diperbarui (Partial Update):" }
        Write-Host "   [~] $payloadHeader" -ForegroundColor DarkCyan
        foreach ($file in $stagedFiles) {
            Write-Host "       |-- [$($file.Status)] $($file.Path) [$($file.SizeStr)]" -ForegroundColor DarkGray
            Start-Sleep -Milliseconds 15
        }
        $stagedSizeStr = if ($stagedTotalBytes -gt 1MB) { "{0:N2} MB" -f ($stagedTotalBytes / 1MB) } elseif ($stagedTotalBytes -gt 1KB) { "{0:N2} KB" -f ($stagedTotalBytes / 1KB) } else { "$stagedTotalBytes Bytes" }
        Write-Host "   [-] File Diproses: " -NoNewline -ForegroundColor DarkCyan; Write-Host "$stagedFilesCount file(s)" -ForegroundColor White
        Write-Host "   [-] Ukuran Push  : " -NoNewline -ForegroundColor DarkCyan; Write-Host $stagedSizeStr -ForegroundColor White
    } else {
        Write-Host "   [!] Tidak ada file yang berubah dibandingkan repositori remote (Clear)." -ForegroundColor Yellow
    }
    Write-Host ""

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $defaultPrefix = if ($GIT_COMMAND_MODE -eq "FORCE_PUSH") { "[FORCE-PUSH]" } else { "[PARTIAL-UPDATE]" }
    $commitMessage = if (-not [string]::IsNullOrWhiteSpace($CUSTOM_COMMIT)) {
        if ($USE_COMMIT_TIME) { "$CUSTOM_COMMIT ($timestamp)" } else { "$CUSTOM_COMMIT" }
    } else {
        if ($USE_COMMIT_TIME) { "$defaultPrefix Auto-Push $timestamp" } else { "$defaultPrefix Auto-Push" }
    }

    if ($GIT_COMMAND_MODE -eq "FORCE_PUSH") {
        Show-CyberLoading "Mengenkripsi metadata commit (Force Push)..."
        Show-CyberLoading "Melakukan commit seluruh isi folder baru..."
        git commit --allow-empty -m $commitMessage 2>&1 | Out-Null
        git branch -M $TARGET_BRANCH 2>&1 | Out-Null
        Write-CyberSuccess "Commit Force Push berhasil diterapkan: $commitMessage"

        if ($USE_GIT_LFS -and (-not [string]::IsNullOrWhiteSpace($LFS_EXTS))) {
            Show-CyberLoading "Mentransmisikan objek binary Git LFS ke server..."
            git lfs push --all origin $TARGET_BRANCH 2>&1 | Out-Null
        }

        Show-CyberLoading "Membangun terowongan aman (Secure Tunnel)..."
        Show-CyberLoading "Mentransmisikan paket data penuh & menghapus file lama yang tidak sesuai (Force Push)..."
        $pushOutput = git push -u origin $TARGET_BRANCH --force 2>&1 | Out-String
    } else {
        if ($stagedFilesCount -gt 0) {
            Show-CyberLoading "Mengenkripsi metadata commit (Partial Update)..."
            Show-CyberLoading "Melakukan commit hanya pada file yang berubah..."
            git commit -m $commitMessage 2>&1 | Out-Null
            Write-CyberSuccess "Commit Partial Update berhasil diterapkan: $commitMessage"

            if ($USE_GIT_LFS -and (-not [string]::IsNullOrWhiteSpace($LFS_EXTS))) {
                Show-CyberLoading "Mentransmisikan objek binary Git LFS ke server..."
                git lfs push --all origin $TARGET_BRANCH 2>&1 | Out-Null
            }

            Show-CyberLoading "Membangun terowongan aman (Secure Tunnel)..."
            Show-CyberLoading "Mentransmisikan hanya file yang berubah ke GitHub (Partial Update)..."
            $pushOutput = git push -u origin $TARGET_BRANCH 2>&1 | Out-String
        } else {
            Write-CyberInfo "Semua file di folder sudah identik dengan repositori remote. Tidak perlu melakukan push."
            $pushOutput = ""
            $global:LASTEXITCODE = 0
        }
    }

    if ($LASTEXITCODE -eq 0) {
        if ($USE_GIT_RELEASE -and (-not [string]::IsNullOrWhiteSpace($FINAL_RELEASE_TAG))) {
            Write-CyberHeader "MEMPUBLIKASIKAN GIT TAG & GITHUB RELEASE ($FINAL_RELEASE_TAG)"
            Show-CyberLoading "Membuat & mendorong Git Tag '$FINAL_RELEASE_TAG' ke GitHub..."
            $tagMsg = if (-not [string]::IsNullOrWhiteSpace($RELEASE_NOTES_IN)) { $RELEASE_NOTES_IN } else { "Release $FINAL_RELEASE_TAG" }
            git tag -f -a $FINAL_RELEASE_TAG -m $tagMsg 2>&1 | Out-Null
            git push origin $FINAL_RELEASE_TAG --force 2>&1 | Out-Null
            Write-CyberSuccess "Git Tag '$FINAL_RELEASE_TAG' berhasil di-push ke origin."

            Show-CyberLoading "Membuat halaman GitHub Release resmi via API..."
            try {
                $relHeaders = @{
                    "Authorization" = "token $GITHUB_TOKEN"
                    "Accept"        = "application/vnd.github.v3+json"
                    "User-Agent"    = "Alinlabs-Git-Push"
                }
                $relPayload = @{
                    tag_name               = $FINAL_RELEASE_TAG
                    target_commitish       = $TARGET_BRANCH
                    name                   = "Release $FINAL_RELEASE_TAG"
                    body                   = $RELEASE_NOTES_IN
                    draft                  = $false
                    prerelease             = $false
                    generate_release_notes = $true
                } | ConvertTo-Json
                $null = Invoke-RestMethod -Uri "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/releases" -Method Post -Headers $relHeaders -Body $relPayload -ContentType "application/json; charset=utf-8" -ErrorAction Stop
                Write-CyberSuccess "GitHub Release '$FINAL_RELEASE_TAG' berhasil diterbitkan!"
            } catch {
                Write-CyberWarn "Git Tag '$FINAL_RELEASE_TAG' telah terpasang di GitHub (Release dengan tag tersebut sudah ada atau diperbarui)."
            }
        }

        Write-CyberHeader "DEPLOYMENT BERHASIL"
        Write-CyberSuccess "Semua sistem berjalan normal."
        Write-Host ""
        Write-Host " [🔗] Tautan Repositori: https://github.com/$GITHUB_USERNAME/$REPO_NAME" -ForegroundColor Cyan
        if ($USE_GIT_RELEASE -and (-not [string]::IsNullOrWhiteSpace($FINAL_RELEASE_TAG))) {
            Write-Host " [🏷️] Tautan Release   : https://github.com/$GITHUB_USERNAME/$REPO_NAME/releases/tag/$FINAL_RELEASE_TAG" -ForegroundColor Green
        }
        if ($USE_GIT_LFS -and (-not [string]::IsNullOrWhiteSpace($LFS_EXTS))) {
            Write-Host ""
            Write-Host " [!] PENTING UNTUK DEPLOYMENT VERCEL:" -ForegroundColor Yellow
            Write-Host " -> Tambahkan Environment Variable di Vercel: VERCEL_GIT_LFS_ENABLED = 1" -ForegroundColor Cyan
            Write-Host " -> Buka Project Settings > Environment Variables di dashboard Vercel." -ForegroundColor Gray
            Write-Host " -> Tanpa variable ini, Vercel hanya meng-clone file pointer 130-byte sehingga error saat build!" -ForegroundColor Gray
        }
    } else {
        Write-CyberHeader "KEGAGALAN SISTEM !"
        if ($pushOutput -match "Authentication failed" -or $pushOutput -match "403" -or $pushOutput -match "Bad credentials") {
            Write-CyberError "Gagal mengautentikasi: Token GitHub kadaluarsa / habis atau izin tidak mencukupi."
            Write-CyberWarn "Buka tautan ini untuk membuat atau memperbarui Personal Access Token Anda:"
            Write-Host "   [🔗] https://github.com/settings/tokens" -ForegroundColor Yellow
            Write-CyberInfo "Pastikan token memiliki centang izin 'repo' dan 'workflow'."
        } elseif ($pushOutput -match "not found" -or $pushOutput -match "404") {
            Write-CyberError "Repositori tidak ditemukan. Pastikan nama repositori dan username sudah benar."
        } elseif ($pushOutput -match "src refspec" -and $pushOutput -match "does not match any") {
            Write-CyberError "Cabang '$TARGET_BRANCH' kosong dan tidak ada file untuk di-push."
        } else {
            Write-CyberError "Transmisi ditolak. Rincian Error:"
            Write-Host $pushOutput -ForegroundColor Red
        }
    }

} catch {
    Write-CyberHeader "CRITICAL ERROR !"
    Write-CyberError $_.Exception.Message
} finally {
    Write-Host ""
    Write-Host " "
    Read-Host " [>] Tekan [ENTER] untuk keluar"
    Clear-Host
    exit
}
