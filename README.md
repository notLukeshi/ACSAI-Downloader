# ACSAI Downloader

A sleek, modern browser extension that finds downloadable attachments on supported pages, lets you select them, and downloads them as a single ZIP.

## Requirements
- Node.js 18+ (or 20+ recommended)
- npm 9+

## Install and Build
```bash
npm ci
npm run build
```
This produces a `dist/` folder with the MV3 extension bundle.

## Load the extension

### Chrome (and Chromium-based)
1. Open `chrome://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `dist/` folder.

### Microsoft Edge
1. Open `edge://extensions`.
2. Enable "Developer mode" (toggle in the left pane).
3. Click "Load unpacked" and select the `dist/` folder.

### Firefox (Temporary add-on)
1. Open `about:debugging#/runtime/this-firefox`.
2. Click "Load Temporary Add-on".
3. Pick the `dist/manifest.json` file.

Notes:
- Firefox temporary add-ons unload on browser restart. Repeat the steps to reload.
- This project uses Manifest V3 with a background service worker.

## Development tips
- `npm run dev` starts Vite's dev server for rapid UI iteration, but the extension itself must be loaded from the built `dist/` output.
- When you change code, rebuild with `npm run build`, then refresh the extension in your browser's extensions page.

## Permissions rationale
- `activeTab` and `scripting`: to read the current page DOM and inject the content script that discovers attachments.
- `downloads`: to save the generated ZIP file to your machine.

## Security & privacy
- No analytics or telemetry.
- No personal data is collected or transmitted.

## License
This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
