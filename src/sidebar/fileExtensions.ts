export interface ExtensionMeta {
  ext: string;
  name: string;
  category: string;
  desc?: string;
}

export const EXTENSION_REGISTRY: Record<string, ExtensionMeta> = {
  ps1: {
    ext: 'ps1',
    name: 'PowerShell Script',
    category: 'Script',
    desc: 'Skrip eksekusi otomatisasi Windows PowerShell dengan modul Git LFS terintegrasi'
  },
  cmd: {
    ext: 'cmd',
    name: 'Command Prompt Batch',
    category: 'Script',
    desc: 'Skrip batch Windows Command Prompt portabel tanpa batasan ExecutionPolicy'
  },
  sh: {
    ext: 'sh',
    name: 'Bash Shell Script',
    category: 'Script',
    desc: 'Skrip shell POSIX untuk macOS, Linux, Ubuntu, dan terminal Git Bash'
  },
  bash: {
    ext: 'bash',
    name: 'GNU Bash Script',
    category: 'Script',
    desc: 'Skrip Unix Bourne-Again Shell standar'
  },
  zsh: {
    ext: 'zsh',
    name: 'Z Shell Script',
    category: 'Script',
    desc: 'Skrip Zsh default untuk terminal macOS modern'
  },
  bat: {
    ext: 'bat',
    name: 'DOS Batch File',
    category: 'Script',
    desc: 'Skrip eksekusi batch DOS legacy'
  },
  html: {
    ext: 'html',
    name: 'HTML5 Web Page',
    category: 'Web',
    desc: 'Dokumen antarmuka web interaktif HTML5'
  },
  htm: {
    ext: 'htm',
    name: 'HTML Document',
    category: 'Web',
    desc: 'Dokumen web markup standar'
  },
  lottie: {
    ext: 'lottie',
    name: 'DotLottie Animation',
    category: 'Animation',
    desc: 'Format animasi vektor Lottie / DotLottie interaktif berbobot ringan'
  },
  json: {
    ext: 'json',
    name: 'JSON Data',
    category: 'Data',
    desc: 'Format pertukaran data JavaScript Object Notation terstruktur'
  },
  ts: {
    ext: 'ts',
    name: 'TypeScript Code',
    category: 'Code',
    desc: 'Kode sumber TypeScript dengan pengetikan statis'
  },
  tsx: {
    ext: 'tsx',
    name: 'React TypeScript',
    category: 'Web',
    desc: 'Komponen antarmuka React dengan dukungan TypeScript'
  },
  js: {
    ext: 'js',
    name: 'JavaScript Code',
    category: 'Code',
    desc: 'Kode JavaScript standar ECMAScript'
  },
  jsx: {
    ext: 'jsx',
    name: 'React JavaScript',
    category: 'Web',
    desc: 'Komponen antarmuka React JSX'
  },
  py: {
    ext: 'py',
    name: 'Python Script',
    category: 'Code',
    desc: 'Skrip otomasi dan pengolahan data Python'
  },
  css: {
    ext: 'css',
    name: 'Cascading Style Sheets',
    category: 'Web',
    desc: 'Styling tata letak antarmuka web modern'
  },
  scss: {
    ext: 'scss',
    name: 'Sass / SCSS',
    category: 'Web',
    desc: 'Sintaks CSS preprocessor dengan variabel dan nesting'
  },
  sql: {
    ext: 'sql',
    name: 'SQL Query Script',
    category: 'Database',
    desc: 'Kueri dan skema basis data relasional'
  },
  md: {
    ext: 'md',
    name: 'Markdown Document',
    category: 'Docs',
    desc: 'Dokumentasi teks kaya format Markdown'
  },
  yaml: {
    ext: 'yaml',
    name: 'YAML Configuration',
    category: 'Config',
    desc: 'Berkas konfigurasi sistem dan pipeline CI/CD'
  },
  yml: {
    ext: 'yml',
    name: 'YML Configuration',
    category: 'Config',
    desc: 'Format konfigurasi ringkas YAML'
  },
  env: {
    ext: 'env',
    name: 'Environment Variables',
    category: 'Config',
    desc: 'Variabel lingkungan rahasia dan konfigurasi runtime'
  },
  xml: {
    ext: 'xml',
    name: 'XML Document',
    category: 'Data',
    desc: 'Format dokumen hierarkis Extensible Markup Language'
  },
  svg: {
    ext: 'svg',
    name: 'SVG Vector Graphic',
    category: 'Design',
    desc: 'Grafik vektor scalable berbasis XML'
  },
  txt: {
    ext: 'txt',
    name: 'Plain Text File',
    category: 'Docs',
    desc: 'Berkas catatan teks biasa'
  },
  gitignore: {
    ext: 'gitignore',
    name: 'Git Ignore Config',
    category: 'Config',
    desc: 'Daftar aturan pengabaian berkas version control Git'
  },
  gitattributes: {
    ext: 'gitattributes',
    name: 'Git Attributes & LFS',
    category: 'Config',
    desc: 'Konfigurasi pelacakan Git LFS dan line ending'
  },
  dockerfile: {
    ext: 'dockerfile',
    name: 'Docker Container Spec',
    category: 'DevOps',
    desc: 'Instruksi pembangunan container image Docker'
  },
  toml: {
    ext: 'toml',
    name: 'TOML Configuration',
    category: 'Config',
    desc: 'Toms Obvious Minimal Language config'
  },
  ini: {
    ext: 'ini',
    name: 'INI Configuration',
    category: 'Config',
    desc: 'Berkas parameter inisialisasi konfigurasi'
  }
};

export function getExtensionInfo(ext: string): ExtensionMeta {
  const clean = (ext || '').replace(/^\./, '').toLowerCase().trim();
  if (EXTENSION_REGISTRY[clean]) {
    return EXTENSION_REGISTRY[clean];
  }
  return {
    ext: clean || 'txt',
    name: clean ? clean.toUpperCase() : 'TXT',
    category: 'Lainnya',
    desc: `Berkas format .${clean || 'txt'}`
  };
}
