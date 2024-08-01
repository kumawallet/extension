/* eslint-disable @typescript-eslint/ban-ts-comment */
/// <reference types="vitest" />

import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import makeManifest from "./utils/plugins/make-manifest";
import copyContentStyle from "./utils/plugins/copy-content-style";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import rollupNodePolyFill from "rollup-plugin-polyfill-node";
import { isChrome, isProduction } from "./src/utils/env";
import { loadEnv } from "vite";
import wasm from 'vite-plugin-wasm';

const root = resolve(__dirname, "src");
const entriesDir = resolve(root, "entries");
const assetsDir = resolve(root, "assets");
const hookDir = resolve(root, "hooks");
const utilsDir = resolve(root, "utils");
const stylesDir = resolve(root, "styles");
const outDir = resolve(__dirname, `dist/${isChrome ? "chrome" : "firefox"}`);
const publicDir = resolve(__dirname, "public");

if (isProduction) {
  console.log(`
   __    __                                          __       __            __  __              __
  /  |  /  |                                        /  |  _  /  |          /  |/  |            /  |
  $$ | /$$/  __    __  _____  ____    ______        $$ | / \\ $$ |  ______  $$ |$$ |  ______   _$$ |_
  $$ |/$$/  /  |  /  |/     \\\\/    \\  /     \\       $$ |/$  \\$$ | /      \\ $$ |$$ | /      \\ / $$   |
  $$  $$<   $$ |  $$ |$$$$$$ $$$$  | $$$$$$  |      $$ /$$$  $$ | $$$$$$  |$$ |$$ |/$$$$$$  |$$$$$$/
  $$$$$  \\  $$ |  $$ |$$ | $$ | $$ | /    $$ |      $$ $$/$$ $$ | /    $$ |$$ |$$ |$$    $$ |  $$ | __
  $$ |$$  \\ $$ \\__$$ |$$ | $$ | $$ |/$$$$$$$ |      $$$$/  $$$$ |/$$$$$$$ |$$ |$$ |$$$$$$$$/   $$ |/  |
  $$ | $$  |$$    $$/ $$ | $$ | $$ |$$    $$ |      $$$/    $$$ |$$    $$ |$$ |$$ |$$       |  $$  $$/
  $$/   $$/  $$$$$$/  $$/  $$/  $$/  $$$$$$$/       $$/      $$/  $$$$$$$/ $$/ $$/  $$$$$$$/    $$$$/
  `);
}

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    define: {
      "process.env": JSON.stringify({
        EXTENSION_PREFIX: env.VITE_EXTENSION_PREFIX || "kuma",
        PORT_PREFIX: env.VITE_PORT_PREFIX || "kuma",
      }),
    },
    test: {
      fileParallelism: false,
      css: false,
      globals: true,
      environment: "happy-dom",
      setupFiles: "src/tests/setup.ts",
      coverage: {
        reporter: ["text", "html", "lcov", "text-summary"],
        exclude: [
          ...(configDefaults.coverage.exclude as string[]),
          "**/src/tests/mocks/**",
          "**/src/constants/**",
          "**/src/routes/**",
          "**/src/components/common/**",
          "**/src/xcm/**",
          "**/utils/**",
          "**/src/entries/**",
          "**/tailwind.config.cjs",
          "**/postcss.config.cjs",
          "**/src/main.tsx",
          "**/src/manifest.ts",
          "**/src/components/wrapper/*",
          "**/src/pages/index.ts",
          "**/src/pages/callContract/**",
          "**/src/pages/swap/**",
          "**/**/index.ts",
          "**/src/components/ui/**",
          "**/src/components/icons/**",
          "**/src/messageAPI/**",
          "**/src/pages/styles/**",
          "**/src/pages/settings/components/ManageNetworks.tsx",
          "**/src/pages/signMessage/**",
        ],
      },
    },
    resolve: {
      alias: {
        "@src": root,
        "@assets": assetsDir,
        "@entries": entriesDir,
        "@styles": stylesDir,
        "@hooks": hookDir,
        "@utils": utilsDir,
        buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
      },
    },
    plugins: [react(), makeManifest(), copyContentStyle(),wasm()],
    publicDir,
    build: {
      chunkSizeWarningLimit: 1000,
      outDir,
      target: "esnext",
      // sourcemap: process.env.__DEV__ === "true",
      rollupOptions: {
        input: {
          devtools: resolve(entriesDir, "devtools", "index.html"),
          panel: resolve(entriesDir, "panel", "index.html"),
          content: resolve(entriesDir, "content", "index.ts"),
          background: isChrome
            ? resolve(entriesDir, "background", "index.ts")
            : resolve(entriesDir, "background", "index.html"),
          popup: resolve(entriesDir, "popup", "index.html"),
          newtab: resolve(entriesDir, "newtab", "index.html"),
          options: resolve(entriesDir, "options", "index.html"),
          scripts: resolve(entriesDir, "scripts", "contentScript.ts"),
        },
        output: {
          entryFileNames: (chunk) => `src/entries/${chunk.name}/index.js`,
        },
        plugins: [rollupNodePolyFill()],
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: true,
          }),
          NodeModulesPolyfillPlugin(),
          
        ],
      },
      
    },
  });
};
