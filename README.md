# SonicFlow Music — iPhone Home Screen PWA

This is a web app that can be hosted over HTTPS and added to an iPhone Home Screen. It is **not** a native iOS app and does not need App Store/TestFlight.

## Features
- Online playback from a direct audio URL (MP3/M4A/AAC and browser-supported formats)
- Select local audio files using the iPhone file picker
- Favorites saved in browser storage
- Seek, previous/next and play/pause
- PWA app shell cached for repeat visits while offline
- Uses the standard HTML audio element and Media Session API where available to improve background/Lock Screen playback

## Important iPhone limitations
- Background audio is best-effort in a Home Screen web app and depends on iOS version, format, hosting, and the source server. Test on the target iPhone.
- Local files selected from Files are not permanently imported into the app's private storage. If the page is closed/reloaded, select them again.
- The service worker caches the app shell, not the music streams. This starter does not provide permanent offline downloads.
- A direct audio URL must point to an audio file/stream and allow access (CORS is not always required for playback, but host restrictions can still prevent playback). YouTube page URLs are not direct audio URLs.
- Use only music you have permission to play or distribute.

## Deploy without a computer
1. Upload these files to a GitHub repository using Safari or the GitHub app/site.
2. In GitHub, open **Settings → Pages**.
3. Under build/deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. Wait for the HTTPS Pages URL to appear.
5. Open that HTTPS URL in Safari on your iPhone.
6. Tap **Share → Add to Home Screen**. If shown, enable **Open as Web App**, then tap **Add**.
7. Open SonicFlow from the new Home Screen icon. Start a track while online, then test Home Screen switching and screen lock.

If GitHub Pages doesn't build the PWA manifest icons because the PNG icons are absent, the SVG icon still works in supported browsers; for maximum compatibility, add 192x192 and 512x512 PNG icons named `icon-192.png` and `icon-512.png`.

## Local preview
Serve the folder from an HTTPS host or a local web server. Service workers generally do not run from `file://`.
