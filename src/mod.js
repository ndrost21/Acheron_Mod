// Main Entry Point for Acheron Map Mod

import { store } from './core/state.js';
import { initInterceptor } from './core/interceptor.js';
import { initUI } from './core/ui.js';

export function startMod(stylesCss = '') {
  console.log('[AcheronMod] Initializing Live Mini-Map Mod...');

  // Inject styles if passed or link to existing
  if (stylesCss && !document.getElementById('acheron-mod-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'acheron-mod-styles';
    styleTag.textContent = stylesCss;
    document.head.appendChild(styleTag);
  }

  // Hook into API requests immediately
  initInterceptor();

  // Mount UI when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initUI());
  } else {
    initUI();
  }

  // Expose global for debugging and developer inspection
  window.__AcheronMod = {
    store,
    version: '1.0.0'
  };
}
