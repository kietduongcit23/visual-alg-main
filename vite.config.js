import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
export default defineConfig({
    base: '/visual-alg-main/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                practice: resolve(__dirname, 'array-algorithms.html'),
                visualizer: resolve(__dirname, 'visualizer.html'),
            },
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
});
