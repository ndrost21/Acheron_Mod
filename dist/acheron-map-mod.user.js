// ==UserScript==
// @name         Acheron Live Mini-Map Mod
// @namespace    https://github.com/dylanmccoyshaw/acheron
// @version      1.0.0
// @description  Always-visible live mini-map for Acheron web dungeon crawler
// @author       Acheron Mod Team
// @match        https://acheron.dylanmccoyshaw.workers.dev/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const MOD_STYLES = "/* Acheron Live Mini-Map Mod Stylesheet */\n\n#acheron-mod-root {\n  font-family: inherit;\n  color: var(--bone, #ECE5D8);\n  box-sizing: border-box;\n  z-index: 10000;\n  user-select: none;\n}\n\n#acheron-mod-root * {\n  box-sizing: border-box;\n}\n\n/* Sidebar Mode (Desktop) */\n#acheron-mod-root.ach-mode-sidebar {\n  position: fixed;\n  left: calc(50% + 295px);\n  top: 16px;\n  width: 340px;\n  max-height: calc(100vh - 32px);\n  display: flex;\n  flex-direction: column;\n  background: var(--win, #1E1D1A);\n  border: 2px solid var(--grid, #3B3834);\n  border-radius: 4px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);\n  overflow: hidden;\n  transition: opacity 0.15s ease;\n}\n\n/* Float Mode (HUD / Mobile) */\n#acheron-mod-root.ach-mode-float {\n  position: fixed;\n  right: 16px;\n  top: 16px;\n  width: 290px;\n  max-height: 85vh;\n  display: flex;\n  flex-direction: column;\n  background: var(--win, #1E1D1A);\n  border: 2px solid var(--grid, #3B3834);\n  border-radius: 4px;\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);\n  overflow: hidden;\n  transition: opacity 0.15s ease;\n}\n\n/* Minimized Pill Button */\n#acheron-mod-pill {\n  position: fixed;\n  right: 16px;\n  bottom: 16px;\n  z-index: 10001;\n  background: var(--win, #1E1D1A);\n  color: var(--bone, #ECE5D8);\n  border: 2px solid var(--gold, #E5B13B);\n  border-radius: 20px;\n  padding: 6px 14px;\n  font-size: 13px;\n  font-family: inherit;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);\n  transition: transform 0.1s ease, background 0.15s ease;\n}\n\n#acheron-mod-pill:hover {\n  background: var(--grid, #3B3834);\n  transform: translateY(-1px);\n}\n\n/* Header */\n.ach-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 10px;\n  background: var(--grid, #2D2A26);\n  border-bottom: 1px solid var(--rock, #3B3834);\n  cursor: move;\n}\n\n.ach-mode-sidebar .ach-header {\n  cursor: default;\n}\n\n.ach-title-wrap {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n  overflow: hidden;\n}\n\n.ach-title {\n  font-weight: bold;\n  font-size: 13px;\n  color: var(--gold, #E5B13B);\n  white-space: nowrap;\n}\n\n.ach-coords {\n  font-size: 11px;\n  color: var(--ash, #A8A297);\n  white-space: nowrap;\n}\n\n.ach-actions {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n\n.ach-btn {\n  background: transparent;\n  border: 1px solid var(--rock, #4A463E);\n  color: var(--bone, #ECE5D8);\n  font-size: 11px;\n  font-family: inherit;\n  padding: 2px 6px;\n  border-radius: 3px;\n  cursor: pointer;\n  line-height: 1.2;\n}\n\n.ach-btn:hover {\n  background: var(--rock, #4A463E);\n  color: var(--gold, #E5B13B);\n}\n\n.ach-btn.ach-active {\n  border-color: var(--gold, #E5B13B);\n  color: var(--gold, #E5B13B);\n}\n\n/* Viewport / Canvas Container */\n.ach-viewport {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 8px;\n  min-height: 220px;\n  max-height: 380px;\n  overflow: auto;\n  background: var(--void, #141311);\n}\n\n.ach-viewport canvas {\n  display: block;\n  image-rendering: pixelated;\n  image-rendering: crisp-edges;\n  cursor: crosshair;\n}\n\n/* Measurement Bar */\n.ach-measure {\n  padding: 4px 10px;\n  font-size: 11px;\n  color: var(--bone, #ECE5D8);\n  background: var(--grid, #252320);\n  border-top: 1px solid var(--rock, #3B3834);\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.ach-measure-clear {\n  color: var(--hurt, #D44638);\n  cursor: pointer;\n  font-size: 10px;\n  text-decoration: underline;\n}\n\n/* Collapsible Legend */\n.ach-legend-wrap {\n  border-top: 1px solid var(--rock, #3B3834);\n  font-size: 11px;\n  background: var(--win, #1E1D1A);\n}\n\n.ach-legend-summary {\n  padding: 6px 10px;\n  cursor: pointer;\n  color: var(--ash, #A8A297);\n  font-size: 11px;\n  list-style: none;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.ach-legend-summary::-webkit-details-marker {\n  display: none;\n}\n\n.ach-legend-summary:hover {\n  color: var(--bone, #ECE5D8);\n}\n\n.ach-legend-content {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 4px 8px;\n  padding: 6px 10px 10px 10px;\n  font-size: 10px;\n  color: var(--ash, #A8A297);\n  max-height: 130px;\n  overflow-y: auto;\n}\n\n.ach-legend-item {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.ach-legend-dot {\n  width: 10px;\n  height: 10px;\n  border-radius: 2px;\n  display: inline-block;\n  flex-shrink: 0;\n}\n\n.ach-dot-hero { background: var(--bone, #ECE5D8); border: 1px solid var(--gold, #E5B13B); }\n.ach-dot-seen { background: var(--floor-1, #D6CDC0); }\n.ach-dot-stairs { background: var(--gold, #E5B13B); }\n.ach-dot-safe { border: 2px solid var(--safe-edge, #3DA86B); }\n.ach-dot-mon { background: var(--hurt, #D44638); border-radius: 50%; }\n.ach-dot-hunt { background: var(--hunt, #E03131); border-radius: 50%; border: 1px solid #FFF; }\n.ach-dot-shop { background: #F2C94C; border-radius: 50%; }\n.ach-dot-lock { background: var(--gold, #E5B13B); }\n.ach-dot-fog { background: var(--room, #757067); }\n\n/* Responsive Adjustments */\n@media (max-width: 959px) {\n  #acheron-mod-root.ach-mode-sidebar {\n    display: none !important;\n  }\n}";

// --- state.js ---
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
const store = new ModStore();

// --- interceptor.js ---
// Network interceptor to extract live crawler & map data from Acheron API

let isHooked = false;
function initInterceptor() {
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
async function bootstrapState() {
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

// --- renderer.js ---
// Canvas Floor Renderer matching Acheron native style and themes

const DIRS = {
  n: [0, -1, 'north'],
  e: [1, 0, 'east'],
  s: [0, 1, 'south'],
  w: [-1, 0, 'west']
};

const COIN = {
  k: '#B8862A',
  y: '#F2C94C',
  w: '#FFF3B0'
};

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexRgb(hex) {
  const match = /^#([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  return match ? [0, 2, 4].map(idx => parseInt(match[1].slice(idx, idx + 2), 16)) : null;
}

function mixHex(hex1, hex2, ratio) {
  const c1 = hexRgb(hex1);
  const c2 = hexRgb(hex2);
  if (!c1 || !c2 || ratio <= 0) return hex1;
  return '#' + c1.map((val, idx) => Math.round(val + (c2[idx] - val) * ratio).toString(16).padStart(2, '0')).join('');
}
function getPalette(floor = 1) {
  const bone = cssVar('--bone') || '#ECE5D8';
  const room = cssVar('--room') || '#D6CDC0';
  const beenInk = parseFloat(cssVar('--been-ink')) || 0.12;
  const fogInk = parseFloat(cssVar('--fog-ink')) || 0.25;

  const floorColors = [null, 1, 2, 3, 4, 5, 6, 7].map(f => f ? (cssVar(`--floor-${f}`) || '#D6CDC0') : null);
  const beenTints = floorColors.map(color => color ? mixHex(color, bone, beenInk) : bone);
  const fog = mixHex(room, bone, fogInk);

  const paint = {
    rock: cssVar('--rock') || cssVar('--void') || '#262421',
    grid: cssVar('--grid') || '#3B3834',
    unk: fog || cssVar('--room') || '#9C968B',
    gold: cssVar('--gold') || '#E5B13B',
    air: cssVar('--ash') || '#A8A297',
    safeEdge: cssVar('--safe-edge') || '#3DA86B',
    mon: cssVar('--hurt') || '#D44638',
    hunt: cssVar('--hunt') || '#E03131',
    hero: cssVar('--bone') || '#ECE5D8',
    ink: cssVar('--win') || '#1E1D1A'
  };

  const tint = beenTints[floor] || beenTints[1] || '#D6CDC0';
  return { paint, tint, beenTints, fog };
}
function renderFloor(canvas, map, options = {}) {
  if (!canvas || !map || !map.grid || !map.w || !map.h) return;

  const w = map.w;
  const h = map.h;
  const floor = options.floor || 1;
  const { paint, tint } = getPalette(floor);

  const containerW = options.boxWidth || canvas.parentElement?.clientWidth || 300;
  const containerH = options.boxHeight || canvas.parentElement?.clientHeight || 300;

  let cell = options.cell;
  if (!cell) {
    if (options.zoom === 'fit' || !options.zoom || options.zoom === 1) {
      const available = Math.min(containerW, containerH);
      cell = Math.max(3, Math.floor(available / Math.max(w, h)));
    } else {
      const base = Math.max(3, Math.floor(Math.min(containerW, containerH) / Math.max(w, h)));
      cell = base * options.zoom;
    }
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 4000 / (cell * Math.max(w, h)));
  canvas.width = cell * w * dpr;
  canvas.height = cell * h * dpr;
  canvas.style.width = `${cell * w}px`;
  canvas.style.height = `${cell * h}px`;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const gap = cell >= 8 ? 1 : Math.max(0.5 / dpr, 0.06 * cell);
  ctx.fillStyle = paint.grid || paint.ink;
  ctx.fillRect(0, 0, cell * w, cell * h);

  const fillRoom = (x, y, color, customGap) => {
    const g = customGap || gap;
    ctx.fillStyle = color;
    ctx.fillRect(x * cell + g, y * cell + g, cell - 2 * g, cell - 2 * g);
  };

  const strokeSafe = (x, y) => {
    ctx.strokeStyle = paint.safeEdge;
    ctx.lineWidth = Math.max(1, 0.12 * cell);
    ctx.strokeRect(x * cell + 0.2 * cell, y * cell + 0.2 * cell, 0.6 * cell, 0.6 * cell);
  };

  const fillCircle = (x, y, color, radiusRatio) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * cell + cell / 2, y * cell + cell / 2, Math.max(1.2, cell * radiusRatio), 0, Math.PI * 2);
    ctx.fill();
  };

  let startCoord = null;

  // Render Grid Cells
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tile = map.grid[y * w + x];
      if (tile === '#') {
        ctx.fillStyle = paint.rock || paint.ink;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      } else if (['?', '!', 'B', 'X', 'Z', 'S', 'v', 'L', 'H', 'K'].includes(tile)) {
        fillRoom(x, y, paint.unk);
        if (['v', 'L', 'H', 'K'].includes(tile)) {
          ctx.globalAlpha = cell >= 5 ? 0.16 : 0.35;
          fillRoom(x, y, tint);
          ctx.globalAlpha = 1;
          if (cell >= 5) {
            const lw = Math.max(1, Math.round(0.12 * cell));
            const n = gap + lw / 2;
            ctx.globalAlpha = 0.65;
            ctx.strokeStyle = tint;
            ctx.lineWidth = lw;
            ctx.strokeRect(x * cell + n, y * cell + n, cell - 2 * n, cell - 2 * n);
            ctx.globalAlpha = 1;
          }
        }
        if (tile === 'L') {
          ctx.fillStyle = paint.gold;
          const sz = Math.max(1, 0.16 * cell);
          ctx.fillRect(x * cell + cell / 2 - sz, y * cell + cell / 2 - sz, 2 * sz, 2 * sz);
        } else if (tile === 'H') {
          fillCircle(x, y, paint.air, 0.16);
        } else if (tile === 'K') {
          fillCircle(x, y, paint.gold, 0.2);
          fillCircle(x, y, paint.unk, 0.08);
        } else if (tile === '!') {
          fillCircle(x, y, paint.mon, 0.18);
        } else if (tile === 'B') {
          fillCircle(x, y, paint.mon, 0.32);
          fillCircle(x, y, paint.ink, 0.12);
        } else if (tile === 'X') {
          fillCircle(x, y, paint.gold, 0.42);
          fillCircle(x, y, paint.mon, 0.32);
          fillCircle(x, y, paint.ink, 0.12);
        } else if (tile === 'Z') {
          strokeSafe(x, y);
        } else if (tile === 'S') {
          fillRoom(x, y, paint.gold, Math.max(gap, Math.round(0.18 * cell)));
        }
      } else {
        fillRoom(x, y, tile === 's' ? paint.gold : tint);
        if (tile === 'z' || tile === 'y') strokeSafe(x, y);
        if (tile === 'd' || tile === 'f' || tile === 'y') {
          ctx.fillStyle = paint.air;
          ctx.globalAlpha = tile === 'f' ? 0.45 : 0.85;
          ctx.fillRect(x * cell + 0.25 * cell, y * cell + 0.45 * cell, 0.5 * cell, Math.max(1, 0.12 * cell));
          ctx.globalAlpha = 1;
        }
        if (tile === 'o') startCoord = [x, y];
      }
    }
  }

  // Cleared Ground Zones
  if (map.zones) {
    const getZone = (zx, zy) => (zx < 0 || zy < 0 || zx >= w || zy >= h) ? '' : map.zones[zy * w + zx];
    ctx.fillStyle = paint.gold;
    const borderW = Math.max(1, Math.round(0.14 * cell));
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const z = getZone(x, y);
        if (z && z !== '.') {
          if (getZone(x, y - 1) !== z) ctx.fillRect(x * cell, y * cell, cell, borderW);
          if (getZone(x, y + 1) !== z) ctx.fillRect(x * cell, (y + 1) * cell - borderW, cell, borderW);
          if (getZone(x - 1, y) !== z) ctx.fillRect(x * cell, y * cell, borderW, cell);
          if (getZone(x + 1, y) !== z) ctx.fillRect((x + 1) * cell - borderW, y * cell, borderW, cell);
        }
      }
    }
  }

  // Slow ground
  if (map.slow && cell >= 4) {
    ctx.fillStyle = paint.air;
    ctx.globalAlpha = 0.6;
    for (const idx of map.slow) {
      const sx = idx % w;
      const sy = Math.floor(idx / w);
      const rad = Math.max(0.6, 0.07 * cell);
      for (const [ox, oy] of [[0.28, 0.3], [0.68, 0.42], [0.4, 0.72]]) {
        ctx.beginPath();
        ctx.arc(sx * cell + cell * ox, sy * cell + cell * oy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Backtracking, wanderers, shops, memorials, clues
  for (const idx of map.back || []) fillCircle(idx % w, Math.floor(idx / w), paint.mon, 0.18);
  for (const idx of map.wand || []) {
    const wx = idx % w;
    const wy = Math.floor(idx / w);
    fillCircle(wx, wy, paint.mon, 0.3);
    fillCircle(wx, wy, paint.unk, 0.14);
    fillCircle(wx, wy, paint.mon, 0.08);
  }
  for (const [idx, mtype] of map.mems || []) {
    const mx = idx % w;
    const my = Math.floor(idx / w);
    const s = cell / 10;
    if (mtype === 's') {
      ctx.fillStyle = '#5E584E';
      ctx.fillRect(mx * cell + 2.5 * s, my * cell + 7 * s, 5 * s, 2 * s);
      ctx.fillStyle = '#E8E2D2';
      ctx.fillRect(mx * cell + 3.8 * s, my * cell + 1.5 * s, 2.4 * s, 5.5 * s);
    } else {
      ctx.fillStyle = '#4A463E';
      ctx.beginPath();
      ctx.arc(mx * cell + 5 * s, my * cell + 4.5 * s, 2.6 * s, Math.PI, 0);
      ctx.lineTo(mx * cell + 7.6 * s, my * cell + 8.5 * s);
      ctx.lineTo(mx * cell + 2.4 * s, my * cell + 8.5 * s);
      ctx.closePath();
      ctx.fill();
    }
  }
  for (const idx of map.shops || []) {
    const sx = idx % w;
    const sy = Math.floor(idx / w);
    fillCircle(sx, sy, COIN.k, 0.3);
    fillCircle(sx, sy, COIN.y, 0.22);
  }
  if (map.clue !== undefined && map.clue !== null) {
    const cx = map.clue % w;
    const cy = Math.floor(map.clue / w);
    const drawPaw = (ox, oy, rad) => {
      ctx.beginPath();
      ctx.arc(cx * cell + cell * (0.5 + ox), cy * cell + cell * (0.5 + oy), Math.max(0.8, cell * rad), 0, Math.PI * 2);
      ctx.fill();
    };
    ctx.fillStyle = paint.gold;
    drawPaw(0, 0.12, 0.2);
    drawPaw(-0.24, -0.12, 0.1);
    drawPaw(0, -0.25, 0.1);
    drawPaw(0.24, -0.12, 0.1);
  }

  // Hunters
  const hunters = (map.hunt || []).map(idx => [idx % w, Math.floor(idx / w)]);
  for (const [hx, hy] of hunters) {
    fillCircle(hx, hy, paint.hunt, 0.32);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(1, 0.08 * cell);
    ctx.beginPath();
    ctx.arc(hx * cell + cell / 2, hy * cell + cell / 2, Math.max(1.2, cell * 0.32), 0, Math.PI * 2);
    ctx.stroke();
  }

  // Arrow & Portal
  if (map.portal !== undefined && map.portal !== null) {
    fillCircle(map.portal % w, Math.floor(map.portal / w), '#9B6BE0', 0.34);
    fillCircle(map.portal % w, Math.floor(map.portal / w), '#C9A8F5', 0.1);
  }
  if (map.arrow && DIRS[map.arrow.d]) {
    const ax = map.arrow.at % w;
    const ay = Math.floor(map.arrow.at / w);
    const cx = ax * cell + cell / 2;
    const cy = ay * cell + cell / 2;
    const rad = Math.max(2, 0.34 * cell);
    const [dx, dy] = DIRS[map.arrow.d];
    ctx.fillStyle = paint.gold;
    ctx.beginPath();
    ctx.moveTo(cx + dx * rad, cy + dy * rad);
    ctx.lineTo(cx - dx * rad * 0.7 - dy * rad * 0.8, cy - dy * rad * 0.7 - dx * rad * 0.8);
    ctx.lineTo(cx - dx * rad * 0.7 + dy * rad * 0.8, cy - dy * rad * 0.7 + dx * rad * 0.8);
    ctx.closePath();
    ctx.fill();
  }

  // Start indicator
  const entry = map.start || startCoord;
  if (entry) {
    const [ex, ey] = entry;
    const cx = ex * cell + cell / 2;
    const cy = ey * cell + cell / 2 + 0.04 * cell;
    const rad = Math.max(2.5, 0.36 * cell);
    ctx.beginPath();
    ctx.moveTo(cx, cy - rad);
    ctx.lineTo(cx + rad, cy + 0.75 * rad);
    ctx.lineTo(cx - rad, cy + 0.75 * rad);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1, 0.1 * cell);
    ctx.strokeStyle = paint.ink;
    ctx.stroke();
    ctx.fillStyle = paint.hero;
    ctx.fill();
  }

  // Pin marker (measurement)
  if (options.pin) {
    const [px, py] = options.pin;
    ctx.strokeStyle = '#E0483C';
    ctx.lineWidth = Math.max(2, 0.18 * cell);
    ctx.strokeRect(px * cell + 1, py * cell + 1, cell - 2, cell - 2);
  }

  // Hero Position
  if (map.x !== undefined && map.y !== undefined) {
    const hx = map.x;
    const hy = map.y;
    ctx.fillStyle = paint.ink;
    ctx.fillRect(hx * cell - 1, hy * cell - 1, cell + 2, cell + 2);
    ctx.fillStyle = paint.hero;
    ctx.fillRect(hx * cell + 1, hy * cell + 1, cell - 2, cell - 2);
    // Draw an inner pulse dot for clear visibility
    ctx.fillStyle = paint.gold;
    ctx.fillRect(hx * cell + cell * 0.3, hy * cell + cell * 0.3, cell * 0.4, cell * 0.4);
  }

  return { cell, width: cell * w, height: cell * h };
}
function tileCoordsAt(canvas, map, clientX, clientY) {
  if (!canvas || !map || !map.w || !map.h) return null;
  const rect = canvas.getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
  const x = Math.floor((clientX - rect.left) / (rect.width / map.w));
  const y = Math.floor((clientY - rect.top) / (rect.height / map.h));
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
  return [x, y];
}

// --- ui.js ---
// UI Component managing Sidebar and Floating HUD Mini-Map


let rootEl = null;
let pillEl = null;
let canvasEl = null;
let titleEl = null;
let coordsEl = null;
let measureEl = null;
let viewportEl = null;
let zoomBtns = {};
let modeBtn = null;
function initUI() {
  if (rootEl) return;

  // Create Root Container
  rootEl = document.createElement('div');
  rootEl.id = 'acheron-mod-root';
  rootEl.className = `ach-mode-${store.mode}`;
  if (store.minimized) rootEl.style.display = 'none';

  // Create Minimized Pill
  pillEl = document.createElement('button');
  pillEl.id = 'acheron-mod-pill';
  pillEl.innerHTML = `<span>🗺️</span> <span>Map</span>`;
  pillEl.style.display = store.minimized ? 'flex' : 'none';
  pillEl.onclick = () => store.setMinimized(false);
  document.body.appendChild(pillEl);

  // Header & Controls
  const header = document.createElement('div');
  header.className = 'ach-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'ach-title-wrap';

  titleEl = document.createElement('span');
  titleEl.className = 'ach-title';
  titleEl.textContent = 'Floor 1';

  coordsEl = document.createElement('span');
  coordsEl.className = 'ach-coords';
  coordsEl.textContent = '(--, --)';

  titleWrap.appendChild(titleEl);
  titleWrap.appendChild(coordsEl);

  const actions = document.createElement('div');
  actions.className = 'ach-actions';

  const makeBtn = (text, onClick, title) => {
    const btn = document.createElement('button');
    btn.className = 'ach-btn';
    btn.textContent = text;
    btn.title = title || text;
    btn.onclick = onClick;
    return btn;
  };

  zoomBtns['fit'] = makeBtn('Fit', () => store.setZoom('fit'), 'Fit map to viewport');
  zoomBtns[1] = makeBtn('1×', () => store.setZoom(1), 'Normal zoom');
  zoomBtns[2] = makeBtn('2×', () => store.setZoom(2), '2x zoom');

  modeBtn = makeBtn(
    store.mode === 'sidebar' ? 'Float' : 'Dock',
    () => store.setMode(store.mode === 'sidebar' ? 'float' : 'sidebar'),
    'Switch display mode'
  );

  const minBtn = makeBtn('—', () => store.setMinimized(true), 'Minimize to pill');

  actions.appendChild(zoomBtns['fit']);
  actions.appendChild(zoomBtns[1]);
  actions.appendChild(zoomBtns[2]);
  actions.appendChild(modeBtn);
  actions.appendChild(minBtn);

  header.appendChild(titleWrap);
  header.appendChild(actions);

  // Viewport & Canvas
  viewportEl = document.createElement('div');
  viewportEl.className = 'ach-viewport';

  canvasEl = document.createElement('canvas');
  viewportEl.appendChild(canvasEl);

  // Measurement Bar
  measureEl = document.createElement('div');
  measureEl.className = 'ach-measure';
  measureEl.innerHTML = `<span>Click any tile to measure</span>`;

  // Legend
  const legendDetails = document.createElement('details');
  legendDetails.className = 'ach-legend-wrap';
  const legendSummary = document.createElement('summary');
  legendSummary.className = 'ach-legend-summary';
  legendSummary.innerHTML = `<span>Map Key</span> <span>▾</span>`;
  legendDetails.appendChild(legendSummary);

  const legendContent = document.createElement('div');
  legendContent.className = 'ach-legend-content';
  legendContent.innerHTML = `
    <div class="ach-legend-item"><span class="ach-legend-dot ach-dot-hero"></span><span>You</span></div>
    <div class="ach-legend-item"><span class="ach-legend-dot ach-dot-stairs"></span><span>Stairs</span></div>
    <div class="ach-legend-item"><span class="ach-legend-dot ach-dot-safe"></span><span>Safe Room</span></div>
    <div class="ach-legend-item"><span class="ach-legend-dot ach-dot-seen"></span><span>Explored</span></div>
    <div class="ach-legend-item"><span class="ach-legend-dot ach-dot-mon"></span><span>Monster</span></div>
    <div class="ach-legend-item"><span class="ach-legend-dot ach-dot-hunt"></span><span>Hunter</span></div>
    <div class="ach-legend-item"><span class="ach-legend-dot ach-dot-shop"></span><span>Shop / Clue</span></div>
    <div class="ach-legend-item"><span class="ach-legend-dot ach-dot-fog"></span><span>Unexplored</span></div>
  `;
  legendDetails.appendChild(legendContent);

  rootEl.appendChild(header);
  rootEl.appendChild(viewportEl);
  rootEl.appendChild(measureEl);
  rootEl.appendChild(legendDetails);

  document.body.appendChild(rootEl);

  // Setup Event Listeners
  setupDraggable(header, rootEl);
  setupCanvasInteraction(canvasEl);

  // Window resize observer
  window.addEventListener('resize', handleResize);

  // Subscribe to store updates
  store.subscribe(updateUI);
  updateUI(store);
}

function handleResize() {
  if (window.innerWidth < 960 && store.mode === 'sidebar') {
    store.setMode('float');
  }
}

function setupDraggable(handle, container) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  handle.addEventListener('pointerdown', (e) => {
    if (store.mode !== 'float') return;
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = container.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    container.style.right = 'auto';
    container.style.left = `${initialLeft}px`;
    container.style.top = `${initialTop}px`;
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    container.style.left = `${Math.max(10, Math.min(window.innerWidth - container.offsetWidth - 10, initialLeft + dx))}px`;
    container.style.top = `${Math.max(10, Math.min(window.innerHeight - container.offsetHeight - 10, initialTop + dy))}px`;
  });

  const stopDrag = () => { isDragging = false; };
  handle.addEventListener('pointerup', stopDrag);
  handle.addEventListener('pointercancel', stopDrag);
}

function setupCanvasInteraction(canvas) {
  canvas.addEventListener('click', (e) => {
    if (!store.map) return;
    const coords = tileCoordsAt(canvas, store.map, e.clientX, e.clientY);
    if (!coords) return;

    if (store.pin && store.pin[0] === coords[0] && store.pin[1] === coords[1]) {
      store.setPin(null);
    } else {
      store.setPin(coords);
    }
  });
}

function updateUI(st) {
  if (!rootEl) return;

  // Mode & Minimized State
  rootEl.className = `ach-mode-${st.mode}`;
  rootEl.style.display = st.minimized ? 'none' : 'flex';
  pillEl.style.display = st.minimized ? 'flex' : 'none';
  modeBtn.textContent = st.mode === 'sidebar' ? 'Float' : 'Dock';

  // Zoom active state
  for (const [key, btn] of Object.entries(zoomBtns)) {
    if (String(st.zoom) === String(key)) {
      btn.classList.add('ach-active');
    } else {
      btn.classList.remove('ach-active');
    }
  }

  // Title & Coordinates
  const floorName = st.crawler?.beyond?.live ? 'The Beyond' : `Floor ${st.floor || 1}`;
  titleEl.textContent = `🗺️ ${floorName}`;

  if (st.hero) {
    coordsEl.textContent = `(${st.hero[0]}, ${st.hero[1]})`;
    pillEl.innerHTML = `<span>🗺️</span> <span>Floor ${st.floor || 1} (${st.hero[0]}, ${st.hero[1]})</span>`;
  } else {
    coordsEl.textContent = '(--, --)';
  }

  // Measurement bar
  if (st.pin && st.hero) {
    const dx = st.pin[0] - st.hero[0];
    const dy = st.pin[1] - st.hero[1];
    const dist = Math.abs(dx) + Math.abs(dy);
    const parts = [];
    if (dx !== 0) parts.push(`${Math.abs(dx)} ${dx > 0 ? 'East' : 'West'}`);
    if (dy !== 0) parts.push(`${Math.abs(dy)} ${dy > 0 ? 'South' : 'North'}`);
    const dirStr = parts.length ? ` (${parts.join(', ')})` : ' (Here)';

    measureEl.innerHTML = `
      <span>Pin: <b>${dist} steps</b>${dirStr}</span>
      <span class="ach-measure-clear" onclick="window.__achClearPin()">Clear</span>
    `;
  } else {
    measureEl.innerHTML = `<span>Click any tile to measure</span>`;
  }

  // Render Map Canvas
  if (st.map) {
    const boxW = viewportEl.clientWidth || 300;
    const boxH = viewportEl.clientHeight || 260;
    renderFloor(canvasEl, st.map, {
      floor: st.floor,
      zoom: st.zoom,
      boxWidth: boxW,
      boxHeight: boxH,
      pin: st.pin
    });
  }
}

// Global pin clearer for inline onclick
window.__achClearPin = () => {
  store.setPin(null);
};

// --- mod.js ---
// Main Entry Point for Acheron Map Mod
function startMod(stylesCss = '') {
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

  startMod(MOD_STYLES);
})();
