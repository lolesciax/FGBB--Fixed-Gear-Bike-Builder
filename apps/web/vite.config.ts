import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), tailwind(), VitePWA({ registerType: 'prompt', includeAssets: ['icon.svg', 'offline.html', 'icons/*.png'], manifest: { name: 'TrackLab — Fixed Gear Workshop', short_name: 'TrackLab', description: 'Your next ride, built by you.', theme_color: '#294f40', background_color: '#f5f5f2', display: 'standalone', start_url: '/', icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }] }, workbox: {
    navigateFallback: null,
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    // Offline navigation needs only the fallback and icons. Never precache 3D or private data.
    globPatterns: ['offline.html', 'icon.svg', 'icons/*.png'],
    runtimeCaching: [{
      urlPattern: ({ request, sameOrigin, url }) => !!sameOrigin && request.mode === 'navigate' && !url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      options: { precacheFallback: { fallbackURL: '/offline.html' } },
    }],
  } })],
  server: { host: '127.0.0.1', port: Number(process.env.TRACKLAB_WEB_PORT || 5180), strictPort: true, proxy: { '/api': process.env.TRACKLAB_API_PROXY || 'http://127.0.0.1:4000' } },
  preview: { host: '127.0.0.1', port: Number(process.env.TRACKLAB_WEB_PORT || 5180), strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
});
