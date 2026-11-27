// Network interceptor to extract live crawler & map data from Acheron API

import { store } from './state.js';

let isHooked = false;

export function initInterceptor() {
  if (isHooked) return;
  isHooked = true;

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    try {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
      if (url.includes('/api/')) {
        const clone = response.clone();
        clone.json().then(data => {
          if (!data) return;
          if (data.me && data.me.map) {
            store.setCrawler(data.me);
          } else if (data.data && data.data.me && data.data.me.map) {
            store.setCrawler(data.data.me);
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('[AcheronMod] Interceptor inspect error:', e);
    }

    return response;
  };

  // Bootstrap if the game state was already loaded prior to injection
  setTimeout(bootstrapState, 600);
}

export async function bootstrapState() {
  if (store.map) return;
  try {
    const key = localStorage.getItem('uc-key');
    if (!key) return;

    const build = window.UC_BUILD || '';
    const res = await window.fetch('/api/state', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'x-uc-key': key,
        'x-uc-build': String(build)
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.me && data.me.map) {
        store.setCrawler(data.me);
      }
    }
  } catch (err) {
    console.debug('[AcheronMod] Bootstrap state failed (offline or pending start):', err);
  }
}
