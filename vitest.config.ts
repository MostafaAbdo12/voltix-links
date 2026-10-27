import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'path';

// Tests write real rows, so they must run against a separate database (e.g. a Neon "test" branch),
// configured as TEST_DATABASE_URL in .env.test. Refuse to run against the production database.
const env = loadEnv('test', process.cwd(), '');
const testDbUrl = env.TEST_DATABASE_URL;
if (!testDbUrl) {
  throw new Error('TEST_DATABASE_URL is missing. Put the test database URL in .env.test (see .env.example).');
}
if (testDbUrl === env.DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL must not be the same as DATABASE_URL (production).');
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 20000,
    env: {
      DATABASE_URL: testDbUrl,
      DIRECT_URL: env.TEST_DIRECT_URL || testDbUrl,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
