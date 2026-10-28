import React, { memo } from 'react';
import { 
  ArrowLeft, 
  ZoomOut, 
  ZoomIn, 
  WrapText, 
  Pencil, 
  Check, 
  Copy, 
  Download, 
  Save, 
  Square 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { HeaderBarProps } from './types';

function HeaderBarComponent({
  fileName,
  scriptExtension,
  activeTab,
  setActiveTab,
  mobileView,
  setMobileView,
  zoom,
  handleZoomIn,
  handleZoomOut,
  isWrapText,
  setIsWrapText,
  isEditing,
  setIsEditing,
  hasStarted,
  handleStartWriting,
  canCopyOrDownload,
  copied,
  handleCopy,
  handleDownload,
  sidebarView,
  setIsSaveCacheModalOpen,
  activeFileId
}: HeaderBarProps) {
  const { theme } = useTheme();

  const isAwaitingFileSelection = sidebarView === 'FILES' && !activeFileId;

  return (
    <div className={`h-16 border-b flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 transition-colors ${
      theme === 'dark' 
        ? 'border-white/5 bg-[#030509]' 
        : 'border-slate-200 bg-white shadow-xs'
    }`}>
      {/* Title & Extensions badge */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {setMobileView && mobileView === 'WORKSPACE' && (
          <button 
            onClick={() => setMobileView('KONFIGURASI')}
            className={`lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              theme === 'dark' 
                ? 'border-white/10 bg-white/5 text-[#00f3ff] hover:bg-white/10' 
                : 'border-slate-200 bg-slate-100 text-sky-700 hover:bg-slate-200'
            }`}
            title="Kembali ke Konfigurasi"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Konfigurasi</span>
          </button>
        )}

        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold truncate flex items-center gap-2">
            <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
              {sidebarView === 'CONFIG'
                ? 'AUTO-PUSH'
                : isAwaitingFileSelection
                ? 'Pilih Berkas Dari Library'
                : (fileName?.trim() ? fileName.trim().replace(/\.[a-zA-Z0-9_-]+$/, '') : 'AUTO-PUSH')}
              {!isAwaitingFileSelection && typeof scriptExtension === 'string' && scriptExtension
                ? `.${scriptExtension.replace(/^\./, '')}`
                : ''}
            </span>
            {isAwaitingFileSelection ? (
              <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md font-mono font-medium tracking-wide ${
                theme === 'dark' 
                  ? 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 shadow-[0_0_8px_rgba(0,243,255,0.15)]' 
                  : 'bg-sky-50 text-sky-700 border border-sky-300'
              }`}>
                Pilih Berkas
              </span>
            ) : scriptExtension ? (
              <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md font-mono font-bold tracking-wide ${
                theme === 'dark' 
                  ? 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/40 shadow-[0_0_8px_rgba(0,243,255,0.15)]' 
                  : 'bg-sky-50 text-sky-700 border border-sky-300'
              }`}>
                {scriptExtension === 'ps1' ? 'PowerShell' : scriptExtension === 'cmd' ? 'CMD' : scriptExtension === 'sh' ? 'Bash' : String(scriptExtension).toUpperCase()}
              </span>
            ) : sidebarView === 'CONFIG' ? (
              <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md font-mono font-medium tracking-wide ${
                theme === 'dark' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                  : 'bg-amber-50 text-amber-700 border border-amber-300'
              }`}>
                Belum Dipilih
              </span>
            ) : null}
          </h2>
          <p className={`text-[10px] sm:text-xs tracking-tight truncate hidden sm:block ${
            theme === 'dark' ? 'text-white/50' : 'text-slate-500'
          }`}>
            {isAwaitingFileSelection 
              ? 'Pilih salah satu berkas dari daftar di bilah sisi kiri untuk membuka kodenya'
              : activeTab === 'CODE' 
              ? 'Script Git Auto Push Payload Generator' 
              : 'Visual Interactive Terminal Simulator'}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {activeTab === 'CODE' && !isAwaitingFileSelection && (
          <>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className={`p-2 rounded-lg transition-colors cursor-pointer hidden sm:flex ${
                theme === 'dark' ? 'text-white/60 hover:text-[#00f3ff] hover:bg-white/5' : 'text-slate-500 hover:text-sky-600 hover:bg-slate-100'
              }`}
            >
              <ZoomOut size={15} />
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className={`p-2 rounded-lg transition-colors cursor-pointer hidden sm:flex ${
                theme === 'dark' ? 'text-white/60 hover:text-[#00f3ff] hover:bg-white/5' : 'text-slate-500 hover:text-sky-600 hover:bg-slate-100'
              }`}
            >
              <ZoomIn size={15} />
            </button>

            {/* WrapText Toggle */}
            <button
              type="button"
              onClick={() => setIsWrapText(!isWrapText)}
              aria-pressed={isWrapText}
              title={
                isWrapText
                  ? "Matikan Text Wrap (Aktifkan Scroll Horizontal)"
                  : "Aktifkan Text Wrap (Pas Sesuai Lebar Ruang Tanpa Scroll Horizontal)"
              }
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                isWrapText
                  ? (theme === 'dark'
                      ? 'text-[#00f3ff] border border-[#00f3ff] bg-[#00f3ff]/10 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                      : 'text-sky-600 border border-sky-500 bg-sky-50 shadow-xs')
                  : (theme === 'dark'
                      ? 'text-white/60 border border-transparent hover:text-[#00f3ff] hover:bg-white/5 bg-transparent'
                      : 'text-slate-500 border border-transparent hover:text-sky-600 hover:bg-slate-100 bg-transparent')
              }`}
              aria-label="Toggle Text Wrap"
            >
              <WrapText size={15} />
            </button>

            {/* Pencil Edit Mode Toggle */}
            <button
              onClick={() => {
                if (!hasStarted) {
                  handleStartWriting();
                } else {
                  setIsEditing(!isEditing);
                }
              }}
              disabled={sidebarView !== 'FILES' && !canCopyOrDownload}
              title={
                !canCopyOrDownload && sidebarView !== 'FILES'
                  ? "Generate kode terlebih dahulu untuk mengedit"
                  : isEditing
                  ? "Kunci Skrip (Selesai Mengedit)"
                  : "Edit Skrip (Mode Pengeditan)"
              }
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                !canCopyOrDownload && sidebarView !== 'FILES'
                  ? 'opacity-40 cursor-not-allowed border border-transparent'
                  : isEditing
                  ? (theme === 'dark' ? 'text-[#00f3ff] border border-[#00f3ff] bg-transparent' : 'text-sky-600 border border-sky-500 bg-transparent')
                  : (theme === 'dark' ? 'text-white/60 border border-transparent hover:text-[#00f3ff] hover:bg-white/5 bg-transparent' : 'text-slate-500 border border-transparent hover:text-sky-600 hover:bg-slate-100 bg-transparent')
              }`}
              aria-label="Edit Skrip"
            >
              <Pencil size={15} />
            </button>
          </>
        )}

        {activeTab === 'CODE' && !isAwaitingFileSelection && (
          <>
            <div className={`h-4 w-px mx-1 sm:mx-1.5 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />

            <button
              onClick={handleCopy}
              disabled={!canCopyOrDownload}
              title={canCopyOrDownload ? (copied ? "Tersalin ke clipboard" : "Salin ke clipboard") : "Belum ada kode untuk disalin"}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                !canCopyOrDownload
                  ? (theme === 'dark'
                      ? 'bg-white/[0.03] text-white/25 border-white/10 cursor-not-allowed opacity-60 shadow-none'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 shadow-none')
                  : copied
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs cursor-pointer'
                  : theme === 'dark'
                  ? 'bg-[#00f3ff]/5 hover:bg-[#00d8e6]/15 text-[#00f3ff] border-[#00f3ff]/40 hover:border-[#00f3ff]/60 cursor-pointer'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300 cursor-pointer'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            {sidebarView === 'FILES' ? (
              <button
                onClick={() => setIsSaveCacheModalOpen(true)}
                disabled={!hasStarted && !canCopyOrDownload}
                title={!hasStarted && !canCopyOrDownload ? "Mulai menulis kode terlebih dahulu untuk menyimpan" : "Simpan berkas dan perubahan ke cache lokal"}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  !hasStarted && !canCopyOrDownload
                    ? (theme === 'dark'
                        ? 'bg-white/[0.03] text-white/25 border-white/10 cursor-not-allowed opacity-60 shadow-none'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 shadow-none')
                    : theme === 'dark'
                    ? 'bg-[#00f3ff] hover:bg-[#00d8e6] text-[#030509] border-transparent shadow-[0_0_15px_rgba(0,243,255,0.3)] cursor-pointer'
                    : 'bg-sky-600 hover:bg-sky-700 text-white border-transparent shadow-xs cursor-pointer'
                }`}
              >
                <Save size={14} />
                <span className="hidden sm:inline">Simpan</span>
              </button>
            ) : (
              <button
                onClick={handleDownload}
                disabled={!canCopyOrDownload}
                title={canCopyOrDownload ? (scriptExtension ? `Unduh file .${scriptExtension}` : "Unduh file") : "Generate kode terlebih dahulu untuk mengunduh"}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  !canCopyOrDownload
                    ? (theme === 'dark'
                        ? 'bg-white/[0.03] text-white/25 border-white/10 cursor-not-allowed opacity-60 shadow-none'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 shadow-none')
                    : theme === 'dark'
                    ? 'bg-[#00f3ff] hover:bg-[#00d8e6] text-[#030509] border-transparent shadow-[0_0_15px_rgba(0,243,255,0.3)] cursor-pointer'
                    : 'bg-sky-600 hover:bg-sky-700 text-white border-transparent shadow-xs cursor-pointer'
                }`}
              >
                <Download size={14} />
                <span className="hidden sm:inline">Unduh</span>
              </button>
            )}
          </>
        )}

        {/* Tombol Berhenti hanya ditampilkan jika simulator sedang aktif dan bukan saat menunggu pemilihan berkas */}
        {activeTab === 'SIMULATOR' && !isAwaitingFileSelection && (
          <button
            type="button"
            onClick={() => setActiveTab?.('CODE')}
            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Berhenti dan kembali ke kode"
          >
            <Square size={13} className="fill-white" />
            <span>Berhenti</span>
          </button>
        )}
      </div>
    </div>
  );
}

const HeaderBar = memo(HeaderBarComponent);
export default HeaderBar;
