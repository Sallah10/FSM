import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    // Embedded PGlite migrations can take >10s on a cold Windows run.
    hookTimeout: 30_000,
    testTimeout: 20_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd()),
    },
  },
});
