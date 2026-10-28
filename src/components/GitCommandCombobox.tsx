import React from 'react';
import { useTheme } from '../context/ThemeContext';

export type GitCommandMode = 'FORCE_PUSH' | 'PARTIAL_UPDATE';

export interface GitCommandOption {
  id: GitCommandMode;
  label: string;
  badge: string;
  desc: string;
}

export const GIT_COMMAND_OPTIONS: GitCommandOption[] = [
  {
    id: 'FORCE_PUSH',
    label: 'Force Push',
    badge: '--force',
    desc: 'Timpa semua file & hapus yang tidak ada atau tidak sesuai folder baru',
  },
  {
    id: 'PARTIAL_UPDATE',
    label: 'Partial Update',
    badge: 'partial',
    desc: 'Hanya mengupdate dari folder file apa saja yang berubah',
  },
];

interface GitCommandComboboxProps {
  value: GitCommandMode;
  onChange: (value: GitCommandMode) => void;
  className?: string;
  disabled?: boolean;
}

export default function GitCommandCombobox({
  value,
  onChange,
  className = '',
  disabled = false,
}: GitCommandComboboxProps) {
  const { theme } = useTheme();
  const activeValue: GitCommandMode = value === 'PARTIAL_UPDATE' ? 'PARTIAL_UPDATE' : 'FORCE_PUSH';

  return (
    <div
      role="tablist"
      aria-label="Command Git"
      className={`grid grid-cols-2 gap-1 p-1 rounded-lg border transition-colors ${
        theme === 'dark'
          ? 'bg-white/5 border-white/10'
          : 'bg-slate-100 border-slate-200'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {GIT_COMMAND_OPTIONS.map((item) => {
        const isSelected = activeValue === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={disabled}
            title={item.desc}
            onClick={() => onChange(item.id)}
            className={`flex items-center justify-center py-1.5 px-2 rounded-md text-[11px] font-semibold tracking-tight leading-tight text-center transition-all cursor-pointer truncate ${
              isSelected
                ? theme === 'dark'
                  ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 shadow-xs'
                  : 'bg-white text-sky-700 border border-sky-200 shadow-xs'
                : theme === 'dark'
                ? 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
            }`}
          >
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
