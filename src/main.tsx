import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('reset') || urlParams.get('domain') === 'reset' || window.location.search.includes('reset')) {
  caches.keys().then((names) => {
    return Promise.all(names.map((name) => caches.delete(name)));
  }).finally(() => {
    window.location.replace(window.location.origin + window.location.pathname);
  });
}

window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || '');
  if (reasonStr.includes('WebSocket') || reasonStr.includes('vite')) {
    event.preventDefault();
  }
});

window.addEventListener('error', (e) => {
  if (e.message?.includes('WebSocket') || e.message?.includes('vite')) {
    return;
  }
  if (document.getElementById('root')?.innerHTML === '') {
    document.getElementById('root')!.innerHTML = `
      <div style="padding: 20px; color: white; background: #990000; font-family: monospace;">
        <h2>Runtime Error</h2>
        <p>${e.message}</p>
        <pre>${e.error?.stack || ''}</pre>
      </div>
    `;
  }
});

if ('caches' in window) {
  caches.keys().then((names) => {
    for (const name of names) {
      if (name !== 'auto-cache-v11') {
        caches.delete(name);
      }
    }
  });
}

try {
  const cachedFiles = localStorage.getItem('cyberScriptFiles');
  if (cachedFiles) {
    const parsed = JSON.parse(cachedFiles);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter((f: any) => !f.isDefault && !f.id?.startsWith('default-'));
      if (filtered.length !== parsed.length) {
        localStorage.setItem('cyberScriptFiles', JSON.stringify(filtered));
      }
    }
  }
} catch {}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        registration.update();
      },
      (err) => {
        console.log('SW registration failed:', err);
      }
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
