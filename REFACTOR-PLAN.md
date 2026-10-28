# REFACTOR-PLAN: Optimasi Performa, Arsitektur Modular & Eliminasi Lag (AUTO)

> **Aturan Eksekusi Bertahap:**
> 1. **Zero UI/UX Change**: Tidak mengubah tampilan, warna, tata letak, maupun perilaku visual apa pun.
> 2. **Zero Functional Regression**: Seluruh fitur (real-time script generator `.ps1`/`.cmd`/`.sh`, deteksi otomatis `.zip` vs `Folder`, Git LFS, File Library, Terminal/HTML/Lottie Simulator, PWA) tetap berjalan 100% identik.
> 3. **Zero Code Duplication**: Setiap pemecahan file menggunakan prinsip *Single Source of Truth* (satu fungsi/logika hanya ada di satu tempat).
> 4. **Auto-Cleanup Checklist**: Setiap poin/tahap di bawah ini yang **sudah selesai dieksekusi dan terverifikasi (`compile_applet`) akan langsung dihapus dari file `REFACTOR-PLAN.md` ini** hingga seluruh tahap tuntas.

---

## Hasil Analisa Akar Masalah (Root Cause Analysis)

Berdasarkan audit menyeluruh terhadap kode sumber saat ini, ditemukan **5 penyebab utama** mengapa aplikasi terasa berat di beberapa perangkat, lag saat menggeser pembatas (resizer) sidebar, dan berat saat mengetik di kolom input sidebar:

1. **Bottleneck Resizer Sidebar (`src/App.tsx` baris 137–174)**:
   - Setiap pergerakan kursor/sentuhan (`mousemove` / `touchmove`) memanggil `setSidebarWidth(newWidth)` secara langsung di state komponen induk `MainApp`.
   - Akibatnya, menggeser sidebar sejauh 100px memicu **60–120 kali *full re-render* seluruh aplikasi per detik** (termasuk merender ulang `SyntaxHighlighter` 600+ baris kode dan menulis ke `localStorage` pada setiap frame).
2. **Double Re-Render & Blocking AST Syntax Highlighting Saat Mengetik di Sidebar (`src/App.tsx` & `src/code-area/CodeEditorView.tsx`)**:
   - Setiap ketikan 1 huruf pada input sidebar (`Path Target`, `Token`, `Username`, `Repositori`, `Branch`, `Commit`, `Git LFS`) memicu:
     - Render #1: Perubahan state input di `MainApp`.
     - Render #2: `useEffect` memanggil `handleGenerateCode()` -> `setGeneratedScript()` yang langsung memicu *full re-render* kedua.
     - Pada saat yang sama, `<SyntaxHighlighter>` (`react-syntax-highlighter` full Prism bundle) mem-parsing ulang **600+ baris (~30 KB) kode PowerShell/Bash menjadi ribuan elemen DOM `<span>` secara sinkron di *main thread*** sebelum browser sempat menampilkan huruf yang diketik pengguna.
3. **Import Full Bundle `react-syntax-highlighter` & Eager Loading Modul Berat**:
   - `CodeEditorView.tsx` mengimpor `Prism` penuh (~270 bahasa pemrograman sekaligus) alih-alih `PrismLight` yang hanya mendaftarkan bahasa yang dipakai.
   - Komponen berat yang belum tentu dibuka saat awal (`Simulator`, `@lottiefiles/dotlottie-react`, `jszip`, serta 8 komponen `Modal`) di-load sekaligus di awal (*eager import*), membebani RAM dan waktu *parse* JS di perangkat menengah/bawah.
4. **Prop-Drilling Masif & File Monolitik**:
   - `src/App.tsx` (~600 baris) menyimpan lebih dari 20 state sekaligus dan meneruskannya ke `Sidebar` serta `CodeArea` (25+ props). Perubahan kecil pada 1 state menyebabkan seluruh pohon komponen ikut di-render ulang.
   - `src/sidebar/auto.tsx` (~875 baris) dan `src/components/SaveToCacheModal.tsx` (~560 baris) terlalu besar dalam satu file tanpa pemisahan sub-komponen yang ter-memoisasi (`React.memo`).
5. **Kalkulasi `new Blob()` & `.split('\n')` Berulang di Setiap Render**:
   - `Footer.tsx` dan `CodeAreaMain.tsx` menghitung `scriptContent.split('\n')` serta `new Blob([scriptContent]).size` secara langsung di body render tanpa `useMemo`.

---

## Rencana Eksekusi Bertahap (Step-by-Step Execution Plan)

✅ **Seluruh tahap refactoring (Tahap 1 s/d Tahap 5) telah selesai dieksekusi, terverifikasi melalui build (`compile_applet`), dan dihapus dari daftar antrean sesuai aturan Auto-Cleanup Checklist.**
