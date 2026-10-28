#!/bin/bash

# SYNOPSIS
#     AUTO GIT PUSH (CYBERPUNK EDITION) - LINUX/MACOS VERSION
# DESCRIPTION
#     Script push manual interaktif. Developed by AlinLabs.

# Konfigurasi Warna
C_CYAN='\033[0;36m'
C_DARKCYAN='\033[1;36m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[1;33m'
C_RED='\033[0;31m'
C_WHITE='\033[1;37m'
C_DARKGRAY='\033[1;30m'
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

function read_cyber_input() {
    echo -ne "${C_CYAN} [>] $1 : ${C_NC}"
    read input_val
    echo "$input_val"
}

function show_cyber_loading() {
    echo -e "${C_DARKCYAN} [~] $1${C_NC}"
    sleep 0.5
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

   --> Alinlabs Utility Technology Operations (BASH) <--
EOF

CONFIG_DIR="$HOME/.git-auto-tool"
CONFIG_FILE="$CONFIG_DIR/token.json"

mkdir -p "$CONFIG_DIR"

write_cyber_header "INISIALISASI SISTEM"

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

PROJECT_PATH=$(read_cyber_input "Path Direktori / File ZIP Target")

if [ ! -e "$PROJECT_PATH" ]; then
    write_cyber_error "Path tidak ditemukan: $PROJECT_PATH"
    read -p " [>] Tekan [ENTER] untuk keluar: "
    clear
    exit 1
fi

# Deteksi otomatis apakah target adalah file ZIP atau Direktori
if [[ -f "$PROJECT_PATH" || "$PROJECT_PATH" =~ \.zip$ ]]; then
    write_cyber_header "ARSIP ZIP TERDETEKSI"
    write_cyber_info "Target berupa file arsip ZIP: $PROJECT_PATH"

    if ! command -v unzip &> /dev/null; then
        show_cyber_loading "Memasang utilitas unzip..."
        if command -v pkg &> /dev/null && [ -n "$PREFIX" ] && [[ "$PREFIX" == *"com.termux"* ]]; then
            pkg install unzip -y > /dev/null 2>&1
        elif command -v apk &> /dev/null; then
            apk add unzip > /dev/null 2>&1
        elif command -v brew &> /dev/null; then
            brew install unzip > /dev/null 2>&1
        elif command -v apt-get &> /dev/null; then
            sudo apt-get install unzip -y > /dev/null 2>&1 || true
        fi
    fi

    PARENT_DIR=$(dirname "$PROJECT_PATH")
    ZIP_FILENAME=$(basename "$PROJECT_PATH")
    ZIP_BASENAME="${ZIP_FILENAME%.zip}"
    EXTRACTED_DIR="$PARENT_DIR/$ZIP_BASENAME"

    mkdir -p "$EXTRACTED_DIR"
    show_cyber_loading "Mengekstrak file ZIP ke '$EXTRACTED_DIR'..."
    if unzip -q -o "$PROJECT_PATH" -d "$EXTRACTED_DIR"; then
        write_cyber_success "Ekstraksi file ZIP berhasil diselesaikan."
    else
        write_cyber_error "Gagal mengekstrak arsip ZIP."
        read -p " [>] Tekan [ENTER] untuk keluar: "
        clear
        exit 1
    fi

    # Cek jika di dalam folder hasil ekstraksi hanya terdapat 1 subdirektori
    INNER_COUNT=$(find "$EXTRACTED_DIR" -mindepth 1 -maxdepth 1 | wc -l)
    if [ "$INNER_COUNT" -eq 1 ]; then
        FIRST_INNER=$(find "$EXTRACTED_DIR" -mindepth 1 -maxdepth 1)
        if [ -d "$FIRST_INNER" ]; then
            EXTRACTED_DIR="$FIRST_INNER"
            write_cyber_info "Mengarahkan ke root sub-folder: $EXTRACTED_DIR"
        fi
    fi

    PROJECT_PATH="$EXTRACTED_DIR"
fi

GITHUB_USERNAME=""
TOKEN=""

if [ -f "$CONFIG_FILE" ]; then
    # Di bash, kita baca via grep/awk sedehana jika tidak ada jq
    saved_username=$(grep -o '"username":"[^"]*' "$CONFIG_FILE" | grep -o '[^"]*$')
    saved_token=$(grep -o '"token":"[^"]*' "$CONFIG_FILE" | grep -o '[^"]*$')
    write_cyber_info "Kredensial Tersimpan Ditemukan:"
    write_cyber_info "Pengguna: $saved_username"
    write_cyber_info "Token   : ***************"
    
    echo ""
    USE_OLD_TOKEN=$(read_cyber_input "Gunakan kredensial aktif ini? (Y/N)")
    if [[ "$USE_OLD_TOKEN" =~ ^[Yy]$ ]]; then
        TOKEN="$saved_token"
        GITHUB_USERNAME="$saved_username"
    else
        TOKEN=$(read_cyber_input "Masukkan Token GitHub Baru")
        GITHUB_USERNAME=$(read_cyber_input "Masukkan Username GitHub Baru")
        echo "{\"username\":\"$GITHUB_USERNAME\", \"token\":\"$TOKEN\"}" > "$CONFIG_FILE"
        write_cyber_success "Kredensial Berhasil Diperbarui"
    fi
else
    write_cyber_warn "Tidak ada kredensial tersimpan"
    TOKEN=$(read_cyber_input "Masukkan Token GitHub")
    GITHUB_USERNAME=$(read_cyber_input "Masukkan Username GitHub")
    echo "{\"username\":\"$GITHUB_USERNAME\", \"token\":\"$TOKEN\"}" > "$CONFIG_FILE"
    write_cyber_success "Kredensial Berhasil Disimpan"
fi

    # FASE 1: VALIDASI KEABSAHAN TOKEN & KUOTA (MEMBEDAKAN TOKEN MATI / HABIS VS REPOSITORI TIDAK ADA)
    write_cyber_header "VERIFIKASI TOKEN GITHUB"
    TOKEN_VALID=false
    while [ "$TOKEN_VALID" = false ]; do
        show_cyber_loading "Memvalidasi kredensial dan sisa kuota Token..."
        USER_RESP=$(curl -s -w "\n%{http_code}" -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" "https://api.github.com/user")
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
            ACTION_CHOICE=$(read_cyber_input "Pilih tindakan (1/2/3, Bawaan: 2)")
            if [ "$ACTION_CHOICE" == "1" ]; then
                if command -v xdg-open &> /dev/null; then xdg-open "https://github.com/settings/tokens" >/dev/null 2>&1
                elif command -v open &> /dev/null; then open "https://github.com/settings/tokens" >/dev/null 2>&1; fi
                TOKEN=$(read_cyber_input "Masukkan Token GitHub Baru")
                echo "{\"username\":\"$GITHUB_USERNAME\", \"token\":\"$TOKEN\"}" > "$CONFIG_FILE"
            elif [ "$ACTION_CHOICE" == "3" ]; then
                write_cyber_error "Sesi dibatalkan karena masalah token."
                exit 1
            else
                TOKEN=$(read_cyber_input "Masukkan Token GitHub Baru")
                echo "{\"username\":\"$GITHUB_USERNAME\", \"token\":\"$TOKEN\"}" > "$CONFIG_FILE"
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
            ACTION_CHOICE=$(read_cyber_input "Pilih tindakan (1/2/3, Bawaan: 2)")
            if [ "$ACTION_CHOICE" == "1" ]; then
                if command -v xdg-open &> /dev/null; then xdg-open "https://github.com/settings/tokens" >/dev/null 2>&1
                elif command -v open &> /dev/null; then open "https://github.com/settings/tokens" >/dev/null 2>&1; fi
                TOKEN=$(read_cyber_input "Masukkan Token GitHub Baru")
                echo "{\"username\":\"$GITHUB_USERNAME\", \"token\":\"$TOKEN\"}" > "$CONFIG_FILE"
            elif [ "$ACTION_CHOICE" == "3" ]; then
                write_cyber_error "Sesi dibatalkan karena masalah token."
                exit 1
            else
                TOKEN=$(read_cyber_input "Masukkan Token GitHub Baru")
                echo "{\"username\":\"$GITHUB_USERNAME\", \"token\":\"$TOKEN\"}" > "$CONFIG_FILE"
            fi
        fi
    done

    # FASE 2: CEK KEBERADAAN REPOSITORI DI GITHUB
    REPO_NAME=$(read_cyber_input "Nama Repositori Target")
    if [ -z "$REPO_NAME" ]; then REPO_NAME="my-project"; fi

    write_cyber_header "MEMERIKSA STATUS REPOSITORI"
    
    REPO_EXISTS=false
    while [ "$REPO_EXISTS" = false ]; do
        show_cyber_loading "Mengecek keberadaan repositori '$REPO_NAME' di akun '$GITHUB_USERNAME'..."
        REPO_RES=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME")
        
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
                CREATE_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" -d "{\"name\":\"$REPO_NAME\", \"private\":false}" "https://api.github.com/user/repos")
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
                CHECK_CANDIDATE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" "https://api.github.com/repos/$GITHUB_USERNAME/$CANDIDATE_REPO")
                
                if [ "$CHECK_CANDIDATE" == "200" ]; then
                    REPO_NAME="$CANDIDATE_REPO"
                    write_cyber_success "Repositori '$REPO_NAME' terdeteksi di GitHub!"
                    write_cyber_info "Code akan ditulis dan di-push ke repositori '$REPO_NAME'."
                    REPO_EXISTS=true
                else
                    write_cyber_info "Repositori '$CANDIDATE_REPO' tidak ditemukan di GitHub. Dianggap sebagai instruksi pembuatan repo baru..."
                    show_cyber_loading "Membuat repositori baru '$CANDIDATE_REPO' di GitHub..."
                    CREATE_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: Alinlabs-Git-Push" -d "{\"name\":\"$CANDIDATE_REPO\", \"private\":false}" "https://api.github.com/user/repos")
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

    REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
BRANCH=$(read_cyber_input "Cabang Target (Bawaan: main)")
if [ -z "$BRANCH" ]; then BRANCH="main"; fi

echo ""
LFS_EXTS=$(read_cyber_input "Tulis eksistensi file Git LFS (contoh: .mp4, .zip)")
LFS_SIZE=""
if [ -n "$LFS_EXTS" ]; then
    LFS_SIZE=$(read_cyber_input "Size file spesifik (kosongkan jika semua ukuran)")
fi

echo ""
CUSTOM_COMMIT=$(read_cyber_input "Pesan Commit (Biarkan kosong untuk Auto Timestamp)")

clear
write_cyber_header "MANIFEST DEPLOYMENT"
echo -e "  [-] Path Target : ${C_WHITE}$PROJECT_PATH${C_NC}"
echo -e "  [-] Username    : ${C_WHITE}$GITHUB_USERNAME${C_NC}"
echo -e "  [-] Repositori  : ${C_WHITE}$REPO_NAME${C_NC}"
echo -e "  [-] URL Remote  : ${C_WHITE}$REPO_URL${C_NC}"
echo -e "  [-] Cabang      : ${C_WHITE}$BRANCH${C_NC}"

CONFIRM=$(read_cyber_input "Eksekusi Payload? (ENTER=YA / N=BATAL)")
if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
    write_cyber_error "Deployment Dibatalkan oleh Pengguna"
    read -p " [>] Tekan [ENTER] untuk keluar: "
    clear
    exit 0
fi

clear
write_cyber_header "MENGEKSEKUSI GIT PAYLOAD"

cd "$PROJECT_PATH"

show_cyber_loading "Memeriksa alokasi file README..."
deleted_any=false
for f in README.md readme.md READMI.md readmi.md; do
    if [ -f "$f" ]; then
        rm -f "$f"
        deleted_any=true
    fi
done
if [ "$deleted_any" = true ]; then
    write_cyber_info "README lama di root berhasil dihapus."
fi

if [ -d "public" ]; then
    for f in README.md readme.md READMI.md readmi.md; do
        if [ -f "public/$f" ]; then
            mv -f "public/$f" "README.md"
            write_cyber_info "Sistem mendeteksi README di /public dan telah dipindahkan ke root."
            break
        fi
    done
fi

show_cyber_loading "Mengecek integritas ruang kerja (Workspace)..."
if [ ! -d ".git" ]; then
    write_cyber_warn "Git belum diinisialisasi. Menyuntikkan struktur Git..."
    git init > /dev/null 2>&1
    write_cyber_success "Inisialisasi Git Selesai"
fi

show_cyber_loading "Mengaktifkan protokol LFS (Large File Storage)..."
git lfs install > /dev/null 2>&1

if [ -n "$LFS_EXTS" ]; then
    show_cyber_loading "Menerapkan aturan Git LFS..."
    IFS=',' read -ra ADDR <<< "$LFS_EXTS"
    for ext in "${ADDR[@]}"; do
        ext=$(echo "$ext" | xargs)
        if [ -n "$ext" ]; then
            if [[ "$ext" != \** ]]; then ext="*$ext"; fi
            git lfs track "$ext" > /dev/null 2>&1
        fi
    done
    git add .gitattributes > /dev/null 2>&1
    git add --renormalize . > /dev/null 2>&1
fi

AUTH_REPO_URL="https://${GITHUB_USERNAME}:${TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

if ! git remote | grep -q "^origin$"; then
    write_cyber_info "Menyuntikkan Remote 'origin'..."
    git remote add origin "$AUTH_REPO_URL" > /dev/null 2>&1
else
    write_cyber_info "Memperbarui Remote 'origin'..."
    git remote set-url origin "$AUTH_REPO_URL" > /dev/null 2>&1
fi

# Menonaktifkan credential helper lokal agar token baru (dari URL) selalu digunakan
git config --local credential.helper "" > /dev/null 2>&1

show_cyber_loading "Membangun indeks modifikasi (Staging Area)..."
git add . > /dev/null 2>&1

show_cyber_loading "Mengenkripsi metadata commit..."
if [ -z "$CUSTOM_COMMIT" ]; then
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    COMMIT_MSG="[UPDATE-SISTEM] Auto-Push $TIMESTAMP"
else
    COMMIT_MSG="$CUSTOM_COMMIT"
fi

if ! git status --porcelain | grep -q "."; then
    write_cyber_warn "Tidak ada perubahan sistem yang terdeteksi untuk di-commit (Clear)"
else
    show_cyber_loading "Melakukan commit data..."
    git commit -m "$COMMIT_MSG" > /dev/null 2>&1
    write_cyber_success "Commit berhasil diterapkan: $COMMIT_MSG"
fi

show_cyber_loading "Mengkalibrasi uplink ke Node Utama (GitHub)..."
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    git branch -M "$BRANCH" > /dev/null 2>&1
elif [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    git branch -M "$BRANCH" > /dev/null 2>&1
fi

if [ -n "$LFS_EXTS" ]; then
    show_cyber_loading "Mentransmisikan objek binary Git LFS ke server..."
    git lfs push --all origin "$BRANCH" > /dev/null 2>&1
fi

show_cyber_loading "Membangun terowongan aman (Secure Tunnel)..."
show_cyber_loading "Mentransmisikan file ke repositori (Push)..."

if git push -u origin "$BRANCH" --force > push.log 2>&1; then
    write_cyber_header "DEPLOYMENT BERHASIL"
    write_cyber_success "Semua sistem berjalan normal."
    echo -e " [🔗] Tautan Repositori: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    if [ -n "$LFS_EXTS" ]; then
        echo ""
        echo -e " \033[1;33m[!] PENTING UNTUK DEPLOYMENT VERCEL:\033[0m"
        echo -e " -> Tambahkan Environment Variable di Vercel: \033[1;36mVERCEL_GIT_LFS_ENABLED = 1\033[0m"
        echo -e " -> Buka Project Settings > Environment Variables di dashboard Vercel."
        echo -e " -> Tanpa variable ini, Vercel hanya meng-clone file pointer 130-byte sehingga error saat build!"
    fi
else
    write_cyber_header "KEGAGALAN SISTEM !"
    write_cyber_error "Transmisi ditolak. Rincian Error:"
    cat push.log
fi
rm -f push.log

echo ""
read -p " [>] Tekan [ENTER] untuk keluar: "
clear
exit 0

