# Emotion Detector (React + face-api.js)

A clean, working starter for real‑time facial **emotion detection** using `face-api.js`, with webcam video, canvas overlay, and a small UI.

## Quick Start

```bash
# 1) install
npm i
# or: yarn

# 2) fetch model files (~2–6 MB)
npm run postinstall
# or run manually:
node scripts/download-models.js

# 3) dev
npm run dev
```

Open the printed local URL and allow camera access.

## Project Layout

- `src/components/EmotionDetector.jsx` — webcam + detection loop + overlay
- `src/lib/loadModels.js` — loads models from `/public/models`
- `public/models/` — model JSON + shard files
- `scripts/download-models.js` — downloads pre-trained models
- Vite + React 18 scaffold

## Notes

- Uses **TinyFaceDetector** for speed + **68 landmarks** + **expression** models.
- If models fail to download (network/firewall), manually download from:<br>
  https://vladmandic.github.io/face-api/model/<br>
  and place all files into `public/models/`.
- If you see a CORS error, ensure you run via `vite` dev server (`npm run dev`) instead of `file://`.
