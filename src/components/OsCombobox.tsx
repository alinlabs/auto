import React from 'react';
import { useTheme } from '../context/ThemeContext';

export type ScriptExtension = 'ps1' | 'cmd' | 'sh' | '';

export interface OsOption {
  id: 'ps1' | 'cmd' | 'sh';
  label: string;
  ext: string;
  desc: string;
}

export const OS_OPTIONS: OsOption[] = [
  {
    id: 'ps1',
    label: 'Power Shell',
    ext: '.ps1',
    desc: 'Skrip otomatisasi PowerShell untuk Windows',
  },
  {
    id: 'cmd',
    label: 'Command Prompt',
    ext: '.cmd',
    desc: 'Skrip batch CMD klasik untuk Windows',
  },
  {
    id: 'sh',
    label: 'Shell Script',
    ext: '.sh',
    desc: 'Shell script Bash standar Linux / macOS / Termux',
  },
];

interface OsComboboxProps {
  value: ScriptExtension;
  onChange: (value: ScriptExtension) => void;
  className?: string;
  disabled?: boolean;
}

export default function OsCombobox({
  value,
  onChange,
  className = '',
  disabled = false,
}: OsComboboxProps) {
  const { theme } = useTheme();
  const activeValue = value === 'cmd' || value === 'sh' ? value : 'ps1';

  return (
    <div
      role="tablist"
      aria-label="Sistem Operasi"
      className={`grid grid-cols-3 gap-1 p-1 rounded-lg border transition-colors ${
        theme === 'dark'
          ? 'bg-white/5 border-white/10'
          : 'bg-slate-100 border-slate-200'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {OS_OPTIONS.map((item) => {
        const isSelected = activeValue === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={disabled}
            title={`${item.label} (${item.ext}) - ${item.desc}`}
            onClick={() => onChange(item.id)}
            className={`flex items-center justify-center py-1.5 px-1.5 rounded-md text-[10px] sm:text-[11px] font-semibold tracking-tight leading-tight text-center transition-all cursor-pointer truncate ${
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
