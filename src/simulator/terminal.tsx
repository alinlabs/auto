import React, { useState, useEffect, useRef } from 'react';
import { ReleaseBumpType } from '../sidebar/components/GitReleaseSection';

const banner = `
   █████████   █████  █████ ███████████    ███████   
  ███▒▒▒▒▒███ ▒▒███  ▒▒███ ▒█▒▒▒███▒▒▒█  ███▒▒▒▒▒███ 
 ▒███    ▒███  ▒███   ▒███ ▒   ▒███  ▒  ███     ▒▒███
 ▒███████████  ▒███   ▒███     ▒███    ▒███      ▒███
 ▒███▒▒▒▒▒███  ▒███   ▒███     ▒███    ▒███      ▒███
 ▒███    ▒███  ▒███   ▒███     ▒███    ▒▒███     ███ 
 █████   █████ ▒▒████████      █████    ▒▒▒███████▒  
▒▒▒▒▒   ▒▒▒▒▒   ▒▒▒▒▒▒▒▒      ▒▒▒▒▒       ▒▒▒▒▒▒▒    

   --> Alinlabs Utility Technology Operations <--
`;

export interface TerminalSimulatorProps {
  customCommit: string;
  isCommitTimeEnabled?: boolean;
  scriptMode: 'MANUAL' | 'AUTO';
  gitCommand?: 'FORCE_PUSH' | 'PARTIAL_UPDATE';
  isRepoMetaEnabled?: boolean;
  repoTopics?: string;
  repoDescription?: string;
  isReadmeDetectorEnabled?: boolean;
  readmeDetectorMode?: 'AUTO' | 'MANUAL';
  isReleaseEnabled?: boolean;
  releaseMode?: 'AUTO' | 'MANUAL';
  releaseBump?: ReleaseBumpType;
  releaseTag?: string;
  autoPath: string;
  autoUsername: string;
  autoToken: string;
  autoRepo: string;
  autoBranch: string;
  lfsExtensions?: string;
  lfsSizeLimit?: string;
  zoom: number;
  fileName?: string;
  scriptExtension?: string;
  scriptContent?: string;
}

export default function TerminalSimulator({ 
  customCommit, 
  isCommitTimeEnabled = true,
  scriptMode, 
  gitCommand = 'FORCE_PUSH',
  isRepoMetaEnabled = false,
  repoTopics = '',
  repoDescription = '',
  isReadmeDetectorEnabled = true,
  readmeDetectorMode = 'AUTO',
  isReleaseEnabled = false,
  releaseMode = 'AUTO',
  releaseBump = 'patch',
  releaseTag = '',
  autoPath, 
  autoUsername, 
  autoToken, 
  autoRepo, 
  autoBranch, 
  lfsExtensions = '', 
  lfsSizeLimit = '', 
  zoom 
}: TerminalSimulatorProps) {
  const [lines, setLines] = useState<React.ReactNode[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [step, setStep] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initRef = useRef(false);

  const [data, setData] = useState({
    path: '',
    useOld: '',
    username: 'CyberAdmin',
    repo: '',
    branch: 'main',
    customCommit: '',
    lfsExtensions: '',
    lfsSizeLimit: ''
  });

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines, step]);

  const addLine = (content: React.ReactNode) => {
    setLines(prev => [...prev, content]);
  };

  const CyberHeader = (text: string) => (
    <div className="my-2">
      <div className="text-[#008b8b] font-bold whitespace-pre">{" ======================================================="}</div>
      <div className="text-[#00f3ff] font-bold">{"  > " + text}</div>
      <div className="text-[#008b8b] font-bold whitespace-pre">{" ======================================================="}</div>
    </div>
  );

  const CyberInfo = (text: string) => <div className="text-[#008b8b] font-bold">{" [~] " + text}</div>;
  const CyberSuccess = (text: string) => <div className="text-[#00ff00] font-bold">{" [+] " + text}</div>;
  const CyberWarn = (text: string) => <div className="text-[#ffff00] font-bold">{" [!] " + text}</div>;
  const CyberError = (text: string) => <div className="text-[#ff0000] font-bold">{" [x] " + text}</div>;
  const CyberInputPrompt = (prompt: string) => <span className="text-[#00f3ff] font-bold">{" [>] " + prompt + " : "}</span>;

  const CyberLoadingNode = ({ text }: { text: string }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setProgress(current);
        if (current >= 40) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }, []);

    if (progress >= 40) {
      return (
        <div className="font-bold flex items-center whitespace-pre">
          <span className="text-[#008b8b]">{` [~] ${text} `}</span>
          <span className="text-[#00ff00]">✓</span>
        </div>
      );
    }

    return (
      <div className="font-bold flex flex-col whitespace-pre">
        <span className="text-[#008b8b]">{` [~] ${text}`}</span>
        <span className="flex items-center text-[10px] mt-1 tracking-[-1px]">
          <span className="text-[#008b8b] tracking-normal font-bold">{" ["}</span>
          <span className="text-[#00f3ff] mx-1">{Array(progress).fill('■').join('')}</span>
          <span className="text-white/20">{Array(40 - progress).fill('■').join('')}</span>
          <span className="text-[#008b8b] tracking-normal ml-1 font-bold">{`] ${Math.round((progress/40)*100)}%`}</span>
        </span>
      </div>
    );
  };

  // Inisialisasi awal
  useEffect(() => {
    if (step === 0 && !initRef.current) {
      initRef.current = true;
      
      setLines([
        <pre key="banner" className="text-[#00f3ff] leading-tight font-bold">{banner}</pre>,
        <div key="hdr">{CyberHeader(`INISIALISASI SISTEM${scriptMode === 'AUTO' ? ' (AUTO MODE)' : ''}`)}</div>
      ]);
      
      const simulateGitCheck = async () => {
        addLine(<CyberLoadingNode text="Memeriksa modul Git..." />);
        await new Promise(r => setTimeout(r, 1100));
        setLines(prev => {
          const newLines = [...prev];
          newLines[newLines.length - 1] = <div key="gitOk">{CyberSuccess("Git terdeteksi: git version 2.40.1.windows.1")}</div>;
          return newLines;
        });

        if (scriptMode === 'AUTO') {
          setStep(100);
          simulateAutoExecution();
        } else {
          setStep(1);
        }
        initRef.current = false;
      };
      
      simulateGitCheck();
    }
  }, [step, scriptMode]);

  const simulateTree = async (isManual = false) => {
    const treeFiles = [
      "index.html", "src/main.tsx", "src/App.tsx", "src/index.css",
      "src/sidebar/Sidebar.tsx", "src/code-area/CodeArea.tsx", "src/simulator/TerminalSimulator.tsx",
      "src/assets/code/auto.ps1", "src/assets/code/manual.ps1", "src/assets/code/linux.sh",
      "vite.config.ts", "tailwind.config.js", "tsconfig.json", "package.json", "README.md"
    ];
    const suffix = isManual ? "-manual" : "-auto";
    setLines(prev => [...prev, <div key={`tree-analyzing${suffix}`} className="text-[#008b8b] font-bold">   [~] Menganalisa struktur payload...</div>]);
    for (let i = 0; i < treeFiles.length; i++) {
      const f = treeFiles[i];
      await new Promise(r => setTimeout(r, 40));
      setLines(prev => [...prev, <div key={`tree-${f}${suffix}-${i}`} className="text-gray-500 font-bold">       |-- {f}</div>]);
    }
    await new Promise(r => setTimeout(r, 600));
    setLines(prev => prev.slice(0, prev.length - treeFiles.length - 1));
  };

  const simulateAutoExecution = async () => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    const isZip = (autoPath || '').trim().toLowerCase().endsWith('.zip');
    if (isZip) {
      const targetDir = autoPath.replace(/\.zip$/i, '');
      addLine(CyberHeader("ARSIP ZIP TERDETEKSI"));
      addLine(CyberInfo(`Target berupa file arsip ZIP: ${autoPath}`));
      addLine(<CyberLoadingNode text={`Mengekstrak file ZIP ke '${targetDir}'...`} />);
      await sleep(1200);
      addLine(CyberSuccess("Ekstraksi file ZIP berhasil diselesaikan."));
      addLine(CyberSuccess(`Akses ruang kerja diizinkan: ${targetDir}`));
    } else {
      await sleep(600);
      addLine(CyberSuccess(`Akses ruang kerja diizinkan: ${autoPath || 'C:\\Project'}`));
    }

    if (isReadmeDetectorEnabled) {
      await sleep(500);
      addLine(CyberHeader("README DETECTOR (PEMINDAI FILE README.MD)"));
      if (readmeDetectorMode === 'AUTO') {
        addLine(<CyberLoadingNode text="Memeriksa file README.md di direktori public (Auto Change)..." />);
        await sleep(800);
        addLine(CyberSuccess("Auto Change: File .\\public\\README.md berhasil dipindahkan ke .\\README.md (Root)!"));
        addLine(CyberInfo("Melanjutkan proses secara otomatis tanpa membuka editor..."));
      } else {
        addLine(<CyberLoadingNode text="Mencari keberadaan file README.md di Root dan direktori public..." />);
        await sleep(900);
        addLine(CyberWarn("Terdeteksi file README.md di 2 lokasi: Root (.\\README.md) & Public (.\\public\\README.md)"));
        addLine(CyberInfo("Pilihan Tindakan (Manual Change): [1] Pindahkan public/README.md ke Root | [2] Buka & Cek Notepad | [3] Skip"));
        addLine(CyberSuccess("File .\\public\\README.md dipindahkan & menimpa .\\README.md di Root (Siap dicek di Notepad / Lanjut proses)."));
      }
    }
    
    await sleep(600);
    addLine(CyberHeader("VERIFIKASI TOKEN GITHUB"));
    addLine(<CyberLoadingNode text="Memvalidasi kredensial dan sisa kuota Token..." />);
    await sleep(1000);
    
    if (autoToken === 'error403' || autoToken.toLowerCase() === 'habis' || autoToken.toLowerCase() === 'expired') {
      addLine(<br/>);
      addLine(CyberHeader("AUTENTIKASI TOKEN GAGAL (BUKAN MASALAH REPO) !"));
      addLine(CyberError("TOKEN GITHUB HABIS / KADALUARSA / TIDAK VALID!"));
      addLine(CyberWarn("Buka dan perbarui Personal Access Token Anda di tautan berikut:"));
      addLine(<div className="text-yellow-300 font-bold">   [🔗] https://github.com/settings/tokens</div>);
      addLine(<div className="text-white/60">   (Pastikan memiliki centang izin 'repo' dan 'workflow')</div>);
      setStep(10);
      return;
    }
    
    addLine(CyberSuccess(`Token GitHub AKTIF & TERVERIFIKASI! (Akun: ${autoUsername || 'CyberAdmin'})`));
    
    await sleep(600);
    addLine(CyberHeader("MEMERIKSA STATUS REPOSITORI"));
    addLine(<CyberLoadingNode text={`Mengecek keberadaan repositori '${autoRepo || 'my-project'}' di GitHub...`} />);
    await sleep(1000);

    if (autoRepo === 'error404' || autoRepo === 'tidak-ada') {
      addLine(CyberWarn(`Repositori '${autoRepo || 'my-project'}' TIDAK DITEMUKAN di akun GitHub '${autoUsername || 'CyberAdmin'}'!`));
      addLine(CyberInfo("Menganggap sebagai instruksi pembuatan repositori baru..."));
      addLine(<CyberLoadingNode text={`Membuat repositori baru '${autoRepo || 'my-project'}' di GitHub...`} />);
      await sleep(1100);
      addLine(CyberSuccess(`Repositori baru '${autoRepo || 'my-project'}' berhasil dibuat di GitHub! Code akan ditulis ke sana.`));
    } else {
      addLine(CyberSuccess(`Repositori '${autoRepo || 'my-project'}' TERDETEKSI di GitHub!`));
      addLine(CyberInfo("Code akan ditulis dan di-push ke repositori ini."));
    }

    await sleep(600);
    addLine(CyberSuccess("Remote URL (origin) dikonfigurasi."));

    if (isRepoMetaEnabled && (repoTopics.trim() || repoDescription.trim())) {
      await sleep(500);
      addLine(CyberHeader("SINKRONISASI TOPIC & DESKRIPSI REPOSITORY"));
      if (repoDescription.trim()) {
        addLine(<CyberLoadingNode text="Memperbarui deskripsi repositori di GitHub..." />);
        await sleep(800);
        addLine(CyberSuccess(`Deskripsi Repository diperbarui (${repoDescription.trim().slice(0, 350).length}/350 karakter).`));
      }
      if (repoTopics.trim()) {
        const cleanTopics = repoTopics
          .split(/[,\s]+/)
          .map(t => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, ''))
          .filter(Boolean)
          .join(', ');
        addLine(<CyberLoadingNode text="Memperbarui topik (Topics) repositori di GitHub..." />);
        await sleep(800);
        addLine(CyberSuccess(`Topik Repository diperbarui: ${cleanTopics}`));
      }
    }

    await sleep(600);
    addLine(<br/>);
    addLine(CyberHeader(`MENGEKSEKUSI GIT PAYLOAD (${gitCommand})`));
    
    addLine(<CyberLoadingNode text="Mengecek integritas ruang kerja (Workspace)..." />);
    await sleep(1100);
    addLine(<CyberLoadingNode text="Memindai file sistem dan direktori..." />);
    await sleep(1100);

    if (gitCommand === 'FORCE_PUSH') {
      addLine(CyberInfo("Command Git: FORCE PUSH (Menimpa semua file & menghapus yang tidak sesuai folder baru)"));
      addLine(<CyberLoadingNode text="Mereset indeks untuk sinkronisasi penuh folder baru..." />);
      await sleep(1000);
    } else {
      addLine(CyberInfo("Command Git: PARTIAL UPDATE (Hanya mengupdate file yang berubah dari folder)"));
      addLine(<CyberLoadingNode text={`Mengambil indeks cabang '${autoBranch || 'main'}' dari GitHub...`} />);
      await sleep(1000);
      addLine(<CyberLoadingNode text="Menyelaraskan state remote (mempertahankan file yang tidak disentuh)..." />);
      await sleep(1000);
    }

    addLine(<CyberLoadingNode text="Mengaktifkan protokol LFS (Large File Storage)..." />);
    await sleep(1100);
    
    if (lfsExtensions && lfsExtensions.trim() !== '') {
        addLine(<CyberLoadingNode text={`Mengekstrak aturan Git LFS untuk: ${lfsExtensions}`} />);
        await sleep(1100);
        if (lfsSizeLimit && lfsSizeLimit.trim() !== '') {
            addLine(<CyberLoadingNode text={`Menerapkan batas ukuran file LFS minimum: ${lfsSizeLimit}MB`} />);
            await sleep(1100);
        }
    }

    if (gitCommand === 'FORCE_PUSH') {
      addLine(<CyberLoadingNode text="Membangun indeks penuh seluruh file di folder baru (git add -A)..." />);
    } else {
      addLine(<CyberLoadingNode text="Memindai hanya file yang berubah dari folder (Partial Update)..." />);
    }
    await sleep(1100);
    addLine(<CyberLoadingNode text="Mengekstraksi metadata objek yang di-stage..." />);
    await sleep(1100);

    await simulateTree();
    
    addLine(<br/>);
    addLine(<div className="text-[#00f3ff] font-bold">   === INFORMASI PAYLOAD ===</div>);
    const localSourceDisplay = isZip ? `${autoPath.replace(/\.zip$/i, '')} (dari ${autoPath})` : (autoPath || 'C:\\Project');
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Sumber Lokal : </span><span className="text-white">{localSourceDisplay}</span></div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Target Repo  : </span><span className="text-white">{autoUsername && autoRepo ? `github.com/${autoUsername}/${autoRepo}` : 'github.com/user/repo'}</span></div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Cabang       : </span><span className="text-white">{autoBranch || 'main'}</span></div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Command Git  : </span><span className="text-white">{gitCommand === 'FORCE_PUSH' ? 'Force Push (Timpa Semua & Hapus Yang Tidak Sesuai)' : 'Partial Update (Hanya Update File yang Berubah)'}</span></div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Total File   : </span><span className="text-white">{Math.floor(Math.random() * 20 + 2)} file(s)</span></div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Est. Ukuran  : </span><span className="text-white">{(Math.random() * 5 + 0.1).toFixed(2)} MB</span></div>);
    addLine(<br/>);

    addLine(<CyberLoadingNode text={`Mengenkripsi metadata commit (${gitCommand === 'FORCE_PUSH' ? 'Force Push' : 'Partial Update'})...`} />);
    await sleep(1100);

    addLine(<CyberLoadingNode text="Melakukan commit data..." />);
    await sleep(1100);
    
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const prefix = gitCommand === 'FORCE_PUSH' ? '[FORCE-PUSH]' : '[PARTIAL-UPDATE]';
    const formattedSimCommit = customCommit.trim()
      ? (isCommitTimeEnabled ? `${customCommit.trim()} (${dateStr})` : customCommit.trim())
      : (isCommitTimeEnabled ? `${prefix} Auto-Push ${dateStr}` : `${prefix} Auto-Push`);
    addLine(CyberSuccess(`Commit berhasil diterapkan: ${formattedSimCommit}`));
    
    await sleep(600);
    addLine(<CyberLoadingNode text="Mengkalibrasi uplink ke Node Utama (GitHub)..." />);
    await sleep(1100);
    
    addLine(<CyberLoadingNode text="Membangun terowongan aman (Secure Tunnel)..." />);
    await sleep(1100);
    addLine(<CyberLoadingNode text={gitCommand === 'FORCE_PUSH' ? "Mentransmisikan paket data penuh & menghapus file lama yang tidak sesuai (Force Push)..." : "Mentransmisikan hanya file yang berubah ke GitHub (Partial Update)..."} />);
    await sleep(1100);
    
    if (autoBranch === 'conflict') {
        addLine(<br/>);
        addLine(CyberHeader("KEGAGALAN SISTEM !"));
        addLine(CyberError("Terdeteksi pembaruan data di server. Mohon tarik data (pull) manual terlebih dahulu."));
        addLine(CyberError("Transmisi ditolak. Rincian Error:"));
        addLine(<div className="text-[#ff0000] whitespace-pre">{`To https://github.com/${autoUsername}/${autoRepo}.git\n ! [rejected]        ${autoBranch} -> ${autoBranch} (fetch first)\nerror: failed to push some refs`}</div>);
    } else {
        const isMajorCommit = /\b(breaking|major|rombak|arsitektur|rewrite)\b/i.test(customCommit);
        const isPatchCommit = /\b(fix|patch|bug|typo|hotfix)\b/i.test(customCommit);
        const autoAnalyzedBump = isMajorCommit ? 'MAJOR' : isPatchCommit ? 'PATCH' : 'MINOR';
        const resolvedSimTag =
          releaseMode === 'MANUAL' && releaseTag.trim()
            ? (releaseTag.trim().startsWith('v') ? releaseTag.trim() : `v${releaseTag.trim()}`)
            : autoAnalyzedBump === 'MAJOR'
            ? 'v2.0.0'
            : autoAnalyzedBump === 'MINOR'
            ? 'v1.1.0'
            : 'v1.0.1';

        if (isReleaseEnabled) {
          addLine(<br/>);
          addLine(CyberHeader(`MEMPUBLIKASIKAN GIT TAG & GITHUB RELEASE (${resolvedSimTag})`));
          if (releaseMode === 'AUTO') {
            addLine(<CyberLoadingNode text="Menganalisa skala perubahan kode secara otomatis (Smart SemVer Analyzer)..." />);
            await sleep(900);
            addLine(CyberInfo(`Hasil Analisa Otomatis: +3 baru, ~5 diubah, -0 dihapus -> Level: ${autoAnalyzedBump}`));
            addLine(CyberSuccess(`Tag sebelumnya 'v1.0.0' -> Otomatis dinaikkan (${autoAnalyzedBump}) ke '${resolvedSimTag}'`));
          }
          addLine(CyberSuccess(`Versi di package.json otomatis diperbarui ke: ${resolvedSimTag.replace(/^v/, '')}`));
          addLine(<CyberLoadingNode text={`Membuat & mendorong Git Tag '${resolvedSimTag}' ke GitHub...`} />);
          await sleep(1000);
          addLine(CyberSuccess(`Git Tag '${resolvedSimTag}' berhasil di-push ke origin.`));
          addLine(<CyberLoadingNode text="Membuat halaman GitHub Release resmi via API..." />);
          await sleep(1000);
          addLine(CyberSuccess(`GitHub Release '${resolvedSimTag}' berhasil diterbitkan!`));
        }

        addLine(<br/>);
        addLine(CyberHeader("DEPLOYMENT BERHASIL"));
        addLine(CyberSuccess("Semua sistem berjalan normal."));
        addLine(<br/>);
        addLine(<div className="text-[#00f3ff] font-bold"> [🔗] Tautan Repositori: {autoUsername && autoRepo ? `https://github.com/${autoUsername}/${autoRepo}` : 'https://github.com/user/repo'}</div>);
        if (isReleaseEnabled) {
          addLine(<div className="text-[#00ff00] font-bold"> [🏷️] Tautan Release   : {autoUsername && autoRepo ? `https://github.com/${autoUsername}/${autoRepo}/releases/tag/${resolvedSimTag}` : `https://github.com/user/repo/releases/tag/${resolvedSimTag}`}</div>);
        }
    }
    
    setStep(10); // Menunggu reset
  };

  const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = inputVal;
      setInputVal('');
      
      if (step === 1) {
        const isZip = (val || '').trim().toLowerCase().endsWith('.zip');
        addLine(<div>{CyberInputPrompt("Path Direktori / File ZIP Target")}<span className="text-white">{val || 'C:\\Project'}</span></div>);
        if (isZip) {
          const targetDir = (val || '').replace(/\.zip$/i, '');
          addLine(CyberInfo(`Target berupa file arsip ZIP: ${val}`));
          addLine(CyberSuccess(`Arsip ZIP akan diekstrak ke: ${targetDir}`));
          setData(d => ({ ...d, path: targetDir }));
        } else {
          setData(d => ({ ...d, path: val || 'C:\\Project' }));
        }
        addLine(CyberInfo("Kredensial Tersimpan Ditemukan:"));
        addLine(CyberInfo("Pengguna: " + data.username));
        addLine(CyberInfo("Token   : ***************"));
        setStep(2);
      } 
      else if (step === 2) {
        addLine(<div>{CyberInputPrompt("Gunakan kredensial aktif ini? (Y/N)")}<span className="text-white">{val || 'Y'}</span></div>);
        setData(d => ({ ...d, useOld: val || 'Y' }));
        if (val.toLowerCase() !== 'y' && val !== '') {
            setStep(2.1);
        } else {
            addLine(<br/>);
            addLine(CyberHeader("VERIFIKASI TOKEN GITHUB"));
            addLine(CyberSuccess(`Token GitHub AKTIF & TERVERIFIKASI! (Akun: ${data.username})`));
            setStep(3);
        }
      }
      else if (step === 2.1) {
        addLine(<div>{CyberInputPrompt("Masukkan Token GitHub Baru")}<span className="text-white">*************</span></div>);
        const tokVal = val.toLowerCase();
        if (tokVal === 'error403' || tokVal === 'habis' || tokVal === 'expired') {
          addLine(<br/>);
          addLine(CyberHeader("AUTENTIKASI TOKEN GAGAL (BUKAN MASALAH REPO) !"));
          addLine(CyberError("TOKEN GITHUB HABIS / KADALUARSA / TIDAK VALID!"));
          addLine(CyberWarn("Buka dan perbarui Personal Access Token Anda di tautan berikut:"));
          addLine(<div className="text-yellow-300 font-bold">   [🔗] https://github.com/settings/tokens</div>);
          addLine(<div className="text-white/60">   (Pastikan memiliki izin 'repo' dan 'workflow')</div>);
          addLine(CyberInfo("Silakan coba masukkan token yang valid:"));
          setStep(2.1);
        } else {
          setStep(2.2);
        }
      }
      else if (step === 2.2) {
        const userVal = val || 'CyberAdmin';
        addLine(<div>{CyberInputPrompt("Masukkan Username GitHub Baru")}<span className="text-white">{userVal}</span></div>);
        setData(d => ({ ...d, username: userVal }));
        addLine(CyberSuccess("Kredensial Berhasil Diperbarui"));
        addLine(<br/>);
        addLine(CyberHeader("VERIFIKASI TOKEN GITHUB"));
        addLine(CyberSuccess(`Token GitHub AKTIF & TERVERIFIKASI! (Akun: ${userVal})`));
        setStep(3);
      }
      else if (step === 3) {
        const repoVal = val || 'neo-vault';
        addLine(<div>{CyberInputPrompt("Nama Repositori Target")}<span className="text-white">{repoVal}</span></div>);
        setData(d => ({ ...d, repo: repoVal }));
        addLine(<br/>);
        addLine(CyberHeader("MEMERIKSA STATUS REPOSITORI"));
        
        if (repoVal.toLowerCase() === 'error404' || repoVal.toLowerCase() === 'tidak-ada') {
          addLine(CyberWarn(`Repositori '${repoVal}' TIDAK DITEMUKAN di akun GitHub '${data.username}'!`));
          addLine(<div className="text-[#00f3ff] font-bold">   Instruksi Pilihan:</div>);
          addLine(<div className="text-[#008b8b]">   [•] Tekan [ENTER] langsung untuk membuat repositori baru '{repoVal}'</div>);
          addLine(<div className="text-[#008b8b]">   [•] Atau ketik nama repositori lain (jika terdeteksi maka code ditulis di sana; jika belum ada dianggap instruksi pembuatan baru)</div>);
          setStep(3.1);
        } else {
          addLine(CyberSuccess(`Repositori '${repoVal}' TERDETEKSI di GitHub!`));
          addLine(CyberInfo("Code akan ditulis dan di-push ke repositori ini."));
          setStep(4);
        }
      }
      else if (step === 3.1) {
        addLine(<div>{CyberInputPrompt("Ketik nama repositori atau [ENTER] untuk buat baru")}<span className="text-white">{val || '[Buat Baru]'}</span></div>);
        if (!val || val.trim() === '') {
          addLine(CyberInfo(`Membuat repositori baru '${data.repo}' di GitHub...`));
          addLine(CyberSuccess(`Repositori baru '${data.repo}' berhasil dibuat di GitHub!`));
          addLine(CyberInfo("Code akan ditulis dan di-push ke repositori ini."));
        } else {
          const newName = val.trim();
          setData(d => ({ ...d, repo: newName }));
          if (newName.toLowerCase() === 'existing' || (!newName.toLowerCase().includes('tidak-ada') && !newName.toLowerCase().includes('error404'))) {
            addLine(CyberSuccess(`Repositori '${newName}' TERDETEKSI di GitHub!`));
            addLine(CyberInfo(`Code akan ditulis dan di-push ke repositori '${newName}'.`));
          } else {
            addLine(CyberInfo(`Repositori '${newName}' tidak ditemukan di GitHub. Dianggap sebagai instruksi pembuatan baru...`));
            addLine(CyberSuccess(`Repositori baru '${newName}' berhasil dibuat di GitHub!`));
            addLine(CyberInfo(`Code akan ditulis dan di-push ke repositori '${newName}'.`));
          }
        }
        setStep(4);
      }
      else if (step === 4) {
        addLine(<div>{CyberInputPrompt("Cabang Target (Bawaan: main)")}<span className="text-white">{val || 'main'}</span></div>);
        const branch = val || 'main';
        setData(d => ({ ...d, branch: branch }));
        setStep(4.1);
      }
      else if (step === 4.1) {
        addLine(<div>{CyberInputPrompt("Ekstensi file Git LFS (pisahkan koma, atau kosongkan jika tidak ada)")}<span className="text-white">{val || '-'}</span></div>);
        setData(d => ({ ...d, lfsExtensions: val }));
        if (val.trim()) {
            setStep(4.2);
        } else {
            setStep(4.5);
        }
      }
      else if (step === 4.2) {
        addLine(<div>{CyberInputPrompt("Batas ukuran file spesifik dalam MB (kosongkan jika tidak ada)")}<span className="text-white">{val || 'Semua Ukuran'}</span></div>);
        setData(d => ({ ...d, lfsSizeLimit: val }));
        setStep(4.5);
      }
      else if (step === 4.5) {
        addLine(<div>{CyberInputPrompt("Pesan Commit (Biarkan kosong untuk Auto Timestamp)")}<span className="text-white">{val || '[Auto Timestamp]'}</span></div>);
        setData(d => ({ ...d, customCommit: val }));

        addLine(<br/>);
        addLine(<pre className="text-[#00f3ff] leading-tight font-bold">{banner}</pre>);
        addLine(CyberHeader("MANIFEST DEPLOYMENT"));
        addLine(<div><span className="text-[#008b8b] font-bold">  [-] Path Target : </span><span className="text-white">{data.path || 'C:\\Project'}</span></div>);
        addLine(<div><span className="text-[#008b8b] font-bold">  [-] Username    : </span><span className="text-white">{data.username}</span></div>);
        addLine(<div><span className="text-[#008b8b] font-bold">  [-] Repositori  : </span><span className="text-white">{data.repo || 'neo-vault'}</span></div>);
        addLine(<div><span className="text-[#008b8b] font-bold">  [-] URL Remote  : </span><span className="text-white">{`https://github.com/${data.username}/${data.repo || 'neo-vault'}.git`}</span></div>);
        addLine(<div><span className="text-[#008b8b] font-bold">  [-] Cabang      : </span><span className="text-white">{data.branch}</span></div>);
        if (data.lfsExtensions) {
          addLine(<div><span className="text-[#008b8b] font-bold">  [-] LFS Exts    : </span><span className="text-white">{data.lfsExtensions}</span></div>);
          addLine(<div><span className="text-[#008b8b] font-bold">  [-] LFS Size    : </span><span className="text-white">{data.lfsSizeLimit || 'Semua Ukuran'}</span></div>);
        }
        addLine(<div><span className="text-[#008b8b] font-bold">  [-] Commit MSG  : </span><span className="text-white">{val || '[Auto Timestamp]'}</span></div>);
        addLine(<br/>);
        
        setStep(5);
      }
      else if (step === 5) {
        addLine(<div>{CyberInputPrompt("Eksekusi Payload? (ENTER=YA / N=BATAL)")}<span className="text-white">{val || 'YA'}</span></div>);
        if (val.toLowerCase() === 'n') {
            addLine(<br/>);
            addLine(CyberError("Deployment Dibatalkan oleh Pengguna"));
            addLine(<br/>);
            setStep(10); // Selesai
        } else {
            addLine(<br/>);
            addLine(CyberHeader("MENGEKSEKUSI GIT PAYLOAD"));
            
            // Memulai simulasi
            setStep(100); 
            simulateExecution();
        }
      }
      else if (step === 10) {
        // Reset Terminal
        setLines([]);
        setStep(0);
      }
    }
  };

  const simulateExecution = async () => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    addLine(<CyberLoadingNode text="Mengecek integritas ruang kerja (Workspace)..." />);
    await sleep(1100);
    addLine(<CyberLoadingNode text="Memindai file sistem dan direktori..." />);
    await sleep(1100);
    addLine(<CyberLoadingNode text="Mengecek struktur Repositori..." />);
    await sleep(1100);

    addLine(<CyberLoadingNode text="Mengaktifkan protokol LFS (Large File Storage)..." />);
    await sleep(1100);
    
    if (data.lfsExtensions && data.lfsExtensions.trim() !== '') {
        addLine(<CyberLoadingNode text={`Mengekstrak aturan Git LFS untuk: ${data.lfsExtensions}`} />);
        await sleep(1100);
        if (data.lfsSizeLimit && data.lfsSizeLimit.trim() !== '') {
            addLine(<CyberLoadingNode text={`Menerapkan batas ukuran file LFS minimum: ${data.lfsSizeLimit}MB`} />);
            await sleep(1100);
        }
    }

    addLine(<CyberLoadingNode text="Membangun indeks modifikasi (Staging Area)..." />);
    await sleep(1100);
    addLine(<CyberLoadingNode text="Mengekstraksi metadata objek lokal..." />);
    await sleep(1100);

    await simulateTree(true);
    
    addLine(<br/>);
    addLine(<div className="text-[#00f3ff] font-bold">   === INFORMASI PAYLOAD ===</div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Sumber Lokal : </span><span className="text-white">{data.path || 'C:\\Project'}</span></div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Target Repo  : </span><span className="text-white">{data.username ? `github.com/${data.username}/${data.repo}` : 'github.com/user/repo'}</span></div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Cabang       : </span><span className="text-white">{data.branch || 'main'}</span></div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Total File   : </span><span className="text-white">{Math.floor(Math.random() * 20 + 2)} file(s)</span></div>);
    addLine(<div><span className="text-[#008b8b] font-bold">   [-] Est. Ukuran  : </span><span className="text-white">{(Math.random() * 5 + 0.1).toFixed(2)} MB</span></div>);
    addLine(<br/>);

    addLine(<CyberLoadingNode text="Mengenkripsi metadata commit..." />);
    await sleep(1100);

    addLine(<CyberLoadingNode text="Melakukan commit data..." />);
    await sleep(1100);
    
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const commitMsg = data.customCommit.trim() !== '' ? data.customCommit : `[UPDATE-SISTEM] Auto-Push ${dateStr}`;
    addLine(CyberSuccess(`Commit berhasil diterapkan: ${commitMsg}`));
    
    await sleep(600);
    addLine(<CyberLoadingNode text="Mengkalibrasi uplink ke Node Utama (GitHub)..." />);
    await sleep(1100);
    addLine(<CyberLoadingNode text="Mensinkronisasi dengan Node Utama (GitHub)..." />);
    await sleep(1100);
    addLine(<CyberLoadingNode text="Menggabungkan update dari remote..." />);
    await sleep(1100);

    if (data.lfsExtensions && data.lfsExtensions.trim() !== '') {
        addLine(<CyberLoadingNode text="Mentransmisikan objek binary Git LFS ke server (LFS Push)..." />);
        await sleep(900);
    }

    addLine(<CyberLoadingNode text="Membangun terowongan aman (Secure Tunnel)..." />);
    await sleep(1100);
    addLine(<CyberLoadingNode text="Mengompresi data untuk transmisi..." />);
    await sleep(1100);
    addLine(<CyberLoadingNode text="Mentransmisikan file ke repositori (Push)..." />);
    await sleep(1100);
    
    if (data.username === 'error403') {
        addLine(<br/>);
        addLine(CyberHeader("KEGAGALAN SISTEM !"));
        addLine(CyberError("Gagal mengautentikasi: Token GitHub kadaluarsa / habis atau kuota API terlampaui."));
        addLine(CyberWarn("Buka dan perbarui Personal Access Token Anda di: https://github.com/settings/tokens"));
        addLine(CyberError("Transmisi ditolak. Rincian Error:"));
        addLine(<div className="text-[#ff0000]">remote: Support for password authentication was removed. Please use a personal access token instead.</div>);
    } else if (data.repo === 'error404') {
        addLine(<br/>);
        addLine(CyberHeader("KEGAGALAN SISTEM !"));
        addLine(CyberError("Repositori tidak ditemukan. Pastikan nama repositori dan username sudah benar."));
        addLine(CyberError("Transmisi ditolak. Rincian Error:"));
        addLine(<div className="text-[#ff0000]">remote: Repository not found.</div>);
    } else if (data.branch === 'conflict') {
        addLine(<br/>);
        addLine(CyberHeader("KEGAGALAN SISTEM !"));
        addLine(CyberError("Terdeteksi pembaruan data di server. Mohon tarik data (pull) manual terlebih dahulu."));
        addLine(CyberError("Transmisi ditolak. Rincian Error:"));
        addLine(<div className="text-[#ff0000] whitespace-pre">{`To https://github.com/${data.username}/${data.repo}.git\n ! [rejected]        ${data.branch} -> ${data.branch} (fetch first)\nerror: failed to push some refs`}</div>);
    } else {
        addLine(<br/>);
        addLine(CyberHeader("DEPLOYMENT BERHASIL"));
        addLine(CyberSuccess("Semua sistem berjalan normal."));
        addLine(<br/>);
        addLine(<div className="text-[#00f3ff] font-bold"> [🔗] Tautan Repositori: {data.username && data.repo ? `https://github.com/${data.username}/${data.repo}` : 'https://github.com/user/repo'}</div>);
        if (data.lfsExtensions && data.lfsExtensions.trim() !== '') {
            addLine(<br/>);
            addLine(<div className="text-amber-400 font-bold"> [!] PENTING UNTUK DEPLOYMENT VERCEL:</div>);
            addLine(<div className="text-white"> -&gt; Tambahkan Environment Variable di Vercel: <span className="text-[#00f3ff] font-bold">VERCEL_GIT_LFS_ENABLED = 1</span></div>);
            addLine(<div className="text-white/60"> -&gt; Buka Project Settings &gt; Environment Variables di dashboard Vercel.</div>);
            addLine(<div className="text-white/60"> -&gt; Tanpa variable ini, Vercel hanya meng-clone file pointer 130-byte sehingga error saat build!</div>);
        }
    }
    
    setStep(10); // Menunggu reset
  };

  const getPromptText = () => {
    switch (step) {
      case 1: return "Path Direktori Target";
      case 2: return "Gunakan kredensial aktif ini? (Y/N)";
      case 2.1: return "Masukkan Token GitHub Baru";
      case 2.2: return "Masukkan Username GitHub Baru";
      case 3: return "Nama Repositori Target";
      case 3.1: return "Ketik nama repositori atau [ENTER] untuk buat baru";
      case 4: return "Cabang Target (Bawaan: main)";
      case 4.1: return "Ekstensi file Git LFS (pisahkan koma) jika ada";
      case 4.2: return "Batas ukuran file spesifik dalam MB (kosongkan jika tidak ada)";
      case 4.5: return "Pesan Commit (Biarkan kosong untuk Auto Timestamp)";
      case 5: return "Eksekusi Payload? (ENTER=YA / N=BATAL)";
      case 10: return "Tekan [ENTER] untuk mengulang simulasi";
      default: return "";
    }
  };

  return (
    <div 
      className="flex-1 overflow-auto custom-scrollbar font-mono bg-transparent p-6 shadow-inner cursor-text relative h-full flex flex-col"
      style={{ fontSize: `${Math.round(13 * zoom)}px` }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        
        {step !== 100 && step !== 0 && (
          <div className="flex items-center min-w-full mt-2">
            {CyberInputPrompt(getPromptText())}
            <input
              ref={inputRef}
              type={step === 2.1 ? "password" : "text"}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleInput}
              className="flex-1 bg-transparent border-none outline-none text-white ml-2 caret-[#00f3ff] min-w-[20px]"
              autoFocus
            />
          </div>
        )}
      </div>
      <div ref={endRef} className="h-8" />
    </div>
  );
}
