# Acheron Live Mini-Map Mod

An always-visible, real-time mini-map mod for the web dungeon crawler [Acheron](https://acheron.dylanmccoyshaw.workers.dev/).

In standard Acheron, checking your map requires pressing <kbd>M</kbd> or clicking "Map", which pops up a full-screen modal blocking your dungeon view and movement controls. This mod renders the floor map directly on-screen in real time so you can navigate seamlessly.

---

## ✨ Features

- **Live Auto-Update**: Renders your current position, revealed rooms, stairs, hunters, shrines, and shops on every step without pressing <kbd>M</kbd>.
- **Dual Display Modes**:
  - **Desktop Sidebar Mode ($\ge$ 960px)**: Docks neatly to the right of the game column, keeping dungeon text and movement controls completely unobstructed.
  - **Floating HUD Mode**: Collapsible, draggable mini-map widget for compact windows or custom placement.
- **Native Theme Integration**: Reads the game's active CSS variables (`--bone`, `--room`, `--floor-1`–`--floor-7`, `--rock`, etc.) to automatically match any game theme (*Pocket*, *Phosphor*, *Jumbotron*, *Bloodsport*, *Brass*) and day/night mode.
- **Distance Measurement**: Click any tile to place a pin and instantly see the exact step distance and cardinal directions (`"5 steps (3 East, 2 South)"`).
- **Zoom & Pan**: Switch between `Fit` (auto-scale), `1×`, and `2×` zoom.
- **Collapsible Legend**: Quick on-screen reference for dungeon tile markers (Hero, Stairs, Safe Rooms, Hunters, Monsters, Shops, etc.).
- **Minimize to Pill**: One-click minimize to a subtle floating pill button (`🗺️ Floor 1 (X, Y)`) that expands when clicked.

---

## 🚀 Installation & Usage

Choose either of the two installation methods below:

### Option 1: Userscript (Recommended — Easiest)
Works in any browser with **Tampermonkey** or **Violentmonkey**:

1. Install [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. In your userscript manager dashboard, create a **New Script** (or use "Install from file / URL").
3. Copy and paste the contents of [`dist/acheron-map-mod.user.js`](dist/acheron-map-mod.user.js).
4. Save the script and visit [Acheron](https://acheron.dylanmccoyshaw.workers.dev/). The mini-map will appear automatically!

---

### Option 2: Chrome / Edge / Brave Extension (Unpacked)

1. Open your browser's extension manager:
   - Chrome / Brave: navigate to `chrome://extensions`
   - Edge: navigate to `edge://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the [`dist/extension`](dist/extension) folder from this repository.
5. Visit [Acheron](https://acheron.dylanmccoyshaw.workers.dev/).

---

## 🛠️ Project Structure

```
Acheron_Mod/
├── src/
│   ├── core/
│   │   ├── interceptor.js    # Hooks window.fetch to capture /api/state and /api/act
│   │   ├── renderer.js       # Game-native Canvas floor rendering engine
│   │   ├── state.js          # Reactive store for map data, hero coords, and prefs
│   │   └── ui.js             # Sidebar, Floating HUD, and interactive controls
│   ├── styles/
│   │   └── mod.css           # Styling adhering to Acheron visual aesthetic
│   └── mod.js                # Mod bootstrapping and entry point
├── extension/
│   └── manifest.json         # Manifest V3 extension definition
├── dist/
│   ├── acheron-map-mod.user.js # Ready-to-use compiled Userscript
│   └── extension/             # Ready-to-load unpacked Chromium extension
│       ├── manifest.json
│       ├── content.js
│       ├── styles.css
│       └── icons/
└── build.py                  # Zero-dependency build script (Python 3)
```

---

## 🔨 Building / Developing

To rebuild the distribution packages after making edits to `src/`:

```bash
python build.py
```

This compiles all modules into `dist/acheron-map-mod.user.js` and `dist/extension/content.js`.
