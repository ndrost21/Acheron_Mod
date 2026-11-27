// UI Component managing Sidebar and Floating HUD Mini-Map

import { store } from './state.js';
import { renderFloor, tileCoordsAt } from './renderer.js';

let rootEl = null;
let pillEl = null;
let canvasEl = null;
let titleEl = null;
let coordsEl = null;
let measureEl = null;
let viewportEl = null;
let zoomBtns = {};
let modeBtn = null;

export function initUI() {
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
