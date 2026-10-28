import { ScriptFileItem } from './types';

export const DEFAULT_FILES: ScriptFileItem[] = [];

/**
 * Ekstraksi path lokal absolut jika tersedia (khusus lingkungan desktop/Chromium/Electron)
 */
export function extractFileOrFolderPath(file: File, isFolder?: boolean): string | null {
  if (!file) return null;
  const fullPath = (file as any).path as string | undefined;
  if (fullPath && typeof fullPath === 'string' && fullPath.length > 0) {
    if (isFolder) {
      const lastSlash = Math.max(fullPath.lastIndexOf('/'), fullPath.lastIndexOf('\\'));
      return lastSlash > 0 ? fullPath.slice(0, lastSlash) : fullPath;
    }
    return fullPath;
  }
  return null;
}

/**
 * Menyusun target full path berdasarkan nama direktori/arsip dan context path sebelumnya
 */
export function resolveTargetFullPath(
  name: string,
  _isZip: boolean,
  autoPath?: string,
  autoUsername?: string
): string {
  const cleanName = (name || '').replace(/^[/\\]+/, '').trim();

  if (autoPath && autoPath.trim()) {
    const trimmedAuto = autoPath.trim();
    const isWin = trimmedAuto.includes('\\') || /^[a-zA-Z]:/.test(trimmedAuto);
    const sep = isWin ? '\\' : '/';

    // Jika diakhiri slash (misal C:\Users\melam\Downloads\), langsung gabungkan
    if (/[\\/]$/.test(trimmedAuto)) {
      return `${trimmedAuto.replace(/[\\/]+$/, '')}${sep}${cleanName}`;
    }

    // Jika path saat ini adalah folder induk umum (Downloads, Documents, Desktop)
    if (/[\\/](Downloads|Documents|Desktop|Projects|Repos)$/i.test(trimmedAuto)) {
      return `${trimmedAuto}${sep}${cleanName}`;
    }

    // Jika path saat ini memiliki slash (misal menunjuk ke file .zip atau folder sebelumnya), ambil parent-nya
    const lastSlash = Math.max(trimmedAuto.lastIndexOf('/'), trimmedAuto.lastIndexOf('\\'));
    if (lastSlash > 0) {
      const parentDir = trimmedAuto.slice(0, lastSlash).replace(/[\\/]+$/, '');
      return `${parentDir}${sep}${cleanName}`;
    }
  }

  const cachedBase = localStorage.getItem('cyberBaseDir');
  if (cachedBase && cachedBase.trim()) {
    const trimmedBase = cachedBase.trim().replace(/[\\/]+$/, '');
    const isWin = trimmedBase.includes('\\') || /^[a-zA-Z]:/.test(trimmedBase);
    const sep = isWin ? '\\' : '/';
    return `${trimmedBase}${sep}${cleanName}`;
  }

  const username = autoUsername || localStorage.getItem('cyberAutoUsername') || 'User';
  return `C:\\Users\\${username}\\Downloads\\${cleanName}`;
}

/**
 * Memperbarui cached direktori dasar kerja dari sebuah path lengkap
 */
export function updateBaseDirFromPath(path: string): void {
  if (!path || !path.trim()) return;
  const trimmed = path.trim();
  if (/[\\/]$/.test(trimmed)) {
    localStorage.setItem('cyberBaseDir', trimmed.replace(/[\\/]+$/, ''));
    return;
  }
  if (/[\\/](Downloads|Documents|Desktop|Projects|Repos)$/i.test(trimmed)) {
    localStorage.setItem('cyberBaseDir', trimmed);
    return;
  }
  const lastSlash = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));
  if (lastSlash > 0) {
    const baseDir = trimmed.slice(0, lastSlash);
    localStorage.setItem('cyberBaseDir', baseDir);
  }
}
