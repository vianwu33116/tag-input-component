import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["__tests__/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["**/*.test.js"],
      exclude: ["node_modules/", "__tests__/setup.js", "**/*.test.js"],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});

// import { defineConfig } from 'vite';

// export default defineConfig({
//   test: {
//     environment: 'jsdom',
//   },
// });
