import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  DEFAULT_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH
} from '../hooks/useSidebarResize';

interface SidebarResizerProps {
  sidebarWidth: number;
  widthRef: React.MutableRefObject<number>;
  rafIdRef: React.MutableRefObject<number | null>;
  applyWidthToDom: (widthPx: number) => void;
  updateSidebarWidth: (updater: number | ((prev: number) => number)) => void;
}

function SidebarResizerComponent({
  sidebarWidth,
  widthRef,
  rafIdRef,
  applyWidthToDom,
  updateSidebarWidth
}: SidebarResizerProps) {
  const { theme } = useTheme();
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDraggingSidebar(true);
  }, []);

  useEffect(() => {
    if (!isDraggingSidebar) return;

    let latestClientX = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        if (e.touches && e.touches.length > 0) {
          latestClientX = e.touches[0].clientX;
        }
      } else {
        latestClientX = e.clientX;
      }
      if (latestClientX <= 0) return;

      if (rafIdRef.current !== null) return;

      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        const dynamicMax = Math.max(
          MIN_SIDEBAR_WIDTH + 60,
          Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth - 380)
        );
        const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(latestClientX, dynamicMax));
        // Update langsung pada CSS variable di DOM tanpa memicu re-render komponen utama
        applyWidthToDom(newWidth);
      });
    };

    const stopResizing = () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setIsDraggingSidebar(false);
      // Commit nilai akhir ke state React & localStorage hanya 1 kali saat drag selesai
      updateSidebarWidth(widthRef.current);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', stopResizing);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', stopResizing);

    document.body.classList.add('resizing-active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', stopResizing);
      document.body.classList.remove('resizing-active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingSidebar, applyWidthToDom, updateSidebarWidth, widthRef, rafIdRef]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Pengatur lebar sidebar dan area kode"
      aria-valuenow={sidebarWidth}
      aria-valuemin={MIN_SIDEBAR_WIDTH}
      aria-valuemax={MAX_SIDEBAR_WIDTH}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          updateSidebarWidth((w) => Math.max(MIN_SIDEBAR_WIDTH, w - 20));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const dynamicMax = Math.max(
            MIN_SIDEBAR_WIDTH + 60,
            Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth - 380)
          );
          updateSidebarWidth((w) => Math.min(dynamicMax, w + 20));
        } else if (e.key === 'Home') {
          updateSidebarWidth(MIN_SIDEBAR_WIDTH);
        } else if (e.key === 'End') {
          updateSidebarWidth(MAX_SIDEBAR_WIDTH);
        }
      }}
      onMouseDown={startResizing}
      onTouchStart={startResizing}
      onDoubleClick={() => updateSidebarWidth(DEFAULT_SIDEBAR_WIDTH)}
      title="Tarik ke kiri atau kanan untuk mengubah lebar sidebar (Klik ganda untuk reset ke 384px)"
      className={`hidden lg:flex w-2.5 -ml-[5px] -mr-[5px] z-30 shrink-0 cursor-col-resize select-none items-center justify-center group relative transition-colors duration-150 ${
        isDraggingSidebar ? 'bg-[#00f3ff]/10' : ''
      }`}
    >
      {/* Normal abu tipis ketika kursor belum diarahkan, menyala ketika diarahkan / ditarik */}
      <div
        className={`h-full transition-all duration-150 ${
          isDraggingSidebar
            ? 'w-[2px] bg-[#00f3ff] shadow-[0_0_8px_#00f3ff]'
            : theme === 'dark'
            ? 'w-[1px] bg-white/10 group-hover:w-[2px] group-hover:bg-[#00f3ff] group-hover:shadow-[0_0_8px_rgba(0,243,255,0.4)]'
            : 'w-[1px] bg-slate-200 group-hover:w-[2px] group-hover:bg-sky-500 group-hover:shadow-[0_0_6px_rgba(2,132,199,0.3)]'
        }`}
      />

      {/* Grab pill handle: Tersembunyi saat kursor belum diarahkan (normal abu tipis), hanya muncul saat hover atau drag */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-9 rounded-full border flex items-center justify-center transition-all duration-150 pointer-events-none shadow-xs ${
          isDraggingSidebar
            ? 'opacity-100 scale-100 bg-[#00f3ff] border-[#00f3ff] text-[#030509] shadow-[0_0_12px_rgba(0,243,255,0.6)]'
            : theme === 'dark'
            ? 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 bg-[#0a0f1d] border-[#00f3ff]/40 text-[#00f3ff]'
            : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 bg-white border-sky-400 text-sky-600 shadow-xs'
        }`}
      >
        <div className="flex flex-col gap-1 items-center justify-center">
          <span className="w-0.5 h-0.5 rounded-full bg-current" />
          <span className="w-0.5 h-0.5 rounded-full bg-current" />
          <span className="w-0.5 h-0.5 rounded-full bg-current" />
        </div>
      </div>
    </div>
  );
}

const SidebarResizer = memo(SidebarResizerComponent);
export default SidebarResizer;
