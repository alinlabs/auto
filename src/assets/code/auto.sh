#!/bin/bash

# SYNOPSIS
#     Cyber Auto Git-Push Script (BASH)
# DESCRIPTION
#     Script push otomatis dengan parameter yang sudah dikonfigurasi. Developed by AlinLabs.

# =======================================================
#  KONFIGURASI PARAMETER OTOMATIS (__PARAM_MODE_LABEL__)
#  __PARAM_GIT_COMMAND_LABEL__
# =======================================================
__PARAM_TARGET_CONFIG_BLOCK__
GIT_COMMAND_MODE="__PARAM_GIT_COMMAND__"
GITHUB_TOKEN="__PARAM_TOKEN__"
GITHUB_USERNAME="__PARAM_USERNAME__"
REPO_NAME="__PARAM_REPO__"
TARGET_BRANCH="__PARAM_BRANCH__"
CUSTOM_COMMIT="__PARAM_COMMIT__"
USE_COMMIT_TIME="__PARAM_COMMIT_TIME_ENABLED__"
USE_REPO_META="__PARAM_REPO_META_ENABLED__"
REPO_TOPICS="__PARAM_REPO_TOPICS__"
REPO_TOPICS_JSON='__PARAM_REPO_TOPICS_JSON__'
REPO_DESC="__PARAM_REPO_DESC__"
USE_README_DETECTOR="__PARAM_README_DETECTOR_ENABLED__"
README_DETECTOR_MODE="__PARAM_README_DETECTOR_MODE__"
USE_GIT_LFS="__PARAM_LFS_ENABLED__"
LFS_EXTS="__PARAM_LFS_EXTS__"
LFS_SIZE="__PARAM_LFS_SIZE__"
USE_GIT_RELEASE="__PARAM_RELEASE_ENABLED__"
RELEASE_MODE="__PARAM_RELEASE_MODE__"
RELEASE_BUMP="__PARAM_RELEASE_BUMP__"
RELEASE_TAG_IN="__PARAM_RELEASE_TAG__"
RELEASE_NOTES_IN="__PARAM_RELEASE_NOTES__"

# Konfigurasi Warna
C_CYAN='\033[0;36m'
C_DARKCYAN='\033[1;36m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[1;33m'
C_RED='\033[0;31m'
C_WHITE='\033[1;37m'
C_NC='\033[0m' # No Color

function write_cyber_header() {
    echo -e ""
    echo -e "${C_DARKCYAN} =======================================================${C_NC}"
    echo -e "${C_CYAN}  > $1${C_NC}"
    echo -e "${C_DARKCYAN} =======================================================${C_NC}"
    echo -e ""
}

function write_cyber_info() { echo -e "${C_DARKCYAN} [~] $1${C_NC}"; }
function write_cyber_success() { echo -e "${C_GREEN} [+] $1${C_NC}"; }
function write_cyber_warn() { echo -e "${C_YELLOW} [!] $1${C_NC}"; }
function write_cyber_error() { echo -e "${C_RED} [x] $1${C_NC}"; }

function show_cyber_loading() {
    echo -e "${C_DARKCYAN} [~] $1${C_NC}"
    sleep 0.3
    echo -ne "\033[1A\033[2K"
    echo -e "${C_DARKCYAN} [~] $1 ${C_GREEN}✓${C_NC}"
}

clear
cat << "EOF"
   █████████   █████  █████ ███████████    ███████   
  ███▒▒▒▒▒███ ▒▒███  ▒▒███ ▒█▒▒▒███▒▒▒█  ███▒▒▒▒▒███ 
 ▒███    ▒███  ▒███   ▒███ ▒   ▒███  ▒  ███     ▒▒███
 ▒███████████  ▒███   ▒███     ▒███    ▒███      ▒███
 ▒███▒▒▒▒▒███  ▒███   ▒███     ▒███    ▒███      ▒███
 ▒███    ▒███  ▒███   ▒███     ▒███    ▒▒███     ███ 
 █████   █████ ▒▒████████      █████    ▒▒▒███████▒  
▒▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒▒▒▒      ▒▒▒▒▒       ▒▒▒▒▒▒▒    

   --> Alinlabs Utility Technology Operations (BASH AUTO) <--
EOF

write_cyber_header "INISIALISASI SISTEM (AUTO MODE)"

show_cyber_loading "Memeriksa modul Git..."
if ! command -v git &> /dev/null; then
    write_cyber_warn "Git tidak ditemukan di sistem."
    show_cyber_loading "Mencoba menginstal Git..."
    if command -v pkg &> /dev/null && [ -n "$PREFIX" ] && [[ "$PREFIX" == *"com.termux"* ]]; then
        pkg update -y > /dev/null 2>&1
        pkg install git -y > /dev/null 2>&1
    elif command -v apk &> /dev/null; then
        apk update > /dev/null 2>&1
        apk add git > /dev/null 2>&1
    elif command -v brew &> /dev/null; then
        brew install git > /dev/null 2>&1
    elif command -v apt-get &> /dev/null; then
        sudo apt-get update > /dev/null 2>&1 || true
        sudo apt-get install git -y > /dev/null 2>&1 || true
    fi
    
    if ! command -v git &> /dev/null; then
        write_cyber_error "Gagal menginstal Git secara otomatis. Harap instal Git secara manual."
        read -p " [>] Tekan [ENTER] untuk keluar: "
        clear
        exit 1
    fi
    write_cyber_success "Git berhasil diinstal."
else
    GIT_VERSION=$(git --version)
    write_cyber_info "Versi Git saat ini: $GIT_VERSION"

    show_cyber_loading "Mencoba memperbarui Git ke versi terbaru..."
    if command -v pkg &> /dev/null && [ -n "$PREFIX" ] && [[ "$PREFIX" == *"com.termux"* ]]; then
        pkg update -y > /dev/null 2>&1
        pkg install git -y > /dev/null 2>&1
    elif command -v apk &> /dev/null; then
        apk update > /dev/null 2>&1
        apk add git > /dev/null 2>&1
    elif command -v brew &> /dev/null; then
        brew upgrade git > /dev/null 2>&1
    elif command -v apt-get &> /dev/null; then
        sudo apt-get install git -y > /dev/null 2>&1 || true
    fi
fi

GIT_VERSION_NEW=$(git --version)
write_cyber_success "Git siap: $GIT_VERSION_NEW (Terinstall/Terupdate)"

__PARAM_WORKSPACE_INIT_BLOCK__

function open_readme_editor() {
    local target_file="$1"
    if command -v notepad.exe &> /dev/null; then
        notepad.exe "$target_file"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$target_file" > /dev/null 2>&1
    elif command -v open &> /dev/null; then
        open -e "$target_file"
    elif [ -n "$EDITOR" ]; then
        "$EDITOR" "$target_file"
    elif command -v nano &> /dev/null; then
        nano "$target_file"
    else
        cat "$target_file"
        echo ""
        read -p " [>] Tekan [ENTER] setelah selesai membaca: "
    fi
}

if [ "$USE_README_DETECTOR" = "true" ]; then
    write_cyber_header "README DETECTOR (PEMINDAI FILE README.MD)"

    if [ "$README_DETECTOR_MODE" = "AUTO" ]; then
        show_cyber_loading "Memeriksa direktori public/ untuk file README.md (Auto Change)..."
        PUBLIC_README=""
        if [ -d "./public" ]; then
            for f in README.md readme.md READMI.md readmi.md; do
                if [ -f "./public/$f" ]; then
                    PUBLIC_README="./public/$f"
                    break
                fi
            done
        fi

        if [ -n "$PUBLIC_README" ]; then
            for f in README.md readme.md READMI.md readmi.md; do
                if [ -f "./$f" ]; then
                    rm -f "./$f"
                fi
            done
            mv -f "$PUBLIC_README" "./README.md"
            write_cyber_success "Auto Change: Berkas $PUBLIC_README berhasil dipindahkan ke ./README.md (Root)!"
        else
            write_cyber_info "Auto Change: Tidak ditemukan berkas README.md di direktori public/. Melanjutkan proses otomatis..."
        fi
    else
        show_cyber_loading "Mencari keberadaan file README.md di Root dan direktori public..."

        README_DONE=false
        while [ "$README_DONE" = false ]; do
            ROOT_README=""
            for f in README.md readme.md READMI.md readmi.md; do
                if [ -f "./$f" ]; then
                    ROOT_README="./$f"
                    break
                fi
            done

            PUBLIC_README=""
            if [ -d "./public" ]; then
                for f in README.md readme.md READMI.md readmi.md; do
                    if [ -f "./public/$f" ]; then
                        PUBLIC_README="./public/$f"
                        break
                    fi
                done
            fi

            if [ -n "$ROOT_README" ] && [ -n "$PUBLIC_README" ]; then
                write_cyber_warn "Terdeteksi file README.md di 2 lokasi sekaligus:"
                write_cyber_info "Lokasi Root   : $ROOT_README"
                write_cyber_info "Lokasi Public : $PUBLIC_README"
                echo ""
                echo -e "${C_CYAN}   Pilihan Tindakan Readme Detector (Manual Change):${C_NC}"
                echo -e "${C_DARKCYAN}   [1] Pindahkan public/README.md ke Root (Menimpa README.md di Root)${C_NC}"
                echo -e "${C_DARKCYAN}   [2] Buka & Cek README.md di Root menggunakan Notepad / Editor${C_NC}"
                echo -e "${C_DARKCYAN}   [3] Buka & Cek public/README.md menggunakan Notepad / Editor${C_NC}"
                echo -e "${C_DARKCYAN}   [4] Skip / Lanjutkan proses (Atau tekan [ENTER])${C_NC}"
                echo -ne "${C_CYAN}   [>] Pilih opsi (1/2/3/4, Bawaan: Skip): ${C_NC}"
                read RM_CHOICE

                if [ "$RM_CHOICE" = "1" ]; then
                    if [ "$ROOT_README" != "./README.md" ]; then
                        rm -f "$ROOT_README"
                    fi
                    mv -f "$PUBLIC_README" "./README.md"
                    write_cyber_success "File $PUBLIC_README berhasil dipindahkan dan menimpa ./README.md di Root!"
                    echo ""
                elif [ "$RM_CHOICE" = "2" ]; then
                    write_cyber_info "Membuka $ROOT_README untuk dicek dan dilihat..."
                    open_readme_editor "$ROOT_README"
                    echo ""
                elif [ "$RM_CHOICE" = "3" ]; then
                    write_cyber_info "Membuka $PUBLIC_README untuk dicek dan dilihat..."
                    open_readme_editor "$PUBLIC_README"
                    echo ""
                else
                    write_cyber_info "Melewati perubahan README.md, melanjutkan proses..."
                    README_DONE=true
                fi
            elif [ -n "$PUBLIC_README" ] && [ -z "$ROOT_README" ]; then
                write_cyber_warn "Terdeteksi file README.md di direktori public: $PUBLIC_README (Belum ada di Root)"
                echo ""
                echo -e "${C_CYAN}   Pilihan Tindakan Readme Detector (Manual Change):${C_NC}"
                echo -e "${C_DARKCYAN}   [1] Pindahkan public/README.md ke Root (./README.md)${C_NC}"
                echo -e "${C_DARKCYAN}   [2] Buka & Cek public/README.md menggunakan Notepad / Editor${C_NC}"
                echo -e "${C_DARKCYAN}   [3] Skip / Lanjutkan proses (Atau tekan [ENTER])${C_NC}"
                echo -ne "${C_CYAN}   [>] Pilih opsi (1/2/3, Bawaan: Skip): ${C_NC}"
                read RM_CHOICE

                if [ "$RM_CHOICE" = "1" ]; then
                    mv -f "$PUBLIC_README" "./README.md"
                    write_cyber_success "File $PUBLIC_README berhasil dipindahkan ke ./README.md (Root)!"
                    echo ""
                elif [ "$RM_CHOICE" = "2" ]; then
                    write_cyber_info "Membuka $PUBLIC_README untuk dicek dan dilihat..."
                    open_readme_editor "$PUBLIC_README"
                    echo ""
                else
                    write_cyber_info "Melewati pemindahan README.md, melanjutkan proses..."
                    README_DONE=true
                fi
            elif [ -n "$ROOT_README" ] && [ -z "$PUBLIC_README" ]; then
                write_cyber_success "Terdeteksi file README.md di Root: $ROOT_README"
                echo ""
                echo -e "${C_CYAN}   Pilihan Tindakan Readme Detector (Manual Change):${C_NC}"
                echo -e "${C_DARKCYAN}   [1] Buka & Cek README.md di Root menggunakan Notepad / Editor${C_NC}"
                echo -e "${C_DARKCYAN}   [2] Skip / Lanjutkan proses (Atau tekan [ENTER])${C_NC}"
                echo -ne "${C_CYAN}   [>] Pilih opsi (1/2, Bawaan: Skip): ${C_NC}"
                read RM_CHOICE

                if [ "$RM_CHOICE" = "1" ]; then
                    write_cyber_info "Membuka $ROOT_README untuk dicek dan dilihat..."
                    open_readme_editor "$ROOT_README"
                    write_cyber_success "Pengecekan $ROOT_README selesai."
                    echo ""
                else
                    write_cyber_info "Melanjutkan proses eksekusi..."
                    README_DONE=true
                fi
            else
                write_cyber_info "Tidak ditemukan file README.md di Root maupun di direktori public/."
                README_DONE=true
            fi
        done
    fi
fi

# FASE 1: VALIDASI KEABSAHAN TOKEN & KUOTA (MEMBEDAKAN TOKEN MATI / HABIS VS REPOSITORI TIDAK ADA)
write_cyber_header "VERIFIKASI TOKEN GITHUB"
TOKEN_VALID=false
while [ "$TOKEN_VALID" = false ]; do
    show_cyber_loading "Memvalidasi kredensial dan sisa kuota Token..."
    USER_RESP=$(curl -s -w "\n%{http_code}" -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" "https://api.github.com/user")
    HTTP_CODE=$(echo "$USER_RESP" | tail -n 1)
    BODY_CONTENT=$(echo "$USER_RESP" | sed '$d')

    if [ "$HTTP_CODE" == "200" ]; then
        TOKEN_VALID=true
        AUTH_LOGIN=$(echo "$BODY_CONTENT" | grep -o '"login":"[^"]*' | head -n 1 | cut -d'"' -f4)
        write_cyber_success "Token GitHub AKTIF & TERVERIFIKASI!"
        if [ -n "$AUTH_LOGIN" ]; then
            write_cyber_info "Terautentikasi sebagai akun: $AUTH_LOGIN"
            if [ -z "$GITHUB_USERNAME" ]; then GITHUB_USERNAME="$AUTH_LOGIN"; fi
        fi
    elif [ "$HTTP_CODE" == "403" ]; then
        write_cyber_header "AUTENTIKASI TOKEN GAGAL (KUOTA HABIS) !"
        write_cyber_error "KUOTA TOKEN HABIS (API Rate Limit Exceeded)!"
        write_cyber_warn "Batas kuota pemanggilan API untuk token ini telah habis."
        echo ""
        echo -e "   \033[1;33m[!] PENTING: Buka tautan berikut untuk membuat atau memperbarui Personal Access Token:\033[0m"
        echo -e "   [🔗] \033[0;36mhttps://github.com/settings/tokens\033[0m"
        echo ""
        echo -e "${C_CYAN}   Pilihan Tindakan:${C_NC}"
        echo -e "${C_DARKCYAN}   [1] Buka link token di browser${C_NC}"
        echo -e "${C_DARKCYAN}   [2] Masukkan token baru dan coba lagi${C_NC}"
        echo -e "${C_DARKCYAN}   [3] Keluar dari sesi${C_NC}"
        echo -ne "${C_CYAN}   [>] Pilihan (1/2/3, Bawaan: 2): ${C_NC}"
        read ACTION_CHOICE
        if [ "$ACTION_CHOICE" == "1" ]; then
            if command -v xdg-open &> /dev/null; then xdg-open "https://github.com/settings/tokens" >/dev/null 2>&1
            elif command -v open &> /dev/null; then open "https://github.com/settings/tokens" >/dev/null 2>&1; fi
            echo -ne "${C_CYAN}   [>] Masukkan Token GitHub Baru: ${C_NC}"
            read NEW_TOKEN_INPUT
            if [ -n "$NEW_TOKEN_INPUT" ]; then GITHUB_TOKEN="$NEW_TOKEN_INPUT"; fi
        elif [ "$ACTION_CHOICE" == "3" ]; then
            write_cyber_error "Sesi dibatalkan karena masalah token."
            exit 1
        else
            echo -ne "${C_CYAN}   [>] Masukkan Token GitHub Baru: ${C_NC}"
            read NEW_TOKEN_INPUT
            if [ -n "$NEW_TOKEN_INPUT" ]; then GITHUB_TOKEN="$NEW_TOKEN_INPUT"; fi
        fi
    else
        write_cyber_header "AUTENTIKASI TOKEN GAGAL (BUKAN MASALAH REPO) !"
        write_cyber_error "TOKEN GITHUB HABIS / KADALUARSA / TIDAK VALID!"
        write_cyber_warn "Token tidak dapat mengakses GitHub (Bad credentials / Expired)."
        echo ""
        echo -e "   \033[1;33m[!] PENTING: Buka tautan berikut untuk membuat atau memperbarui Personal Access Token:\033[0m"
        echo -e "   [🔗] \033[0;36mhttps://github.com/settings/tokens\033[0m"
        echo -e "   \033[1;30m(Pastikan mencentang izin 'repo' dan 'workflow')\033[0m"
        echo ""
        echo -e "${C_CYAN}   Pilihan Tindakan:${C_NC}"
        echo -e "${C_DARKCYAN}   [1] Buka link token di browser${C_NC}"
        echo -e "${C_DARKCYAN}   [2] Masukkan token baru dan coba lagi${C_NC}"
        echo -e "${C_DARKCYAN}   [3] Keluar dari sesi${C_NC}"
        echo -ne "${C_CYAN}   [>] Pilihan (1/2/3, Bawaan: 2): ${C_NC}"
        read ACTION_CHOICE
        if [ "$ACTION_CHOICE" == "1" ]; then
            if command -v xdg-open &> /dev/null; then xdg-open "https://github.com/settings/tokens" >/dev/null 2>&1
            elif command -v open &> /dev/null; then open "https://github.com/settings/tokens" >/dev/null 2>&1; fi
            echo -ne "${C_CYAN}   [>] Masukkan Token GitHub Baru: ${C_NC}"
            read NEW_TOKEN_INPUT
            if [ -n "$NEW_TOKEN_INPUT" ]; then GITHUB_TOKEN="$NEW_TOKEN_INPUT"; fi
        elif [ "$ACTION_CHOICE" == "3" ]; then
            write_cyber_error "Sesi dibatalkan karena masalah token."
            exit 1
        else
            echo -ne "${C_CYAN}   [>] Masukkan Token GitHub Baru: ${C_NC}"
            read NEW_TOKEN_INPUT
            if [ -n "$NEW_TOKEN_INPUT" ]; then GITHUB_TOKEN="$NEW_TOKEN_INPUT"; fi
        fi
    fi
done

# FASE 2: CEK KEBERADAAN REPOSITORI DI GITHUB
write_cyber_header "MEMERIKSA STATUS REPOSITORI"
REPO_EXISTS=false
while [ "$REPO_EXISTS" = false ]; do
    show_cyber_loading "Mengecek keberadaan repositori '$REPO_NAME' di akun '$GITHUB_USERNAME'..."
    REPO_RES=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME")
    
    if [ "$REPO_RES" == "200" ]; then
        write_cyber_success "Repositori '$REPO_NAME' TERDETEKSI di GitHub!"
        write_cyber_info "Code akan ditulis dan di-push ke repositori ini."
        REPO_EXISTS=true
    else
        write_cyber_warn "Repositori '$REPO_NAME' TIDAK DITEMUKAN di akun GitHub '$GITHUB_USERNAME'."
        echo ""
        echo -e "${C_CYAN}   Instruksi Pilihan:${C_NC}"
        echo -e "${C_DARKCYAN}   [•] Tekan [ENTER] langsung untuk membuat repositori baru '$REPO_NAME'.${C_NC}"
        echo -e "${C_DARKCYAN}   [•] Atau ketik nama repositori lain:${C_NC}"
        echo -e "       \033[1;30m-> Jika repositori terdeteksi di GitHub, code akan ditulis di sana.\033[0m"
        echo -e "       \033[1;30m-> Jika repositori belum ada, dianggap sebagai instruksi pembuatan repositori baru.\033[0m"
        echo ""
        echo -ne "${C_CYAN}   [>] Ketik nama repositori atau [ENTER] untuk buat '$REPO_NAME': ${C_NC}"
        read NEW_REPO_INPUT
        
        if [ -z "$NEW_REPO_INPUT" ]; then
            show_cyber_loading "Membuat repositori baru '$REPO_NAME' di GitHub..."
            CREATE_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" -d "{\"name\":\"$REPO_NAME\", \"private\":false}" "https://api.github.com/user/repos")
            if [ "$CREATE_RES" == "201" ]; then
                write_cyber_success "Repositori baru '$REPO_NAME' berhasil dibuat di GitHub!"
                write_cyber_info "Code akan ditulis dan di-push ke repositori baru ini."
                REPO_EXISTS=true
            else
                write_cyber_error "Gagal membuat repositori '$REPO_NAME'. (HTTP $CREATE_RES)"
                read -p " [>] Tekan [ENTER] untuk mencoba lagi"
            fi
        else
            CANDIDATE_REPO=$(echo "$NEW_REPO_INPUT" | xargs)
            show_cyber_loading "Mengecek apakah repositori '$CANDIDATE_REPO' sudah ada di GitHub..."
            CHECK_CANDIDATE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" "https://api.github.com/repos/$GITHUB_USERNAME/$CANDIDATE_REPO")
            
            if [ "$CHECK_CANDIDATE" == "200" ]; then
                REPO_NAME="$CANDIDATE_REPO"
                write_cyber_success "Repositori '$REPO_NAME' terdeteksi di GitHub!"
                write_cyber_info "Code akan ditulis dan di-push ke repositori '$REPO_NAME'."
                REPO_EXISTS=true
            else
                write_cyber_info "Repositori '$CANDIDATE_REPO' tidak ditemukan di GitHub. Dianggap sebagai instruksi pembuatan repo baru..."
                show_cyber_loading "Membuat repositori baru '$CANDIDATE_REPO' di GitHub..."
                CREATE_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" -d "{\"name\":\"$CANDIDATE_REPO\", \"private\":false}" "https://api.github.com/user/repos")
                if [ "$CREATE_RES" == "201" ]; then
                    REPO_NAME="$CANDIDATE_REPO"
                    write_cyber_success "Repositori baru '$REPO_NAME' berhasil dibuat di GitHub!"
                    write_cyber_info "Code akan ditulis dan di-push ke repositori '$REPO_NAME'."
                    REPO_EXISTS=true
                else
                    write_cyber_error "Gagal membuat repositori '$CANDIDATE_REPO'. (HTTP $CREATE_RES)"
                    read -p " [>] Tekan [ENTER] untuk mencoba lagi"
                fi
            fi
        fi
    fi
done

if [ "$USE_REPO_META" = "true" ] && { [ -n "$REPO_DESC" ] || [ -n "$REPO_TOPICS" ]; }; then
    write_cyber_header "SINKRONISASI TOPIC & DESKRIPSI REPOSITORY"
    if [ -n "$REPO_DESC" ]; then
        show_cyber_loading "Memperbarui deskripsi repositori di GitHub (Maks 350 karakter)..."
        TRIMMED_DESC="${REPO_DESC:0:350}"
        DESC_PAYLOAD=$(printf '{"description":"%s"}' "$TRIMMED_DESC")
        DESC_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" -d "$DESC_PAYLOAD" "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME")
        if [ "$DESC_CODE" = "200" ]; then
            write_cyber_success "Deskripsi Repository berhasil diperbarui!"
        else
            write_cyber_warn "Gagal memperbarui deskripsi repositori (HTTP $DESC_CODE)."
        fi
    fi

    if [ -n "$REPO_TOPICS" ] && [ "$REPO_TOPICS_JSON" != "[]" ]; then
        show_cyber_loading "Memperbarui topik (Topics) repositori di GitHub..."
        TOPICS_PAYLOAD=$(printf '{"names":%s}' "$REPO_TOPICS_JSON")
        TOPICS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.mercy-preview+json" -H "User-Agent: Alinlabs-Git-Push" -d "$TOPICS_PAYLOAD" "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/topics")
        if [ "$TOPICS_CODE" = "200" ]; then
            write_cyber_success "Topik Repository berhasil diperbarui: $REPO_TOPICS"
        else
            write_cyber_warn "Gagal memperbarui topik repositori (HTTP $TOPICS_CODE)."
        fi
    fi
fi

REMOTE_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

show_cyber_loading "Mengecek status repositori lokal..."
if [ ! -d ".git" ]; then
    write_cyber_warn "Repositori Git belum diinisialisasi. Memulai inisialisasi..."
    git init > /dev/null 2>&1
    git branch -M "$TARGET_BRANCH" > /dev/null 2>&1
    git remote add origin "$REMOTE_URL" > /dev/null 2>&1
    write_cyber_success "Repositori lokal berhasil dibuat."
else
    if ! git remote | grep -q "^origin$"; then
        git remote add origin "$REMOTE_URL" > /dev/null 2>&1
    else
        git remote set-url origin "$REMOTE_URL" > /dev/null 2>&1
    fi
    write_cyber_success "Remote URL (origin) diperbarui."
fi

# Menonaktifkan credential helper lokal agar token baru selalu digunakan (logout effect)
git config --local credential.helper "" > /dev/null 2>&1
if [ -z "$(git config user.name 2>/dev/null)" ]; then
    git config user.name "$GITHUB_USERNAME" > /dev/null 2>&1
fi
if [ -z "$(git config user.email 2>/dev/null)" ]; then
    git config user.email "$GITHUB_USERNAME@users.noreply.github.com" > /dev/null 2>&1
fi

write_cyber_header "MENGEKSEKUSI GIT PAYLOAD ($GIT_COMMAND_MODE)"

show_cyber_loading "Mengambil referensi cabang '$TARGET_BRANCH' dari GitHub..."
git fetch origin "$TARGET_BRANCH" > /dev/null 2>&1
REMOTE_BRANCH_EXISTS=false
if git rev-parse --verify "origin/$TARGET_BRANCH" > /dev/null 2>&1; then
    REMOTE_BRANCH_EXISTS=true
fi

if [ "$GIT_COMMAND_MODE" = "FORCE_PUSH" ]; then
    write_cyber_info "Command Git: FORCE PUSH (Menimpa semua file & menghapus yang tidak sesuai folder baru)"
    show_cyber_loading "Mereset indeks untuk sinkronisasi penuh folder baru..."
    git checkout --orphan __cyber_force_branch__ > /dev/null 2>&1
    git rm -rf --cached . > /dev/null 2>&1
else
    write_cyber_info "Command Git: PARTIAL UPDATE (Hanya mengupdate file yang berubah dari folder)"
    if [ "$REMOTE_BRANCH_EXISTS" = true ]; then
        show_cyber_loading "Menyelaraskan state remote (mempertahankan file yang tidak disentuh)..."
        git symbolic-ref HEAD "refs/heads/$TARGET_BRANCH" > /dev/null 2>&1
        git update-ref "refs/heads/$TARGET_BRANCH" "refs/remotes/origin/$TARGET_BRANCH" > /dev/null 2>&1
        git read-tree "refs/remotes/origin/$TARGET_BRANCH" > /dev/null 2>&1
    else
        write_cyber_info "Cabang '$TARGET_BRANCH' belum ada di remote. Menyiapkan inisialisasi cabang..."
        git checkout -B "$TARGET_BRANCH" > /dev/null 2>&1
    fi
fi

if [ "$USE_GIT_LFS" = "true" ]; then
    show_cyber_loading "Mengaktifkan protokol LFS (Large File Storage)..."
    git lfs install > /dev/null 2>&1

    if [ -n "$LFS_EXTS" ]; then
        show_cyber_loading "Menerapkan aturan Git LFS..."
        IFS=',' read -ra ADDR <<< "$LFS_EXTS"
        if [ -n "$LFS_SIZE" ] && [ "$LFS_SIZE" -gt 0 ] 2>/dev/null; then
            show_cyber_loading "Menerapkan filter ukuran Git LFS: minimal ${LFS_SIZE} MB..."
            for ext in "${ADDR[@]}"; do
                ext=$(echo "$ext" | xargs)
                if [ -n "$ext" ]; then
                    clean_pattern="$ext"
                    if [[ "$clean_pattern" != \** ]]; then clean_pattern="*$clean_pattern"; fi
                    while IFS= read -r -d '' large_file; do
                        rel_path="${large_file#./}"
                        git lfs track "$rel_path" > /dev/null 2>&1
                    done < <(find . -type f -name "$clean_pattern" -size +"$((LFS_SIZE - 1))"M -print0 2>/dev/null)
                fi
            done
        else
            for ext in "${ADDR[@]}"; do
                ext=$(echo "$ext" | xargs)
                if [ -n "$ext" ]; then
                    if [[ "$ext" != \** ]]; then ext="*$ext"; fi
                    git lfs track "$ext" > /dev/null 2>&1
                fi
            done
        fi
        if [ -f ".gitattributes" ]; then
            git add .gitattributes > /dev/null 2>&1
        fi
    fi
fi

if [ "$GIT_COMMAND_MODE" = "FORCE_PUSH" ]; then
    show_cyber_loading "Membangun indeks penuh seluruh file di folder baru (git add -A)..."
    git add -A > /dev/null 2>&1
else
    show_cyber_loading "Memindai hanya file yang berubah dari folder (Partial Update)..."
    git add --ignore-removal . > /dev/null 2>&1
fi

FINAL_RELEASE_TAG=""
CLEAN_VERSION=""
if [ "$USE_GIT_RELEASE" = "true" ]; then
    write_cyber_header "KONFIGURASI VERSI, GIT TAG & RELEASE ($RELEASE_MODE)"
    if [ "$RELEASE_MODE" = "MANUAL" ] && [ -n "$RELEASE_TAG_IN" ]; then
        RAW_TAG=$(echo "$RELEASE_TAG_IN" | xargs)
        if [[ "$RAW_TAG" == v* ]] || [[ "$RAW_TAG" == V* ]]; then
            CLEAN_VERSION="${RAW_TAG:1}"
            FINAL_RELEASE_TAG="v$CLEAN_VERSION"
        else
            CLEAN_VERSION="$RAW_TAG"
            FINAL_RELEASE_TAG="v$RAW_TAG"
        fi
        write_cyber_info "Mode Versi Manual: Menggunakan Tag '$FINAL_RELEASE_TAG'"
    else
        show_cyber_loading "Menganalisa skala perubahan kode secara otomatis (Smart SemVer Analyzer)..."
        if [ "$REMOTE_BRANCH_EXISTS" = true ]; then
            DIFF_STATUS=$(git diff "origin/$TARGET_BRANCH" --cached --name-status 2>/dev/null)
        else
            DIFF_STATUS=$(git diff --cached --name-status 2>/dev/null)
        fi
        ADDED_COUNT=$(echo "$DIFF_STATUS" | grep -cE '^A[[:space:]]+' || true)
        DELETED_COUNT=$(echo "$DIFF_STATUS" | grep -cE '^D[[:space:]]+' || true)
        MODIFIED_COUNT=$(echo "$DIFF_STATUS" | grep -cE '^[MRC][[:space:]]*' || true)
        TOTAL_CHANGED=$((ADDED_COUNT + MODIFIED_COUNT + DELETED_COUNT))

        AUTO_BUMP="patch"
        BUMP_REASON="Perbaikan/modifikasi ringan ($MODIFIED_COUNT file diubah)"
        if echo "$CUSTOM_COMMIT" | grep -iqE '\b(breaking|major|rombak|arsitektur|rewrite)\b'; then
            AUTO_BUMP="major"
            BUMP_REASON="Kata kunci perubahan besar (Major/Breaking) pada pesan commit"
        elif [ "$DELETED_COUNT" -ge 5 ] || { [ "$TOTAL_CHANGED" -ge 25 ] && [ "$DELETED_COUNT" -ge 2 ]; }; then
            AUTO_BUMP="major"
            BUMP_REASON="Perubahan struktural besar (+$ADDED_COUNT baru, ~$MODIFIED_COUNT diubah, -$DELETED_COUNT dihapus)"
        elif echo "$CUSTOM_COMMIT" | grep -iqE '\b(feat|feature|fitur|minor|modul|tambah)\b'; then
            AUTO_BUMP="minor"
            BUMP_REASON="Kata kunci fitur baru (Feature/Minor) pada pesan commit"
        elif [ "$ADDED_COUNT" -ge 1 ] || [ "$TOTAL_CHANGED" -ge 5 ]; then
            AUTO_BUMP="minor"
            BUMP_REASON="Penambahan fitur/file menengah (+$ADDED_COUNT file baru, ~$MODIFIED_COUNT diubah)"
        fi

        AUTO_BUMP_UPPER=$(echo "$AUTO_BUMP" | tr '[:lower:]' '[:upper:]')
        write_cyber_info "Hasil Analisa Otomatis: +$ADDED_COUNT baru, ~$MODIFIED_COUNT diubah, -$DELETED_COUNT dihapus -> Level: $AUTO_BUMP_UPPER ($BUMP_REASON)"

        show_cyber_loading "Mendeteksi versi/tag terakhir dari repositori GitHub..."
        LATEST_TAG=$(curl -s -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/tags?per_page=1" | grep -o '"name": *"[^"]*"' | head -n 1 | cut -d'"' -f4)
        if [[ "$LATEST_TAG" =~ ^v?([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
            MAJ="${BASH_REMATCH[1]}"
            MIN="${BASH_REMATCH[2]}"
            PAT="${BASH_REMATCH[3]}"
            if [ "$AUTO_BUMP" = "major" ]; then
                MAJ=$((MAJ + 1)); MIN=0; PAT=0
            elif [ "$AUTO_BUMP" = "minor" ]; then
                MIN=$((MIN + 1)); PAT=0
            else
                PAT=$((PAT + 1))
            fi
            CLEAN_VERSION="${MAJ}.${MIN}.${PAT}"
            FINAL_RELEASE_TAG="v${CLEAN_VERSION}"
            write_cyber_success "Tag sebelumnya '$LATEST_TAG' -> Otomatis dinaikkan ($AUTO_BUMP_UPPER) ke '$FINAL_RELEASE_TAG'"
        else
            CLEAN_VERSION="1.0.0"
            FINAL_RELEASE_TAG="v1.0.0"
            write_cyber_info "Belum ada tag SemVer di GitHub -> Memulai rilis perdana '$FINAL_RELEASE_TAG'"
        fi
    fi

    if [ -f "package.json" ] && [ -n "$CLEAN_VERSION" ]; then
        if grep -q '"version"' "package.json"; then
            sed -i.bak -E "s/(\"version\"[[:space:]]*:[[:space:]]*\")[^\"]*(\")/\1${CLEAN_VERSION}\2/" "package.json" && rm -f "package.json.bak"
            git add package.json > /dev/null 2>&1
            write_cyber_success "Versi di package.json otomatis diperbarui ke: $CLEAN_VERSION"
        fi
    fi
fi

show_cyber_loading "Mengenkripsi metadata commit..."
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
if [ "$GIT_COMMAND_MODE" = "FORCE_PUSH" ]; then
    DEFAULT_PREFIX="[FORCE-PUSH]"
else
    DEFAULT_PREFIX="[PARTIAL-UPDATE]"
fi
if [ -n "$CUSTOM_COMMIT" ]; then
    if [ "$USE_COMMIT_TIME" = "true" ]; then
        COMMIT_MSG="$CUSTOM_COMMIT ($TIMESTAMP)"
    else
        COMMIT_MSG="$CUSTOM_COMMIT"
    fi
else
    if [ "$USE_COMMIT_TIME" = "true" ]; then
        COMMIT_MSG="$DEFAULT_PREFIX Auto-Push $TIMESTAMP"
    else
        COMMIT_MSG="$DEFAULT_PREFIX Auto-Push"
    fi
fi

PUSH_SUCCESS=false
if [ "$GIT_COMMAND_MODE" = "FORCE_PUSH" ]; then
    show_cyber_loading "Melakukan commit seluruh isi folder baru (Force Push)..."
    git commit --allow-empty -m "$COMMIT_MSG" > /dev/null 2>&1
    git branch -M "$TARGET_BRANCH" > /dev/null 2>&1
    write_cyber_success "Commit Force Push berhasil diterapkan: $COMMIT_MSG"

    if [ "$USE_GIT_LFS" = "true" ] && [ -n "$LFS_EXTS" ]; then
        show_cyber_loading "Mentransmisikan objek binary Git LFS ke server..."
        git lfs push --all origin "$TARGET_BRANCH" > /dev/null 2>&1
    fi

    show_cyber_loading "Membangun terowongan aman (Secure Tunnel)..."
    show_cyber_loading "Mentransmisikan paket data penuh & menghapus file lama yang tidak sesuai (Force Push)..."
    if git push -u origin "$TARGET_BRANCH" --force > push.log 2>&1; then
        PUSH_SUCCESS=true
    fi
else
    if git diff --cached --quiet; then
        write_cyber_warn "Tidak ada file yang berubah dibandingkan repositori remote (Clear)."
        write_cyber_info "Semua file di folder sudah identik dengan repositori remote. Tidak perlu melakukan push."
        PUSH_SUCCESS=true
    else
        show_cyber_loading "Melakukan commit hanya pada file yang berubah (Partial Update)..."
        git commit -m "$COMMIT_MSG" > /dev/null 2>&1
        write_cyber_success "Commit Partial Update berhasil diterapkan: $COMMIT_MSG"

        if [ "$USE_GIT_LFS" = "true" ] && [ -n "$LFS_EXTS" ]; then
            show_cyber_loading "Mentransmisikan objek binary Git LFS ke server..."
            git lfs push --all origin "$TARGET_BRANCH" > /dev/null 2>&1
        fi

        show_cyber_loading "Membangun terowongan aman (Secure Tunnel)..."
        show_cyber_loading "Mentransmisikan hanya file yang berubah ke GitHub (Partial Update)..."
        if git push -u origin "$TARGET_BRANCH" > push.log 2>&1; then
            PUSH_SUCCESS=true
        fi
    fi
fi

if [ "$PUSH_SUCCESS" = true ]; then
    if [ "$USE_GIT_RELEASE" = "true" ] && [ -n "$FINAL_RELEASE_TAG" ]; then
        write_cyber_header "MEMPUBLIKASIKAN GIT TAG & GITHUB RELEASE ($FINAL_RELEASE_TAG)"
        show_cyber_loading "Membuat & mendorong Git Tag '$FINAL_RELEASE_TAG' ke GitHub..."
        TAG_MSG="Release $FINAL_RELEASE_TAG"
        if [ -n "$RELEASE_NOTES_IN" ]; then
            TAG_MSG="$RELEASE_NOTES_IN"
        fi
        git tag -f -a "$FINAL_RELEASE_TAG" -m "$TAG_MSG" > /dev/null 2>&1
        git push origin "$FINAL_RELEASE_TAG" --force > /dev/null 2>&1
        write_cyber_success "Git Tag '$FINAL_RELEASE_TAG' berhasil di-push ke origin."

        show_cyber_loading "Membuat halaman GitHub Release resmi via API..."
        REL_PAYLOAD=$(printf '{"tag_name":"%s","target_commitish":"%s","name":"Release %s","body":"%s","draft":false,"prerelease":false,"generate_release_notes":true}' "$FINAL_RELEASE_TAG" "$TARGET_BRANCH" "$FINAL_RELEASE_TAG" "$RELEASE_NOTES_IN")
        REL_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" -d "$REL_PAYLOAD" "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/releases")
        if [ "$REL_CODE" = "201" ]; then
            write_cyber_success "GitHub Release '$FINAL_RELEASE_TAG' berhasil diterbitkan!"
        else
            write_cyber_warn "Git Tag '$FINAL_RELEASE_TAG' telah terpasang di GitHub."
        fi
    fi

    write_cyber_header "DEPLOYMENT BERHASIL"
    write_cyber_success "Semua sistem berjalan normal ($GIT_COMMAND_MODE)."
    echo -e " [🔗] Tautan Repositori: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    if [ "$USE_GIT_RELEASE" = "true" ] && [ -n "$FINAL_RELEASE_TAG" ]; then
        echo -e " [🏷️] Tautan Release   : https://github.com/$GITHUB_USERNAME/$REPO_NAME/releases/tag/$FINAL_RELEASE_TAG"
    fi
    if [ "$USE_GIT_LFS" = "true" ] && [ -n "$LFS_EXTS" ]; then
        echo ""
        echo -e " \033[1;33m[!] PENTING UNTUK DEPLOYMENT VERCEL:\033[0m"
        echo -e " -> Tambahkan Environment Variable di Vercel: \033[1;36mVERCEL_GIT_LFS_ENABLED = 1\033[0m"
        echo -e " -> Buka Project Settings > Environment Variables di dashboard Vercel."
        echo -e " -> Tanpa variable ini, Vercel hanya meng-clone file pointer 130-byte sehingga error saat build!"
    fi
else
    write_cyber_header "KEGAGALAN SISTEM !"
    if grep -qE "Authentication failed|403|Bad credentials" push.log; then
        write_cyber_error "Gagal mengautentikasi: Token GitHub kadaluarsa / habis atau izin tidak mencukupi."
        write_cyber_warn "Buka tautan ini untuk membuat atau memperbarui Personal Access Token Anda:"
        echo -e "   [🔗] \033[1;33mhttps://github.com/settings/tokens\033[0m"
    fi
    write_cyber_error "Transmisi ditolak. Rincian Error:"
    cat push.log
fi
rm -f push.log

echo ""
read -p " [>] Tekan [ENTER] untuk keluar: "
clear
exit 0
