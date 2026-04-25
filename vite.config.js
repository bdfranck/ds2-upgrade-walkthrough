import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/ds2-upgrade-walkthrough/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
