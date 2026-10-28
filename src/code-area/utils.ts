import { ScriptExtension } from '../components/OsCombobox';
import { LANGUAGE_MAP } from './constants';

export function getSyntaxLanguage(scriptExtension: ScriptExtension, fileName: string): string {
  const ext = (scriptExtension || '').toLowerCase();
  const name = (fileName || '').toLowerCase();

  if (ext in LANGUAGE_MAP) return LANGUAGE_MAP[ext];
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.md')) return 'markdown';
  if (name.includes('gitignore') || name.includes('gitattributes') || ext.includes('git')) return 'bash';
  if (ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx') return 'javascript';
  if (ext === 'yaml' || ext === 'yml') return 'yaml';

  return 'plaintext';
}

export function calculateCodeLines(content: string): string[] {
  return (content || '').split('\n');
}
