import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@mediapipe/hands/*.{binarypb,tflite,wasm}",
          dest: "mediapipe/hands",
        },
        {
          src: "node_modules/@mediapipe/hands/hands.js",
          dest: "mediapipe/hands",
        },
        {
          src: "node_modules/@mediapipe/camera_utils/camera_utils.js",
          dest: "mediapipe/camera_utils",
        },
      ],
      watch: {
        reloadPageOnChange: true
      }
    }),
  ],
  server: {
    port: 5173,
    open: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
