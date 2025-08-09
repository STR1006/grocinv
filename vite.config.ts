import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
// Updated for GitHub Pages deployment
export default defineConfig({
  base: "/grocinv/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
            },
          },
        ],
      },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "safari-pinned-tab.svg",
      ],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Gulu Inventory",
        short_name: "Gulu Inventory",
        description:
          "A grocery list app designed to make employees' jobs easier for stocking shelves",
        theme_color: "#0f766e",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/grocinv/",
        start_url: "/grocinv/",
        id: "/grocinv/",
        categories: ["productivity", "business"],
        screenshots: [],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      external: [],
    },
  },
});
