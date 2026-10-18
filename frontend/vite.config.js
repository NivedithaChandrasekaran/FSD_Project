import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '');
  const backendPort = env.PORT || '5000';
  const apiProxy = {
    '/api': {
      target: `http://127.0.0.1:${backendPort}`,
      changeOrigin: true,
    },
  };

  return {
    envDir: projectRoot,
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: apiProxy,
    },
    preview: {
      port: 4173,
      host: '0.0.0.0',
      proxy: apiProxy,
    },
  };
});
