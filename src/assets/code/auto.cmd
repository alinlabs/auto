@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AUTO - Alinlabs Utility Technology Operations (CMD AUTO)
color 0B
cls

:: =======================================================
::  KONFIGURASI PARAMETER OTOMATIS (__PARAM_MODE_LABEL__)
::  __PARAM_GIT_COMMAND_LABEL__
:: =======================================================
__PARAM_TARGET_CONFIG_BLOCK__
set "GIT_COMMAND_MODE=__PARAM_GIT_COMMAND__"
set "GITHUB_TOKEN=__PARAM_TOKEN__"
set "GITHUB_USERNAME=__PARAM_USERNAME__"
set "REPO_NAME=__PARAM_REPO__"
set "TARGET_BRANCH=__PARAM_BRANCH__"
set "CUSTOM_COMMIT=__PARAM_COMMIT__"
set "USE_COMMIT_TIME=__PARAM_COMMIT_TIME_ENABLED__"
set "USE_REPO_META=__PARAM_REPO_META_ENABLED__"
set "REPO_TOPICS=__PARAM_REPO_TOPICS__"
set "REPO_DESC=__PARAM_REPO_DESC__"
set "USE_README_DETECTOR=__PARAM_README_DETECTOR_ENABLED__"
set "README_DETECTOR_MODE=__PARAM_README_DETECTOR_MODE__"
set "USE_GIT_LFS=__PARAM_LFS_ENABLED__"
set "LFS_EXTS=__PARAM_LFS_EXTS__"
set "LFS_SIZE=__PARAM_LFS_SIZE__"
set "USE_GIT_RELEASE=__PARAM_RELEASE_ENABLED__"
set "RELEASE_MODE=__PARAM_RELEASE_MODE__"
set "RELEASE_BUMP=__PARAM_RELEASE_BUMP__"
set "RELEASE_TAG_IN=__PARAM_RELEASE_TAG__"
set "RELEASE_NOTES_IN=__PARAM_RELEASE_NOTES__"
if /i "!GIT_COMMAND_MODE!"=="FORCE_PUSH" (
    set "DEFAULT_PREFIX=[FORCE-PUSH]"
) else (
    set "DEFAULT_PREFIX=[PARTIAL-UPDATE]"
)
if /i "!USE_COMMIT_TIME!"=="true" (
    set "COMMIT_MESSAGE=!DEFAULT_PREFIX! Auto-Push %date% %time%"
    if not "!CUSTOM_COMMIT!"=="" set "COMMIT_MESSAGE=!CUSTOM_COMMIT! (%date% %time%)"
) else (
    set "COMMIT_MESSAGE=!DEFAULT_PREFIX! Auto-Push"
    if not "!CUSTOM_COMMIT!"=="" set "COMMIT_MESSAGE=!CUSTOM_COMMIT!"
)

echo    █████████   █████  █████ ███████████    ███████   
echo   ███     ███    ███    ███   ███     █  ███     ███ 
echo  ███    ███  ███   ███    ███    ███     ███
echo  ███████████  ███   ███    ███    ███      ███
echo  ███     ███  ███   ███    ███    ███      ███
echo  ███    ███  ███   ███    ███    ███     ███ 
echo  █████   █████   ████████      █████    ███████  
echo.
echo    --^> Alinlabs Utility Technology Operations (CMD AUTO) ^<--
echo.

echo =======================================================
echo   ^> INISIALISASI SISTEM (AUTO MODE)
echo =======================================================
echo.

echo [~] Memeriksa modul Git di sistem...
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

__PARAM_WORKSPACE_INIT_BLOCK__

if /i "!USE_README_DETECTOR!"=="true" (
    echo.
    echo =======================================================
    echo   ^> README DETECTOR ^(PEMINDAI FILE README.MD^)
    echo =======================================================

    if /i "!README_DETECTOR_MODE!"=="AUTO" (
        echo [~] Memeriksa file README.md di direktori public ^(Auto Change^)...
        if exist "public\README.md" (
            move /y "public\README.md" "README.md" >nul 2>&1
            echo [+] [Auto Change] Berkas public\README.md berhasil dipindahkan ke .\README.md ^(Root^)!
        ) else (
            echo [~] [Auto Change] Tidak ada berkas README.md di public\. Melanjutkan proses otomatis...
        )
        goto README_DETECTOR_DONE
    )

    echo [~] Mencari keberadaan file README.md di Root dan direktori public...

    :README_DETECTOR_LOOP
    set "HAS_ROOT_README=0"
    set "HAS_PUB_README=0"
    if exist "README.md" set "HAS_ROOT_README=1"
    if exist "public\README.md" set "HAS_PUB_README=1"

    if "!HAS_ROOT_README!"=="1" if "!HAS_PUB_README!"=="1" (
        echo.
        echo [!] Terdeteksi file README.md di 2 lokasi sekaligus:
        echo     - Lokasi Root   : .\README.md
        echo     - Lokasi Public : .\public\README.md
        echo.
        echo   Pilihan Tindakan Readme Detector ^(Manual Change^):
        echo   [1] Pindahkan public\README.md ke Root ^(Menimpa README.md di Root^)
        echo   [2] Buka ^& Cek README.md di Root menggunakan Notepad
        echo   [3] Buka ^& Cek public\README.md menggunakan Notepad
        echo   [4] Skip / Lanjutkan proses ^(Atau tekan [ENTER]^)
        set "RM_CHOICE="
        set /p "RM_CHOICE=  [>] Pilih opsi (1/2/3/4, Bawaan: Skip): "
        if "!RM_CHOICE!"=="1" (
            move /y "public\README.md" "README.md" >nul 2>&1
            echo [+] File public\README.md berhasil dipindahkan dan menimpa .\README.md di Root!
            goto README_DETECTOR_LOOP
        )
        if "!RM_CHOICE!"=="2" (
            echo [~] Membuka .\README.md di Notepad untuk dicek...
            notepad "README.md"
            goto README_DETECTOR_LOOP
        )
        if "!RM_CHOICE!"=="3" (
            echo [~] Membuka .\public\README.md di Notepad untuk dicek...
            notepad "public\README.md"
            goto README_DETECTOR_LOOP
        )
        echo [~] Melewati perubahan README.md, melanjutkan proses...
        goto README_DETECTOR_DONE
    )

    if "!HAS_ROOT_README!"=="0" if "!HAS_PUB_README!"=="1" (
        echo.
        echo [!] Terdeteksi file README.md di direktori public: .\public\README.md ^(Belum ada di Root^)
        echo.
        echo   Pilihan Tindakan Readme Detector ^(Manual Change^):
        echo   [1] Pindahkan public\README.md ke Root ^(.\README.md^)
        echo   [2] Buka ^& Cek public\README.md menggunakan Notepad
        echo   [3] Skip / Lanjutkan proses ^(Atau tekan [ENTER]^)
        set "RM_CHOICE="
        set /p "RM_CHOICE=  [>] Pilih opsi (1/2/3, Bawaan: Skip): "
        if "!RM_CHOICE!"=="1" (
            move /y "public\README.md" "README.md" >nul 2>&1
            echo [+] File public\README.md berhasil dipindahkan ke .\README.md ^(Root^)!
            goto README_DETECTOR_LOOP
        )
        if "!RM_CHOICE!"=="2" (
            echo [~] Membuka .\public\README.md di Notepad untuk dicek...
            notepad "public\README.md"
            goto README_DETECTOR_LOOP
        )
        echo [~] Melewati pemindahan README.md, melanjutkan proses...
        goto README_DETECTOR_DONE
    )

    if "!HAS_ROOT_README!"=="1" if "!HAS_PUB_README!"=="0" (
        echo.
        echo [+] Terdeteksi file README.md di Root: .\README.md
        echo.
        echo   Pilihan Tindakan Readme Detector ^(Manual Change^):
        echo   [1] Buka ^& Cek README.md di Root menggunakan Notepad
        echo   [2] Skip / Lanjutkan proses ^(Atau tekan [ENTER]^)
        set "RM_CHOICE="
        set /p "RM_CHOICE=  [>] Pilih opsi (1/2, Bawaan: Skip): "
        if "!RM_CHOICE!"=="1" (
            echo [~] Membuka .\README.md di Notepad untuk dicek dan dilihat...
            notepad "README.md"
            echo [+] Pengecekan .\README.md di Notepad selesai.
            goto README_DETECTOR_LOOP
        )
        echo [~] Melanjutkan proses eksekusi...
        goto README_DETECTOR_DONE
    )

    echo [~] Tidak ditemukan file README.md di Root maupun di direktori public\.
    :README_DETECTOR_DONE
)

echo.
echo =======================================================
echo   ^> VERIFIKASI TOKEN GITHUB
echo =======================================================
echo [~] Memvalidasi kredensial token GitHub ke API...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$h = @{ 'Authorization' = 'Bearer %GITHUB_TOKEN%'; 'User-Agent' = 'AUTO-CMD' }; try { $r = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $h -ErrorAction Stop; Write-Host ('[+] Token valid. Akun terotentikasi: ' + $r.login); exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo.
    echo =======================================================
    echo   ^> AUTENTIKASI TOKEN GAGAL (BUKAN MASALAH REPO) ^!
    echo =======================================================
    echo [!] Token GitHub tidak valid, telah kadaluarsa, atau akses dicabut.
    echo [~] Membuka halaman GitHub Personal Access Token di browser...
    start https://github.com/settings/tokens
    echo.
    echo Harap buat token baru (dengan scope 'repo' dan 'workflow') lalu perbarui konfigurasi.
    pause
    exit /b 1
)

echo.
echo =======================================================
echo   ^> MEMERIKSA STATUS REPOSITORI
echo =======================================================
echo [~] Memeriksa repositori: !GITHUB_USERNAME!/!REPO_NAME!...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$h = @{ 'Authorization' = 'Bearer %GITHUB_TOKEN%'; 'User-Agent' = 'AUTO-CMD' }; try { $r = Invoke-RestMethod -Uri 'https://api.github.com/repos/%GITHUB_USERNAME%/%REPO_NAME%' -Headers $h -ErrorAction Stop; Write-Host '[+] Repositori ditemukan di GitHub.'; exit 0 } catch { if ($_.Exception.Response.StatusCode.value__ -eq 404) { exit 2 } else { exit 1 } }"
set "REPO_STATUS=%errorlevel%"

if "!REPO_STATUS!"=="2" (
    echo [!] Repositori '!REPO_NAME!' belum ada di akun GitHub Anda.
    echo [~] Membuat repositori baru secara otomatis di GitHub...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$h = @{ 'Authorization' = 'Bearer %GITHUB_TOKEN%'; 'User-Agent' = 'AUTO-CMD'; 'Content-Type' = 'application/json' }; $body = @{ name = '%REPO_NAME%'; private = $false; auto_init = $false } | ConvertTo-Json; try { $r = Invoke-RestMethod -Uri 'https://api.github.com/user/repos' -Method Post -Headers $h -Body $body -ErrorAction Stop; Write-Host '[+] Repositori baru berhasil dibuat di GitHub.'; exit 0 } catch { Write-Host ('[x] Gagal membuat repositori: ' + $_.Exception.Message); exit 1 }"
    if %errorlevel% neq 0 (
        echo [x] Gagal membuat repositori secara otomatis.
        pause
        exit /b 1
    )
)

if /i "!USE_REPO_META!"=="true" (
    echo.
    echo =======================================================
    echo   ^> SINKRONISASI TOPIC ^& DESKRIPSI REPOSITORY
    echo =======================================================
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$user='%GITHUB_USERNAME%'; $repo='%REPO_NAME%'; $tok='%GITHUB_TOKEN%'; $desc='%REPO_DESC%'; $topics='%REPO_TOPICS%'; $h=@{'Authorization'='Bearer '+$tok; 'User-Agent'='AUTO-CMD'; 'Accept'='application/vnd.github.mercy-preview+json'; 'Content-Type'='application/json; charset=utf-8'}; if($desc){ try { if($desc.Length -gt 350){$desc=$desc.Substring(0,350)}; $b=@{description=$desc}|ConvertTo-Json -Compress; $null=Invoke-RestMethod -Uri ('https://api.github.com/repos/'+$user+'/'+$repo) -Method Patch -Headers $h -Body ([System.Text.Encoding]::UTF8.GetBytes($b)) -ErrorAction Stop; Write-Host '[+] Deskripsi Repository berhasil diperbarui!' } catch { Write-Host '[!] Gagal memperbarui deskripsi repositori.' } }; if($topics){ try { $arr=@($topics -split '[,\s]+' | ForEach-Object { $_.Trim().ToLower() -replace '[^a-z0-9-]','-' -replace '^-+|-+$','' } | Where-Object { $_ } | Select-Object -Unique); $tb=if($arr.Count -eq 1){'{\"names\":[\"'+$arr[0]+'\"]}'}else{@{names=$arr}|ConvertTo-Json -Compress}; $null=Invoke-RestMethod -Uri ('https://api.github.com/repos/'+$user+'/'+$repo+'/topics') -Method Put -Headers $h -Body ([System.Text.Encoding]::UTF8.GetBytes($tb)) -ErrorAction Stop; Write-Host ('[+] Topik Repository berhasil diperbarui: '+($arr -join ', ')) } catch { Write-Host '[!] Gagal memperbarui topik repositori.' } }"
)

echo.
echo =======================================================
echo   ^> MENGEKSEKUSI GIT PAYLOAD (!GIT_COMMAND_MODE!)
echo =======================================================

if not exist ".git" (
    echo [~] Menginisialisasi repositori Git baru...
    git init >nul 2>&1
)

git config --local credential.helper "" >nul 2>&1
git config user.name "!GITHUB_USERNAME!" >nul 2>&1
git config user.email "!GITHUB_USERNAME!@users.noreply.github.com" >nul 2>&1

echo [~] Menghubungkan remote GitHub...
git remote remove origin >nul 2>&1
git remote add origin "https://!GITHUB_USERNAME!:!GITHUB_TOKEN!@github.com/!GITHUB_USERNAME!/!REPO_NAME!.git" >nul 2>&1

echo [~] Mengambil referensi cabang !TARGET_BRANCH! dari GitHub...
git fetch origin "!TARGET_BRANCH!" >nul 2>&1
set "REMOTE_BRANCH_EXISTS=0"
git rev-parse --verify "origin/!TARGET_BRANCH!" >nul 2>&1
if !errorlevel! equ 0 set "REMOTE_BRANCH_EXISTS=1"

if /i "!GIT_COMMAND_MODE!"=="FORCE_PUSH" (
    echo [~] Command Git: FORCE PUSH (Menimpa semua ^& menghapus berkas yang tidak sesuai folder baru)
    git checkout --orphan __cyber_force_branch__ >nul 2>&1
    git rm -rf --cached . >nul 2>&1
) else (
    echo [~] Command Git: PARTIAL UPDATE (Hanya mengupdate berkas yang berubah dari folder)
    if "!REMOTE_BRANCH_EXISTS!"=="1" (
        git symbolic-ref HEAD "refs/heads/!TARGET_BRANCH!" >nul 2>&1
        git update-ref "refs/heads/!TARGET_BRANCH!" "refs/remotes/origin/!TARGET_BRANCH!" >nul 2>&1
        git read-tree "refs/remotes/origin/!TARGET_BRANCH!" >nul 2>&1
    ) else (
        git checkout -B "!TARGET_BRANCH!" >nul 2>&1
    )
)

:: Penanganan Git LFS jika aktif
if /i "!USE_GIT_LFS!"=="true" (
    if not "!LFS_EXTS!"=="" (
        echo [~] Mengonfigurasi Git LFS...
        git lfs install >nul 2>&1
        if not "!LFS_SIZE!"=="" (
            echo [~] Menerapkan filter ukuran Git LFS: minimal !LFS_SIZE! MB...
            powershell -NoProfile -ExecutionPolicy Bypass -Command "$exts='!LFS_EXTS!'; $sz=[long]'!LFS_SIZE!' * 1MB; foreach($e in ($exts -split ',')){ $e=$e.Trim(); if($e){ if(-not $e.StartsWith('*')){$e='*'+$e}; Get-ChildItem -Path . -Filter $e -Recurse -File | Where-Object { $_.Length -ge $sz } | ForEach-Object { $r=$_.FullName.Substring((Get-Location).Path.Length+1).Replace('\','/'); git lfs track $r 2>$null } } }" >nul 2>&1
        ) else (
            for %%E in (!LFS_EXTS!) do (
                set "EXT=%%E"
                set "EXT=!EXT: =!"
                if not "!EXT!"=="" (
                    echo   [+] Tracking Git LFS: *!EXT!
                    git lfs track "*!EXT!" >nul 2>&1
                )
            )
        )
        if exist ".gitattributes" git add .gitattributes >nul 2>&1
    )
)

if /i "!GIT_COMMAND_MODE!"=="FORCE_PUSH" (
    echo [~] Melakukan staging seluruh berkas di folder baru (git add -A)...
    git add -A
) else (
    echo [~] Memindai hanya berkas yang berubah dari folder (git add --ignore-removal)...
    git add --ignore-removal .
)

set "FINAL_RELEASE_TAG="
if /i "!USE_GIT_RELEASE!"=="true" (
    echo [~] Menganalisa skala perubahan ^& menyiapkan Versi, Git Tag ^& Release (!RELEASE_MODE!)...
    for /f "usebackq tokens=1,2 delims=|" %%A in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$mode='%RELEASE_MODE%'; $tagIn='%RELEASE_TAG_IN%'; $user='%GITHUB_USERNAME%'; $repo='%REPO_NAME%'; $tok='%GITHUB_TOKEN%'; $branch='%TARGET_BRANCH%'; $commitMsg='%CUSTOM_COMMIT%'; $finalTag='v1.0.0'; $cleanVer='1.0.0'; $bumpInfo='MANUAL'; if($mode -eq 'MANUAL' -and $tagIn){ if($tagIn.StartsWith('v') -or $tagIn.StartsWith('V')){$finalTag='v'+$tagIn.Substring(1); $cleanVer=$tagIn.Substring(1)}else{$finalTag='v'+$tagIn; $cleanVer=$tagIn} } else { $add=0; $mod=0; $del=0; $null=git rev-parse --verify ('origin/'+$branch) 2>$null; $diffOut=if($LASTEXITCODE -eq 0){git diff ('origin/'+$branch) --cached --name-status 2>$null}else{git diff --cached --name-status 2>$null}; foreach($l in ($diffOut -split \"`n\")){ $t=([string]$l).Trim(); if($t -match '^A\s+'){$add++}elseif($t -match '^D\s+'){$del++}elseif($t -match '^[MRC]\s*'){$mod++} }; $tot=$add+$mod+$del; $bump='patch'; if($commitMsg -match '(?i)\b(breaking|major|rombak|arsitektur|rewrite)\b' -or $del -ge 5 -or ($tot -ge 25 -and $del -ge 2)){$bump='major'}elseif($commitMsg -match '(?i)\b(feat|feature|fitur|minor|modul|tambah)\b' -or $add -ge 1 -or $tot -ge 5){$bump='minor'}; $bumpInfo=$bump.ToUpper()+' (+'+$add+' baru, ~'+$mod+' diubah, -'+$del+' dihapus)'; try { $h=@{'Authorization'='Bearer '+$tok; 'User-Agent'='AUTO-CMD'}; $r=Invoke-RestMethod -Uri ('https://api.github.com/repos/'+$user+'/'+$repo+'/tags?per_page=1') -Headers $h -ErrorAction Stop; if($r -and $r.Count -gt 0 -and $r[0].name -match '^v?(\d+)\.(\d+)\.(\d+)'){ $ma=[int]$matches[1]; $mi=[int]$matches[2]; $pa=[int]$matches[3]; if($bump -eq 'major'){$ma++;$mi=0;$pa=0}elseif($bump -eq 'minor'){$mi++;$pa=0}else{$pa++}; $cleanVer=\"$ma.$mi.$pa\"; $finalTag='v'+$cleanVer } } catch {} }; if(Test-Path '.\package.json'){ try { $p=[System.IO.File]::ReadAllText((Resolve-Path '.\package.json').Path); if($p -match '\"version\"\s*:\s*\"[^\"]*\"'){ $p=[regex]::Replace($p,'\"version\"\s*:\s*\"[^\"]*\"','\"version\": \"'+$cleanVer+'\"',1); [System.IO.File]::WriteAllText((Resolve-Path '.\package.json').Path,$p,(New-Object System.Text.UTF8Encoding($false))); git add package.json 2>$null } } catch {} }; Write-Output ($finalTag+'|'+$bumpInfo)"`) do (
        set "FINAL_RELEASE_TAG=%%A"
        set "AUTO_BUMP_SUMMARY=%%B"
    )
    echo [+] Analisa SemVer : !AUTO_BUMP_SUMMARY!
    echo [+] Tag Release    : !FINAL_RELEASE_TAG!
)

if /i "!GIT_COMMAND_MODE!"=="FORCE_PUSH" (
    echo [~] Melakukan commit penuh (Force Push)...
    git commit --allow-empty -m "!COMMIT_MESSAGE!" >nul 2>&1
    echo [~] Menyesuaikan branch target: !TARGET_BRANCH!...
    git branch -M "!TARGET_BRANCH!" >nul 2>&1
    if /i "!USE_GIT_LFS!"=="true" if not "!LFS_EXTS!"=="" (
        echo [~] Mengunggah objek binary Git LFS (git lfs push)...
        git lfs push --all origin "!TARGET_BRANCH!" >nul 2>&1
    )
    echo [~] Mengunggah payload penuh ke GitHub (git push --force)...
    git push -u origin "!TARGET_BRANCH!" --force
    if !errorlevel! neq 0 (
        echo.
        echo =======================================================
        echo   ^> KEGAGALAN SISTEM ^!
        echo =======================================================
        echo [x] Git push gagal. Periksa koneksi internet atau izin token.
        pause
        exit /b 1
    )
) else (
    git diff --cached --quiet
    if !errorlevel! equ 0 (
        echo [!] Tidak ada berkas yang berubah dibandingkan repositori remote.
        echo [~] Melewati proses push karena repositori sudah sinkron.
    ) else (
        echo [~] Melakukan commit berkas yang berubah (Partial Update)...
        git commit -m "!COMMIT_MESSAGE!" >nul 2>&1
        if /i "!USE_GIT_LFS!"=="true" if not "!LFS_EXTS!"=="" (
            echo [~] Mengunggah objek binary Git LFS (git lfs push)...
            git lfs push --all origin "!TARGET_BRANCH!" >nul 2>&1
        )
        echo [~] Mengunggah berkas yang berubah ke GitHub (git push)...
        git push -u origin "!TARGET_BRANCH!"
        if !errorlevel! neq 0 (
            echo.
            echo =======================================================
            echo   ^> KEGAGALAN SISTEM ^!
            echo =======================================================
            echo [x] Git push gagal. Periksa koneksi internet atau izin token.
            pause
            exit /b 1
        )
    )
)

if /i "!USE_GIT_RELEASE!"=="true" (
    if not "!FINAL_RELEASE_TAG!"=="" (
        echo.
        echo =======================================================
        echo   ^> MEMPUBLIKASIKAN GIT TAG ^& GITHUB RELEASE (!FINAL_RELEASE_TAG!)
        echo =======================================================
        git tag -f -a "!FINAL_RELEASE_TAG!" -m "Release !FINAL_RELEASE_TAG!" >nul 2>&1
        git push origin "!FINAL_RELEASE_TAG!" --force >nul 2>&1
        powershell -NoProfile -ExecutionPolicy Bypass -Command "$h=@{'Authorization'='Bearer %GITHUB_TOKEN%'; 'User-Agent'='AUTO-CMD'; 'Content-Type'='application/json; charset=utf-8'}; $b=@{tag_name='!FINAL_RELEASE_TAG!'; target_commitish='%TARGET_BRANCH%'; name='Release !FINAL_RELEASE_TAG!'; body='%RELEASE_NOTES_IN%'; draft=$false; prerelease=$false; generate_release_notes=$true}|ConvertTo-Json; try { $null=Invoke-RestMethod -Uri 'https://api.github.com/repos/%GITHUB_USERNAME%/%REPO_NAME%/releases' -Method Post -Headers $h -Body $b -ErrorAction Stop; Write-Host '[+] GitHub Release berhasil diterbitkan!' } catch { Write-Host '[+] Git Tag berhasil diterbitkan di GitHub.' }"
    )
)

echo.
echo =======================================================
echo   ^> DEPLOYMENT BERHASIL ^!
echo =======================================================
echo [+] Payload (!GIT_COMMAND_MODE!) berhasil diproses pada branch: !TARGET_BRANCH!
echo [+] URL Repositori: https://github.com/!GITHUB_USERNAME!/!REPO_NAME!
if /i "!USE_GIT_RELEASE!"=="true" (
    if not "!FINAL_RELEASE_TAG!"=="" (
        echo [+] URL Release   : https://github.com/!GITHUB_USERNAME!/!REPO_NAME!/releases/tag/!FINAL_RELEASE_TAG!
    )
)
echo.
echo Operasi selesai.
pause
