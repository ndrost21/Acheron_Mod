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

export function getPalette(floor = 1) {
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

export function renderFloor(canvas, map, options = {}) {
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

export function tileCoordsAt(canvas, map, clientX, clientY) {
  if (!canvas || !map || !map.w || !map.h) return null;
  const rect = canvas.getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
  const x = Math.floor((clientX - rect.left) / (rect.width / map.w));
  const y = Math.floor((clientY - rect.top) / (rect.height / map.h));
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
  return [x, y];
}
