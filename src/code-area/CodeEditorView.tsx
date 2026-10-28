import React, { memo, useDeferredValue, useMemo, useState, useEffect, useRef } from 'react';
import { FileCode, MousePointerClick, ArrowLeft, RefreshCw } from 'lucide-react';
import { SyntaxHighlighter, vscDarkPlus, oneLight } from './syntaxHighlighterConfig';
import { useTheme } from '../context/ThemeContext';
import { useCodeAnimationStore } from '../context/useCodeAnimationStore';
import { CodeEditorViewProps } from './types';
import { getSyntaxLanguage } from './utils';

const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

function CodeEditorViewComponent({
  scriptContent,
  setScriptContent,
  scriptExtension,
  fileName,
  isWrapText,
  isEditing,
  sidebarView,
  isGenerated = true,
  onGenerate,
  activeFileId,
  setFileList,
  fontSizePx,
  lineHeightPx,
  codeLines,
  textareaRef,
  handleKeyDown,
  mobileView,
  setMobileView
}: CodeEditorViewProps) {
  const { theme } = useTheme();

  // State & refs for top-to-bottom automated writer animation
  const [isWriting, setIsWriting] = useState(false);
  const prevIsGeneratedRef = useRef(isGenerated);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gutterMaskRef = useRef<HTMLDivElement>(null);
  const activeLineMaskRef = useRef<HTMLDivElement>(null);
  const belowLinesMaskRef = useRef<HTMLDivElement>(null);

  // Trigger writer animation whenever code transitions from ungenerated -> generated
  useEffect(() => {
    if (!prevIsGeneratedRef.current && isGenerated && sidebarView === 'CONFIG') {
      useCodeAnimationStore.getState().startWriting(0, 0);
      setIsWriting(true);
    } else if (!isGenerated) {
      setIsWriting(false);
      useCodeAnimationStore.getState().finishWriting();
    }
    prevIsGeneratedRef.current = isGenerated;
  }, [isGenerated, sidebarView]);

  useEffect(() => {
    if (!isWriting || !isGenerated) return;

    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = 0;
    }

    const rawContent = scriptContent || '';
    const lines = rawContent.split('\n');
    const totalLines = Math.max(lines.length, 1);
    const totalChars = rawContent.length;
    const totalBytes = new Blob([rawContent]).size;

    // Reset dan catat target baris & ukuran berkas untuk animasi penghitungan di Footer
    useCodeAnimationStore.getState().startWriting(totalLines, totalBytes);

    // Hitung bobot per baris & kompleksitas kode agar durasi dan ritme ketikan terasa nyata
    let complexityCount = 0;
    const cumulativeWeights = new Float64Array(totalLines);
    let totalWeight = 0;

    for (let i = 0; i < totalLines; i++) {
      const line = lines[i] || '';
      const trimmedLen = line.trim().length;
      const isComplexLine = /[{}()|&$=;]|(\b(if|else|elif|fi|for|while|function|try|catch|git|curl|gh|echo|Write-Host)\b)/.test(line);
      if (isComplexLine) {
        complexityCount++;
      }
      // Baris kosong lewat cepat, baris panjang & kompleks diketik lebih detail
      const lineWeight = (trimmedLen === 0 ? 6 : 14 + line.length * 1.15) + (isComplexLine ? 12 : 0);
      totalWeight += lineWeight;
      cumulativeWeights[i] = totalWeight;
    }

    if (totalWeight <= 0) {
      totalWeight = 1;
      cumulativeWeights[0] = 1;
    }

    // Minimal 4 detik (4000ms), bertambah menyesuaikan jumlah baris, karakter, dan tingkat kompleksitas kode
    const computedDurationMs =
      2600 +
      totalLines * 18 +
      totalChars * 0.38 +
      complexityCount * 16;
    const durationMs = Math.min(18000, Math.max(4000, computedDurationMs));

    let rafId: number | null = null;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const targetWeight = progress * totalWeight;

      // Binary search untuk mencari baris aktif berdasarkan bobot kumulatif
      let low = 0;
      let high = totalLines - 1;
      while (low < high) {
        const mid = (low + high) >>> 1;
        if (cumulativeWeights[mid] < targetWeight) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      const currentLineIdx = low;
      const prevWeight = currentLineIdx > 0 ? cumulativeWeights[currentLineIdx - 1] : 0;
      const currentLineWeight = Math.max(1, cumulativeWeights[currentLineIdx] - prevWeight);
      const lineFraction = Math.min(1, Math.max(0, (targetWeight - prevWeight) / currentLineWeight));

      const activeLineStr = lines[currentLineIdx] || '';
      const lineCharLen = Math.max(activeLineStr.length, 1);
      const typedChars = Math.min(lineCharLen, Math.max(1, Math.ceil(lineFraction * lineCharLen)));

      const activeLineTopPx = 20 + currentLineIdx * lineHeightPx;
      const nextLineTopPx = 20 + (currentLineIdx + 1) * lineHeightPx;

      if (gutterMaskRef.current) {
        gutterMaskRef.current.style.top = `${nextLineTopPx}px`;
      }
      if (belowLinesMaskRef.current) {
        belowLinesMaskRef.current.style.top = `${nextLineTopPx}px`;
      }
      if (activeLineMaskRef.current) {
        activeLineMaskRef.current.style.top = `${activeLineTopPx}px`;
        activeLineMaskRef.current.style.height = `${lineHeightPx}px`;
        activeLineMaskRef.current.style.left = `calc(1.25rem + ${typedChars}ch)`;
      }

      // Live update baris dan ukuran berkas ke Footer selama proses pengetikan animasi
      const currentDisplayLines = progress >= 1 ? totalLines : Math.min(totalLines, currentLineIdx + 1);
      const currentDisplayBytes = progress >= 1 ? totalBytes : Math.min(totalBytes, Math.round(progress * totalBytes));
      useCodeAnimationStore.getState().updateProgress(currentDisplayLines, currentDisplayBytes);

      // Auto-scroll ke bawah mengikuti posisi baris yang sedang diketik hingga penuh sampai area bawah
      if (scrollEl) {
        const viewportH = scrollEl.clientHeight || 640;
        const bottomFollowOffset = viewportH;
        if (nextLineTopPx > bottomFollowOffset) {
          scrollEl.scrollTop = nextLineTopPx - bottomFollowOffset;
        }
      }

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        if (scrollEl) {
          scrollEl.scrollTop = scrollEl.scrollHeight;
        }
        setIsWriting(false);
        useCodeAnimationStore.getState().finishWriting();
      }
    };

    rafId = window.requestAnimationFrame(step);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      useCodeAnimationStore.getState().finishWriting();
    };
  }, [isWriting, isGenerated, scriptContent, lineHeightPx]);

  // Defer heavy AST syntax highlighting so sidebar typing & textarea input remain 0ms responsive
  const deferredScriptContent = useDeferredValue(scriptContent);
  const deferredLineCount = useDeferredValue(Math.max(codeLines.length, 1));

  const language = useMemo(
    () => getSyntaxLanguage(scriptExtension, fileName),
    [scriptExtension, fileName]
  );

  const highlighterCustomStyle = useMemo<React.CSSProperties>(
    () => ({
      margin: 0,
      padding: '1.25rem',
      background: 'transparent',
      fontSize: `${fontSizePx}px`,
      lineHeight: `${lineHeightPx}px`,
      fontFamily: MONO_FONT,
      whiteSpace: isWrapText ? 'pre-wrap' : 'pre',
      wordBreak: isWrapText ? 'break-all' : 'normal',
      overflowWrap: isWrapText ? 'anywhere' : 'normal',
      width: isWrapText ? '100%' : undefined,
      maxWidth: isWrapText ? '100%' : undefined,
      minWidth: 0,
      tabSize: 4,
      MozTabSize: 4,
      minHeight: '100%',
      border: 'none',
      outline: 'none',
      boxSizing: 'border-box',
      overflowX: isWrapText ? 'hidden' : 'visible'
    }),
    [fontSizePx, lineHeightPx, isWrapText]
  );

  const highlighterCodeTagProps = useMemo(
    () => ({
      style: {
        fontSize: `${fontSizePx}px`,
        lineHeight: `${lineHeightPx}px`,
        fontFamily: MONO_FONT,
        tabSize: 4,
        MozTabSize: 4,
        whiteSpace: isWrapText ? 'pre-wrap' : 'pre',
        wordBreak: isWrapText ? 'break-all' : 'normal',
        overflowWrap: isWrapText ? 'anywhere' : 'normal',
        padding: 0,
        margin: 0,
        border: 0,
        display: isWrapText ? 'block' : 'inline-block',
        width: isWrapText ? '100%' : undefined,
        maxWidth: isWrapText ? '100%' : undefined,
        minWidth: 0,
        boxSizing: 'border-box'
      } as React.CSSProperties
    }),
    [fontSizePx, lineHeightPx, isWrapText]
  );

  const lineNumbers = useMemo(
    () => Array.from({ length: deferredLineCount }, (_, i) => i + 1),
    [deferredLineCount]
  );

  const handleTriggerGenerate = () => {
    useCodeAnimationStore.getState().startWriting(0, 0);
    setIsWriting(true);
    onGenerate();
  };

  if (sidebarView === 'CONFIG' && !isGenerated) {
    return (
      <div
        onClick={handleTriggerGenerate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTriggerGenerate();
          }
        }}
        className={`h-full w-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto custom-scrollbar select-none transition-colors cursor-pointer group ${
          theme === 'dark' ? 'bg-[#030509]' : 'bg-[#f8fafc]'
        }`}
        title="Ketuk untuk Menampilkan Kode"
      >
        {/* Background Cyber Glow Accent */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden flex items-center justify-center"
          aria-hidden="true"
        >
          <div className={`w-[450px] h-[450px] rounded-full blur-[100px] ${
            theme === 'dark' ? 'bg-[#00f3ff]/10' : 'bg-sky-400/10'
          }`} />
        </div>

        <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center">
          {/* Prominent Glowing Cyber Icon (Identik dengan Tampilan Pilih Berkas) */}
          <div className="relative flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
            <div className={`absolute w-28 h-28 rounded-3xl blur-xl transition-all ${
              theme === 'dark' ? 'bg-[#00f3ff]/20 animate-pulse' : 'bg-sky-400/20'
            }`} />
            <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border flex items-center justify-center transition-all ${
              theme === 'dark'
                ? 'bg-[#060b16] border-[#00f3ff]/40 text-[#00f3ff] shadow-[0_0_30px_rgba(0,243,255,0.25)]'
                : 'bg-white border-sky-300 text-sky-600 shadow-lg shadow-sky-100'
            }`}>
              <FileCode size={46} className="stroke-[1.6]" />
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-[#030509] border-[#00f3ff]/60 text-[#00f3ff]'
                  : 'bg-sky-50 border-sky-400 text-sky-600 shadow-sm'
              }`}>
                <MousePointerClick size={16} />
              </div>
            </div>
          </div>

          {/* Title (Ukuran yang sama persis dengan Pilih Berkas) */}
          <h3 className={`text-lg sm:text-xl font-bold tracking-tight mb-2 transition-colors ${
            theme === 'dark' ? 'text-white group-hover:text-[#00f3ff]' : 'text-slate-900 group-hover:text-sky-700'
          }`}>
            Ketuk untuk Menampilkan Kode
          </h3>

          {/* Subtitle / Direct Instructions (Ukuran yang sama persis dengan Pilih Berkas) */}
          <p className={`text-xs sm:text-sm leading-relaxed max-w-md ${
            mobileView === 'WORKSPACE' ? 'mb-5' : 'mb-0'
          } ${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            Perubahan konfigurasi pada bilah sisi terdeteksi. Silakan ketuk area ini untuk men-generate dan menampilkan kode skrip otomatis terbaru.
          </p>

          {/* Mobile Navigation Back to Sidebar */}
          {mobileView === 'WORKSPACE' && setMobileView && (
            <div className="flex items-center justify-center lg:hidden mt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileView('KONFIGURASI');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  theme === 'dark'
                    ? 'border-white/10 bg-white/5 text-[#00f3ff] hover:bg-white/10 hover:border-[#00f3ff]/40'
                    : 'border-slate-200 bg-white text-sky-700 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <ArrowLeft size={15} />
                <span>Buka Konfigurasi di Sidebar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const displayedCode = isEditing ? scriptContent : deferredScriptContent;

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      onClick={() => {
        if (isWriting) {
          setIsWriting(false);
          useCodeAnimationStore.getState().finishWriting();
        }
      }}
    >
      <div 
        ref={scrollContainerRef}
        className={`h-full w-full relative ${
          isWrapText 
            ? 'overflow-y-auto overflow-x-hidden' 
            : 'overflow-auto custom-scrollbar'
        } ${
          theme === 'dark' 
            ? 'bg-[#030509]' 
            : 'bg-white'
        }`}
        style={{ fontSize: `${fontSizePx}px` }}
      >
        <div className={`flex min-h-full font-mono text-left relative ${
          isWrapText ? 'w-full max-w-full min-w-0' : 'min-w-full w-max'
        }`}>
          {/* Sticky Line Numbers Gutter */}
          <div 
            className={`sticky left-0 select-none py-5 pl-4 pr-3 text-right shrink-0 z-10 font-mono transition-colors ${
              theme === 'dark' 
                ? 'bg-[#030509] text-white/30 border-r border-white/5' 
                : 'bg-white text-slate-400 border-r border-slate-200'
            }`}
            style={{
              fontSize: `${fontSizePx}px`,
              lineHeight: `${lineHeightPx}px`,
              minWidth: '3.5em',
              fontFamily: MONO_FONT
            }}
          >
            {lineNumbers.map((lineNum) => (
              <div key={lineNum} style={{ height: `${lineHeightPx}px`, lineHeight: `${lineHeightPx}px` }}>
                {lineNum}
              </div>
            ))}

            {/* Gutter Writer Mask (hides line numbers not yet typed) */}
            {isWriting && (
              <div
                ref={gutterMaskRef}
                className={`absolute left-0 right-0 bottom-0 pointer-events-none ${
                  theme === 'dark' ? 'bg-[#030509]' : 'bg-white'
                }`}
                style={{ top: '20px' }}
              />
            )}
          </div>

          {/* Code Container */}
          <div className={`relative flex-1 ${
            isWrapText ? 'w-full max-w-full min-w-0 overflow-hidden' : 'min-w-0'
          }`}>
            {/* Syntax Highlighting Layer */}
            <SyntaxHighlighter 
              language={language} 
              style={theme === 'dark' ? vscDarkPlus : oneLight}
              customStyle={highlighterCustomStyle}
              codeTagProps={highlighterCodeTagProps}
              showLineNumbers={false}
              wrapLongLines={isWrapText}
            >
              {displayedCode 
                ? (displayedCode.endsWith('\n') ? `${displayedCode} ` : displayedCode)
                : ' '}
            </SyntaxHighlighter>

            {/* Top-to-Bottom Automated Writer Masks */}
            {isWriting && (
              <>
                {/* Horizontal mask on the active typing line with glowing terminal cursor */}
                <div
                  ref={activeLineMaskRef}
                  className={`absolute right-0 pointer-events-none flex items-center z-20 ${
                    theme === 'dark' ? 'bg-[#030509]' : 'bg-white'
                  }`}
                  style={{
                    top: '20px',
                    left: '1.25rem',
                    height: `${lineHeightPx}px`
                  }}
                >
                  <span
                    className={`inline-block w-[8px] h-[75%] rounded-[1px] ${
                      theme === 'dark'
                        ? 'bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]'
                        : 'bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.6)]'
                    }`}
                  />
                </div>

                {/* Vertical mask hiding all lines below the active typing line */}
                <div
                  ref={belowLinesMaskRef}
                  className={`absolute left-0 right-0 bottom-0 pointer-events-none z-20 ${
                    theme === 'dark'
                      ? 'bg-[#030509]'
                      : 'bg-white'
                  }`}
                  style={{ top: `${20 + lineHeightPx}px` }}
                />
              </>
            )}

            {/* Transparent Overlay Textarea when in Edit Mode */}
            {isEditing && (
              <textarea
                ref={textareaRef}
                value={scriptContent}
                onChange={(e) => {
                  const val = e.target.value;
                  if (setScriptContent) setScriptContent(val);
                  if (activeFileId && setFileList) {
                    setFileList((prev) => {
                      const updated = prev.map((f) => (f.id === activeFileId ? { ...f, content: val } : f));
                      try {
                        localStorage.setItem('cyberScriptFiles', JSON.stringify(updated));
                      } catch {}
                      return updated;
                    });
                  }
                }}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoFocus
                placeholder="Mulai ketik kode atau teks di sini..."
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  height: '100%',
                  margin: 0,
                  padding: '1.25rem',
                  fontSize: `${fontSizePx}px`,
                  lineHeight: `${lineHeightPx}px`,
                  fontFamily: MONO_FONT,
                  whiteSpace: isWrapText ? 'pre-wrap' : 'pre',
                  wordBreak: isWrapText ? 'break-all' : 'normal',
                  overflowWrap: isWrapText ? 'anywhere' : 'normal',
                  color: scriptContent ? 'transparent' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(100,116,139,0.7)'),
                  WebkitTextFillColor: scriptContent ? 'transparent' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(100,116,139,0.7)'),
                  caretColor: theme === 'dark' ? '#00f3ff' : '#0284c7',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  tabSize: 4,
                  MozTabSize: 4,
                  overflowX: 'hidden',
                  overflowY: 'hidden',
                  boxSizing: 'border-box'
                }}
                className={`selection:bg-[#00f3ff]/30 ${
                  theme === 'dark' ? 'selection:bg-[#00f3ff]/30' : 'selection:bg-sky-500/30'
                }`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CodeEditorView = memo(CodeEditorViewComponent);
export default CodeEditorView;
