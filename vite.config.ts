import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Three.js / R3F are only reached through dynamic imports (the hero scene and
// the below-the-fold views), so Rollup splits them out of the initial bundle.
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1400 },
});
