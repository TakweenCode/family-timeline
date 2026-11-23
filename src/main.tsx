import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import type { BeforeInstallPromptEvent } from './hooks/usePWAInstall';
import App from './App.tsx';
import './index.css';

// Capture early beforeinstallprompt before React mounts
window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  window.__deferredPWAInstallPrompt = e as BeforeInstallPromptEvent;
});

// Register PWA Service Worker for offline support and home screen installability
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
