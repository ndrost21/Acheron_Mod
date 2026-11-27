#!/usr/bin/env python3
"""
Build script for Acheron Live Mini-Map Mod.
Packages the modular source files into:
1. dist/acheron-map-mod.user.js (Userscript for Tampermonkey/Violentmonkey)
2. dist/extension/ (Unpacked Chromium Extension Manifest V3)
Zero external dependencies (pure standard Python 3).
"""

import os
import re
import json
import zlib
import struct

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(ROOT, "src")
DIST_DIR = os.path.join(ROOT, "dist")
EXT_DIST_DIR = os.path.join(DIST_DIR, "extension")

USER_SCRIPT_HEADER = """// ==UserScript==
// @name         Acheron Live Mini-Map Mod
// @namespace    https://github.com/dylanmccoyshaw/acheron
// @version      1.0.0
// @description  Always-visible live mini-map for Acheron web dungeon crawler
// @author       Acheron Mod Team
// @match        https://acheron.dylanmccoyshaw.workers.dev/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

"""

def strip_es_modules(code: str) -> str:
    # Remove import statements
    code = re.sub(r'^\s*import\s+.*?;?\s*$', '', code, flags=re.MULTILINE)
    # Replace 'export const', 'export function', 'export async function', 'export class' with bare declarations
    code = re.sub(r'^\s*export\s+(async\s+)?(const|let|var|function|class)\s+', r'\1\2 ', code, flags=re.MULTILINE)
    # Remove named exports like 'export { ... };' or 'export default ...'
    code = re.sub(r'^\s*export\s*\{[^}]*\};?\s*$', '', code, flags=re.MULTILINE)
    code = re.sub(r'^\s*export\s+default\s+.*?;?\s*$', '', code, flags=re.MULTILINE)
    return code.strip()

def create_simple_png(size: int, color_rgb=(229, 177, 59)) -> bytes:
    """Generates a valid minimalist PNG in pure python."""
    width, height = size, size
    # Create raw image buffer: RGBA
    raw = bytearray()
    r, g, b = color_rgb
    for y in range(height):
        raw.append(0) # filter byte: None
        for x in range(width):
            # Draw a border and filled inner square (resembling a dungeon tile)
            is_border = (x == 0 or x == width - 1 or y == 0 or y == height - 1)
            is_center = (width // 4 <= x < width * 3 // 4 and height // 4 <= y < height * 3 // 4)
            if is_border:
                raw.extend([30, 29, 26, 255])
            elif is_center:
                raw.extend([r, g, b, 255])
            else:
                raw.extend([60, 56, 52, 255])

    compressed = zlib.compress(bytes(raw), 9)

    def chunk(tag: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(tag + data) & 0xffffffff
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', crc)

    png_header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    idat = chunk(b'IDAT', compressed)
    iend = chunk(b'IEND', b'')
    return png_header + ihdr + idat + iend

def build():
    os.makedirs(DIST_DIR, exist_ok=True)
    os.makedirs(EXT_DIST_DIR, exist_ok=True)
    icons_dir = os.path.join(EXT_DIST_DIR, "icons")
    os.makedirs(icons_dir, exist_ok=True)

    # 1. Read CSS
    css_path = os.path.join(SRC_DIR, "styles", "mod.css")
    with open(css_path, "r", encoding="utf-8") as f:
        mod_css = f.read().strip()

    # 2. Read and strip JS modules in dependency order
    files = [
        os.path.join(SRC_DIR, "core", "state.js"),
        os.path.join(SRC_DIR, "core", "interceptor.js"),
        os.path.join(SRC_DIR, "core", "renderer.js"),
        os.path.join(SRC_DIR, "core", "ui.js"),
        os.path.join(SRC_DIR, "mod.js"),
    ]

    combined_js = []
    for fp in files:
        with open(fp, "r", encoding="utf-8") as f:
            code = f.read()
            cleaned = strip_es_modules(code)
            combined_js.append(f"// --- {os.path.basename(fp)} ---\n" + cleaned)

    body_code = "\n\n".join(combined_js)

    # 3. Create Userscript bundle
    escaped_css = json.dumps(mod_css)
    user_script_content = USER_SCRIPT_HEADER + f"""(function() {{
  'use strict';
  const MOD_STYLES = {escaped_css};

{body_code}

  startMod(MOD_STYLES);
}})();
"""
    user_script_path = os.path.join(DIST_DIR, "acheron-map-mod.user.js")
    with open(user_script_path, "w", encoding="utf-8") as f:
        f.write(user_script_content)
    print(f"[OK] Generated Userscript: {user_script_path}")

    # 4. Create Extension bundle
    # Extension loads styles.css via content_scripts, but passing it to startMod is also harmless
    ext_content_js = f"""(function() {{
  'use strict';

{body_code}

  startMod();
}})();
"""
    with open(os.path.join(EXT_DIST_DIR, "content.js"), "w", encoding="utf-8") as f:
        f.write(ext_content_js)

    with open(os.path.join(EXT_DIST_DIR, "styles.css"), "w", encoding="utf-8") as f:
        f.write(mod_css)

    # Copy manifest
    manifest_src = os.path.join(ROOT, "extension", "manifest.json")
    with open(manifest_src, "r", encoding="utf-8") as f:
        manifest_data = f.read()
    with open(os.path.join(EXT_DIST_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        f.write(manifest_data)

    # Generate icons
    for size in (16, 48, 128):
        icon_bytes = create_simple_png(size)
        icon_path = os.path.join(icons_dir, f"icon{size}.png")
        with open(icon_path, "wb") as f:
            f.write(icon_bytes)

    print(f"[OK] Generated Extension in: {EXT_DIST_DIR}")

if __name__ == "__main__":
    build()
