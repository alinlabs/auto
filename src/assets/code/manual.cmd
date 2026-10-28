@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AUTO - Alinlabs Utility Technology Operations (CMD MANUAL)
color 0B
cls

echo    █████████   █████  █████ ███████████    ███████   
echo   ███     ███    ███    ███   ███     █  ███     ███ 
echo  ███    ███  ███   ███    ███    ███     ███
echo  ███████████  ███   ███    ███    ███      ███
echo  ███     ███  ███   ███    ███    ███      ███
echo  ███    ███  ███   ███    ███    ███     ███ 
echo  █████   █████   ████████      █████    ███████  
echo.
echo    --^> Alinlabs Utility Technology Operations (CMD MANUAL) ^<--
echo.

set "CONFIG_DIR=%USERPROFILE%\.git-auto-tool"
set "CONFIG_FILE=%CONFIG_DIR%\token.json"
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

echo =======================================================
echo   ^> INISIALISASI SISTEM
echo =======================================================
echo.

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Git tidak ditemukan di PATH sistem.
    echo [~] Mengarahkan ke tautan download Git untuk Windows...
    start https://git-scm.com/download/win
    echo [x] Harap install Git untuk Windows terlebih dahulu.
    pause
    exit /b 1
)

for /f "tokens=*" %%g in ('git --version') do set "GIT_VER=%%g"
echo [+] Git terdeteksi: !GIT_VER!

:: Load saved token if available
set "SAVED_USER="
set "SAVED_TOKEN="
if exist "%CONFIG_FILE%" (
    for /f "usebackq tokens=*" %%j in (`powershell -NoProfile -Command "try { $c = Get-Content -Raw '%CONFIG_FILE%' | ConvertFrom-Json; Write-Host ($c.username + '|' + $c.token) } catch {}"`) do (
        for /f "tokens=1,2 delims=|" %%a in ("%%j") do (
            set "SAVED_USER=%%a"
            set "SAVED_TOKEN=%%b"
        )
    )
)

:INPUT_PATH
echo.
set /p "PROJECT_PATH= [>] Masukkan path folder project / file zip : "
if "!PROJECT_PATH!"=="" goto INPUT_PATH
set "PROJECT_PATH=!PROJECT_PATH:"=!"

if not exist "!PROJECT_PATH!" (
    echo [x] Path tidak valid atau berkas tidak ditemukan: !PROJECT_PATH!
    goto INPUT_PATH
)

set "IS_ZIP=0"
if /i "!PROJECT_PATH:~-4!"==".zip" set "IS_ZIP=1"

if "!IS_ZIP!"=="1" (
    echo.
    echo =======================================================
    echo   ^> ARSIP ZIP TERDETEKSI
    echo =======================================================
    for %%F in ("!PROJECT_PATH!") do set "ZIP_DIR=%%~dpF%%~nF"
    echo [~] Mengekstrak ZIP ke: !ZIP_DIR!
    if not exist "!ZIP_DIR!" mkdir "!ZIP_DIR!"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '!PROJECT_PATH!' -DestinationPath '!ZIP_DIR!' -Force"
    if %errorlevel% neq 0 (
        tar -xf "!PROJECT_PATH!" -C "!ZIP_DIR!" >nul 2>&1
    )
    set "PROJECT_PATH=!ZIP_DIR!"
    echo [+] Ekstraksi selesai.
)

cd /d "!PROJECT_PATH!"
echo [~] Direktori kerja: !CD!

echo.
echo =======================================================
echo   ^> AUTENTIKASI GITHUB
echo =======================================================

:INPUT_AUTH
if not "!SAVED_USER!"=="" (
    echo Tersimpan username: !SAVED_USER!
    set /p "USE_SAVED= [?] Gunakan akun tersimpan? (Y/n) : "
    if /i "!USE_SAVED!"=="" set "USE_SAVED=Y"
    if /i "!USE_SAVED!"=="Y" (
        set "GITHUB_USERNAME=!SAVED_USER!"
        set "GITHUB_TOKEN=!SAVED_TOKEN!"
        goto VALIDATE_TOKEN
    )
)

set /p "GITHUB_USERNAME= [>] Masukkan GitHub Username : "
set /p "GITHUB_TOKEN= [>] Masukkan GitHub Personal Access Token : "

:VALIDATE_TOKEN
echo [~] Memvalidasi token ke API GitHub...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$h = @{ 'Authorization' = 'Bearer %GITHUB_TOKEN%'; 'User-Agent' = 'AUTO-CMD' }; try { $r = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $h -ErrorAction Stop; Write-Host ('[+] Autentikasi berhasil: ' + $r.login); exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo.
    echo =======================================================
    echo   ^> AUTENTIKASI TOKEN GAGAL (BUKAN MASALAH REPO) ^!
    echo =======================================================
    echo [!] Token tidak valid atau kadaluarsa.
    start https://github.com/settings/tokens
    set "SAVED_USER="
    set "SAVED_TOKEN="
    goto INPUT_AUTH
)

:: Save verified token
powershell -NoProfile -Command "@{'username'='%GITHUB_USERNAME%'; 'token'='%GITHUB_TOKEN%'} | ConvertTo-Json | Set-Content -Path '%CONFIG_FILE%'" >nul 2>&1

echo.
echo =======================================================
echo   ^> KONFIGURASI REPOSITORI
echo =======================================================
:INPUT_REPO
set /p "REPO_NAME= [>] Masukkan nama repositori GitHub : "
if "!REPO_NAME!"=="" goto INPUT_REPO

set /p "TARGET_BRANCH= [>] Masukkan target branch (Default: main) : "
if "!TARGET_BRANCH!"=="" set "TARGET_BRANCH=main"

set /p "COMMIT_MESSAGE= [>] Pesan commit (Tekan ENTER untuk default) : "
if "!COMMIT_MESSAGE!"=="" set "COMMIT_MESSAGE=[UPDATE-SISTEM] Auto-Push %date% %time%"

:: Check repo exists
powershell -NoProfile -ExecutionPolicy Bypass -Command "$h = @{ 'Authorization' = 'Bearer %GITHUB_TOKEN%'; 'User-Agent' = 'AUTO-CMD' }; try { $r = Invoke-RestMethod -Uri 'https://api.github.com/repos/%GITHUB_USERNAME%/%REPO_NAME%' -Headers $h -ErrorAction Stop; Write-Host '[+] Repositori ditemukan di GitHub.'; exit 0 } catch { if ($_.Exception.Response.StatusCode.value__ -eq 404) { exit 2 } else { exit 1 } }"
set "REPO_STATUS=%errorlevel%"

if "!REPO_STATUS!"=="2" (
    echo [!] Repositori '!REPO_NAME!' belum ada.
    set /p "CREATE_REPO= [?] Buat repositori baru di GitHub? (Y/n) : "
    if /i "!CREATE_REPO!"=="" set "CREATE_REPO=Y"
    if /i "!CREATE_REPO!"=="Y" (
        echo [~] Membuat repositori baru...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "$h = @{ 'Authorization' = 'Bearer %GITHUB_TOKEN%'; 'User-Agent' = 'AUTO-CMD'; 'Content-Type' = 'application/json' }; $body = @{ name = '%REPO_NAME%'; private = $false; auto_init = $false } | ConvertTo-Json; try { $null = Invoke-RestMethod -Uri 'https://api.github.com/user/repos' -Method Post -Headers $h -Body $body -ErrorAction Stop; Write-Host '[+] Repositori berhasil dibuat.'; exit 0 } catch { Write-Host '[x] Gagal membuat repositori.'; exit 1 }"
    ) else (
        goto INPUT_REPO
    )
)

echo.
echo =======================================================
echo   ^> MENGEKSEKUSI GIT PAYLOAD
echo =======================================================

if not exist ".git" git init >nul 2>&1
git config user.name "!GITHUB_USERNAME!" >nul 2>&1
git config user.email "!GITHUB_USERNAME!@users.noreply.github.com" >nul 2>&1

git add .
git commit -m "!COMMIT_MESSAGE!" >nul 2>&1
git branch -M "!TARGET_BRANCH!" >nul 2>&1

git remote remove origin >nul 2>&1
git remote add origin "https://!GITHUB_USERNAME!:!GITHUB_TOKEN!@github.com/!GITHUB_USERNAME!/!REPO_NAME!.git" >nul 2>&1

echo [~] Mengunggah payload ke GitHub...
git push -u origin "!TARGET_BRANCH!" --force
if %errorlevel% neq 0 (
    echo.
    echo =======================================================
    echo   ^> KEGAGALAN SISTEM ^!
    echo =======================================================
    echo [x] Git push gagal.
    pause
    exit /b 1
)

echo.
echo =======================================================
echo   ^> DEPLOYMENT BERHASIL ^!
echo =======================================================
echo [+] URL Repositori: https://github.com/!GITHUB_USERNAME!/!REPO_NAME!
start "https://github.com/!GITHUB_USERNAME!/!REPO_NAME!"
echo.
pause
