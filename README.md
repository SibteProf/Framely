<p align="center">
  <img src="assets/icon.png" width="96" height="96" alt="Framely icon" />
</p>

<h1 align="center">Framely</h1>

<p align="center">
  Crop and frame your photos to the exact size every platform wants,<br/>
  so nothing gets cut off, ever again.
</p>

Framely is a small React Native (Expo) app for cropping and resizing photos to fit specific social platforms (Instagram, TikTok, X, YouTube, Facebook, LinkedIn, and WhatsApp), so you don't have to guess dimensions or lose part of the shot.

## Features

- **Platform presets** with the real target ratio and export resolution for each (Instagram Feed/Portrait/Story, TikTok, X post, YouTube thumbnail, Facebook cover, LinkedIn post, WhatsApp profile picture/status), shown as live cropped previews of your own photo.
- **Two crop modes**: fill the frame (pinch to zoom, drag to reposition) or keep the full photo with a blurred, cover-fit copy of the same image filling the letterboxed edges.
- **Filters**: Original, Mono, Vivid, Warm, Cool, Fade, applied live via Skia color matrices.
- **Export at true resolution** (e.g. 1080&times;1080 for an Instagram post), not just a screenshot of the on-screen preview, then save to your photo library or share directly.

## Tech stack

- [Expo](https://expo.dev) (managed workflow) + TypeScript
- [`@shopify/react-native-skia`](https://shopify.github.io/react-native-skia/) for the crop canvas, filters, and export rendering
- `react-native-gesture-handler` + `react-native-reanimated` for pinch/pan
- `expo-image-picker`, `expo-media-library`, `expo-sharing`, `expo-file-system` for picking, saving, and sharing photos

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your phone (iOS or Android). No native build or dev client required.

## Project structure

```
App.tsx                     # entry point, font loading, screen switch
src/
  screens/
    HomeScreen.tsx           # landing screen, photo picker
    EditScreen.tsx           # preset picker, crop canvas, filters, export
  components/
    CropCanvas.tsx           # Skia canvas: crop, pan/zoom, blur-fit, export snapshot
    PresetChip.tsx           # platform preset card with live thumbnail
    FilterThumb.tsx          # filter preview thumbnail
  constants/
    presets.ts               # platform crop ratios and export dimensions
    filters.ts                # Skia color matrices for each filter
  theme.ts                   # colors, spacing, type scale
scripts/
  generate-icons.js          # regenerates the app icon set from one SVG source
```

## Building

The app is configured for [EAS Build](https://docs.expo.dev/build/introduction/) with `development`, `preview`, and `production` profiles in [`eas.json`](eas.json):

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Android permissions are scoped to photo library access only (no camera or microphone), configured via the `expo-image-picker` and `expo-media-library` plugin options in `app.json`.

## License

MIT, see [`LICENSE`](LICENSE).
