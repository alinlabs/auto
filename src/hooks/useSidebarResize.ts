import React, { useState, useEffect, useRef, useCallback } from 'react';

export const DEFAULT_SIDEBAR_WIDTH = 384;
export const MIN_SIDEBAR_WIDTH = 280;
export const MAX_SIDEBAR_WIDTH = 720;

export function useSidebarResize() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const cached = localStorage.getItem('cyberSidebarWidth');
      if (cached) {
        const parsed = parseInt(cached, 10);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_SIDEBAR_WIDTH;
  });

  const widthRef = useRef<number>(sidebarWidth);
  const rafIdRef = useRef<number | null>(null);

  const applyWidthToDom = useCallback((widthPx: number) => {
    widthRef.current = widthPx;
    document.documentElement.style.setProperty('--sidebar-w', `${widthPx}px`);
    const asideEl = document.getElementById('auto-sidebar-aside');
    if (asideEl) {
      asideEl.style.setProperty('--sidebar-w', `${widthPx}px`);
      asideEl.style.width = `${widthPx}px`;
    }
  }, []);

  useEffect(() => {
    applyWidthToDom(sidebarWidth);
    try {
      localStorage.setItem('cyberSidebarWidth', String(sidebarWidth));
    } catch {}
  }, [sidebarWidth, applyWidthToDom]);

  const updateSidebarWidth = useCallback(
    (updater: number | ((prev: number) => number)) => {
      const next = typeof updater === 'function' ? updater(widthRef.current) : updater;
      applyWidthToDom(next);
      setSidebarWidth(next);
    },
    [applyWidthToDom]
  );

  return {
    sidebarWidth,
    widthRef,
    rafIdRef,
    applyWidthToDom,
    updateSidebarWidth
  };
}
