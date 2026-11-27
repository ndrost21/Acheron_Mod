// Central reactive state store for Acheron Map Mod

class ModStore {
  constructor() {
    this.crawler = null;
    this.map = null;
    this.floor = 1;
    this.hero = null;
    this.pin = null;
    this.zoom = this.loadPref('zoom', 1); // 1, 2, or 'fit'
    this.mode = this.loadPref('mode', window.innerWidth >= 960 ? 'sidebar' : 'float');
    this.minimized = this.loadPref('minimized', false);
    this.listeners = new Set();
  }

  loadPref(key, fallback) {
    try {
      const val = localStorage.getItem(`ach-mod-${key}`);
      if (val !== null) return JSON.parse(val);
    } catch (_) {}
    return fallback;
  }

  savePref(key, val) {
    try {
      localStorage.setItem(`ach-mod-${key}`, JSON.stringify(val));
    } catch (_) {}
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event) {
    for (const listener of this.listeners) {
      try {
        listener(this, event);
      } catch (err) {
        console.error('[AcheronMod] Error in state listener:', err);
      }
    }
  }

  setCrawler(me) {
    if (!me) return;
    this.crawler = me;
    this.floor = me.floor || 1;
    if (me.map) {
      this.map = me.map;
      this.hero = [me.map.x, me.map.y];
    }
    this.notify('crawler');
  }

  setPin(pos) {
    this.pin = pos;
    this.notify('pin');
  }

  setZoom(zoom) {
    this.zoom = zoom;
    this.savePref('zoom', zoom);
    this.notify('zoom');
  }

  setMode(mode) {
    this.mode = mode;
    this.savePref('mode', mode);
    this.notify('mode');
  }

  setMinimized(minimized) {
    this.minimized = minimized;
    this.savePref('minimized', minimized);
    this.notify('minimized');
  }
}

export const store = new ModStore();
