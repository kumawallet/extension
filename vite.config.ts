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
import { isChrome } from "./src/utils/env";

const root = resolve(__dirname, "src");
const entriesDir = resolve(root, "entries");
const assetsDir = resolve(root, "assets");
const hookDir = resolve(root, "hooks");
const utilsDir = resolve(root, "utils");

const stylesDir = resolve(root, "styles");
const outDir = resolve(__dirname, `dist/${isChrome ? "chrome" : "firefox"}`);
const publicDir = resolve(__dirname, "public");

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

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      exclude: [
        ...(configDefaults.coverage.exclude as string[]),
        "**/src/tests/mocks/**",
        "**/src/constants/**",
        "**/src/storage/entities/activity/**",
        "**/src/storage/entities/registry/**",
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
    },
  },
  plugins: [react(), makeManifest(), copyContentStyle()],
  publicDir,
  build: {
    outDir,
    sourcemap: process.env.__DEV__ === "true",
    rollupOptions: {
      input: {
        devtools: resolve(entriesDir, "devtools", "index.html"),
        panel: resolve(entriesDir, "panel", "index.html"),
        content: resolve(entriesDir, "content", "index.ts"),
        background: resolve(entriesDir, "background", "index.ts"),
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
