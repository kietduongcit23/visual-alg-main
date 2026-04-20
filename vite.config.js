import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                practice: resolve(__dirname, 'array-algorithms.html'),
            },
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
});
