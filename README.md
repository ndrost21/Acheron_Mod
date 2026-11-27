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

Choose whichever method is easiest for you:

### Option 1: Userscript (Recommended — Fastest & Works on All Browsers)
Works on **Chrome, Firefox, Edge, Brave, Safari, and Opera**:

1. Install a userscript manager extension if you don't already have one:
   - [Violentmonkey](https://violentmonkey.github.io/) (Open-source, recommended)
   - [Tampermonkey](https://www.tampermonkey.net/)
2. Open your userscript manager dashboard and click **Create a new script** (or `+`).
3. Copy the entire contents of [`dist/acheron-map-mod.user.js`](dist/acheron-map-mod.user.js) and paste it into the editor, replacing any default template.
4. Save the script (<kbd>Ctrl</kbd> + <kbd>S</kbd> or click the Save icon).
5. Open [https://acheron.dylanmccoyshaw.workers.dev/](https://acheron.dylanmccoyshaw.workers.dev/). The live mini-map will appear automatically!

---

### Option 2: Browser Extension (Chrome, Edge, Brave, Opera)
No userscript manager needed — runs natively as an unpacked extension:

1. Download or clone this repository to your computer:
   - If downloading as a ZIP from GitHub: click the green **Code** button -> **Download ZIP**, then extract it.
2. Open your browser's extensions page:
   - **Chrome / Brave**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Opera**: `opera://extensions`
3. Turn on the **Developer Mode** toggle (usually in the top-right corner).
4. Click the **Load unpacked** button (top-left).
5. Select the `dist/extension` folder inside this repository.
6. Open [https://acheron.dylanmccoyshaw.workers.dev/](https://acheron.dylanmccoyshaw.workers.dev/) and play!

---

### 💡 Quick Controls & Tips

- **Switching Modes**: Click the **Float** or **Dock** button in the mini-map header to toggle between the desktop sidebar and a floating, draggable HUD.
- **Measuring Distance**: Click any tile on the mini-map to place a pin marker. It will display the exact step distance and directions (e.g. `5 steps (3 East, 2 South)`) from your hero. Click **Clear** to remove the pin.
- **Minimizing**: Click the `—` button in the header to minimize the map into a discreet floating pill (`🗺️ Floor 1 (X, Y)`). Click the pill anytime to expand it back.
- **First Load**: If you enter the game and the map hasn't loaded yet, simply take one step or refresh the page; the mod will immediately sync with your crawler state.

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
