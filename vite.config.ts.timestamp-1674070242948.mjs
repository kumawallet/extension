// vite.config.ts
import { defineConfig } from "file:///home/r/Desktop/blockcoders/cross-chain-wallet/node_modules/vite/dist/node/index.js";
import react from "file:///home/r/Desktop/blockcoders/cross-chain-wallet/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve as resolve3 } from "path";

// utils/plugins/make-manifest.ts
import * as fs from "fs";
import * as path from "path";

// utils/log.ts
function colorLog(message, type) {
  let color = type || COLORS.FgBlack;
  switch (type) {
    case "success":
      color = COLORS.FgGreen;
      break;
    case "info":
      color = COLORS.FgBlue;
      break;
    case "error":
      color = COLORS.FgRed;
      break;
    case "warning":
      color = COLORS.FgYellow;
      break;
  }
  console.log(color, message);
}
var COLORS = {
  Reset: "\x1B[0m",
  Bright: "\x1B[1m",
  Dim: "\x1B[2m",
  Underscore: "\x1B[4m",
  Blink: "\x1B[5m",
  Reverse: "\x1B[7m",
  Hidden: "\x1B[8m",
  FgBlack: "\x1B[30m",
  FgRed: "\x1B[31m",
  FgGreen: "\x1B[32m",
  FgYellow: "\x1B[33m",
  FgBlue: "\x1B[34m",
  FgMagenta: "\x1B[35m",
  FgCyan: "\x1B[36m",
  FgWhite: "\x1B[37m",
  BgBlack: "\x1B[40m",
  BgRed: "\x1B[41m",
  BgGreen: "\x1B[42m",
  BgYellow: "\x1B[43m",
  BgBlue: "\x1B[44m",
  BgMagenta: "\x1B[45m",
  BgCyan: "\x1B[46m",
  BgWhite: "\x1B[47m"
};

// package.json
var package_default = {
  name: "cross-chain-wallet",
  displayName: "Cross-Chain Wallet",
  version: "1.0.0",
  description: "This wallet is a cross-chain wallet that allows users to manage and transfer tokens between EVM and WASM chains. Built with the user experience in mind, the wallet is elegant and intuitive. It is the only wallet on the market capable of making this type of transfer without using an external platform.",
  license: "MIT",
  repository: {
    type: "git",
    url: "https://github.com/blockcoders/cross-chain-wallet.git"
  },
  scripts: {
    build: "tsc --noEmit && vite build",
    dev: "nodemon"
  },
  type: "module",
  dependencies: {
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^4.7.1",
    wouter: "^2.10.0-alpha.4"
  },
  devDependencies: {
    "@types/chrome": "^0.0.208",
    "@types/node": "^18.11.18",
    "@types/react": "^18.0.26",
    "@types/react-dom": "^18.0.10",
    "@typescript-eslint/eslint-plugin": "^5.48.2",
    "@typescript-eslint/parser": "^5.48.2",
    "@vitejs/plugin-react": "^3.0.1",
    autoprefixer: "^10.4.13",
    eslint: "^8.32.0",
    "eslint-config-prettier": "^8.6.0",
    "eslint-plugin-import": "^2.27.5",
    "eslint-plugin-jsx-a11y": "^6.7.1",
    "eslint-plugin-react": "^7.32.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "fs-extra": "^11.1.0",
    nodemon: "^2.0.18",
    postcss: "^8.4.21",
    tailwindcss: "^3.2.4",
    "ts-node": "^10.9.1",
    typescript: "^4.9.4",
    vite: "^4.0.4"
  }
};

// src/manifest.ts
var manifest = {
  manifest_version: 3,
  name: package_default.displayName,
  version: package_default.version,
  description: package_default.description,
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module"
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icon-34.png"
  },
  chrome_url_overrides: {
    newtab: "src/pages/newtab/index.html"
  },
  icons: {
    "128": "icon-128.png"
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      css: ["contentStyle.css"]
    }
  ],
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: ["contentStyle.css", "icon-128.png", "icon-34.png"],
      matches: []
    }
  ]
};
var manifest_default = manifest;

// utils/plugins/make-manifest.ts
var __vite_injected_original_dirname = "/home/r/Desktop/blockcoders/cross-chain-wallet/utils/plugins";
var { resolve } = path;
var outDir = resolve(__vite_injected_original_dirname, "..", "..", "public");
function makeManifest() {
  return {
    name: "make-manifest",
    buildEnd() {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
      }
      const manifestPath = resolve(outDir, "manifest.json");
      fs.writeFileSync(manifestPath, JSON.stringify(manifest_default, null, 2));
      colorLog(`Manifest file copy complete: ${manifestPath}`, "success");
    }
  };
}

// utils/plugins/copy-content-style.ts
import * as fs2 from "fs";
import * as path2 from "path";
var __vite_injected_original_dirname2 = "/home/r/Desktop/blockcoders/cross-chain-wallet/utils/plugins";
var { resolve: resolve2 } = path2;
var root = resolve2(__vite_injected_original_dirname2, "..", "..");
var contentStyle = resolve2(root, "src", "pages", "content", "style.css");
var outDir2 = resolve2(__vite_injected_original_dirname2, "..", "..", "public");
function copyContentStyle() {
  return {
    name: "make-manifest",
    buildEnd() {
      fs2.copyFileSync(contentStyle, resolve2(outDir2, "contentStyle.css"));
      colorLog("contentStyle copied", "success");
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname3 = "/home/r/Desktop/blockcoders/cross-chain-wallet";
var root2 = resolve3(__vite_injected_original_dirname3, "src");
var pagesDir = resolve3(root2, "pages");
var assetsDir = resolve3(root2, "assets");
var stylesDir = resolve3(root2, "styles");
var outDir3 = resolve3(__vite_injected_original_dirname3, "dist");
var publicDir = resolve3(__vite_injected_original_dirname3, "public");
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@src": root2,
      "@assets": assetsDir,
      "@pages": pagesDir,
      "@styles": stylesDir
    }
  },
  plugins: [react(), makeManifest(), copyContentStyle()],
  publicDir,
  build: {
    outDir: outDir3,
    sourcemap: process.env.__DEV__ === "true",
    rollupOptions: {
      input: {
        devtools: resolve3(pagesDir, "devtools", "index.html"),
        panel: resolve3(pagesDir, "panel", "index.html"),
        content: resolve3(pagesDir, "content", "index.ts"),
        background: resolve3(pagesDir, "background", "index.ts"),
        popup: resolve3(pagesDir, "popup", "index.html"),
        newtab: resolve3(pagesDir, "newtab", "index.html"),
        options: resolve3(pagesDir, "options", "index.html")
      },
      output: {
        entryFileNames: (chunk) => `src/pages/${chunk.name}/index.js`
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidXRpbHMvcGx1Z2lucy9tYWtlLW1hbmlmZXN0LnRzIiwgInV0aWxzL2xvZy50cyIsICJwYWNrYWdlLmpzb24iLCAic3JjL21hbmlmZXN0LnRzIiwgInV0aWxzL3BsdWdpbnMvY29weS1jb250ZW50LXN0eWxlLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvci9EZXNrdG9wL2Jsb2NrY29kZXJzL2Nyb3NzLWNoYWluLXdhbGxldFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvci9EZXNrdG9wL2Jsb2NrY29kZXJzL2Nyb3NzLWNoYWluLXdhbGxldC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9yL0Rlc2t0b3AvYmxvY2tjb2RlcnMvY3Jvc3MtY2hhaW4td2FsbGV0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IG1ha2VNYW5pZmVzdCBmcm9tIFwiLi91dGlscy9wbHVnaW5zL21ha2UtbWFuaWZlc3RcIjtcbmltcG9ydCBjb3B5Q29udGVudFN0eWxlIGZyb20gXCIuL3V0aWxzL3BsdWdpbnMvY29weS1jb250ZW50LXN0eWxlXCI7XG5cbmNvbnN0IHJvb3QgPSByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIik7XG5jb25zdCBwYWdlc0RpciA9IHJlc29sdmUocm9vdCwgXCJwYWdlc1wiKTtcbmNvbnN0IGFzc2V0c0RpciA9IHJlc29sdmUocm9vdCwgXCJhc3NldHNcIik7XG5jb25zdCBzdHlsZXNEaXIgPSByZXNvbHZlKHJvb3QsIFwic3R5bGVzXCIpO1xuY29uc3Qgb3V0RGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsIFwiZGlzdFwiKTtcbmNvbnN0IHB1YmxpY0RpciA9IHJlc29sdmUoX19kaXJuYW1lLCBcInB1YmxpY1wiKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBzcmNcIjogcm9vdCxcbiAgICAgIFwiQGFzc2V0c1wiOiBhc3NldHNEaXIsXG4gICAgICBcIkBwYWdlc1wiOiBwYWdlc0RpcixcbiAgICAgIFwiQHN0eWxlc1wiOiBzdHlsZXNEaXIsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW3JlYWN0KCksIG1ha2VNYW5pZmVzdCgpLCBjb3B5Q29udGVudFN0eWxlKCldLFxuICBwdWJsaWNEaXIsXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyLFxuICAgIHNvdXJjZW1hcDogcHJvY2Vzcy5lbnYuX19ERVZfXyA9PT0gXCJ0cnVlXCIsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IHtcbiAgICAgICAgZGV2dG9vbHM6IHJlc29sdmUocGFnZXNEaXIsIFwiZGV2dG9vbHNcIiwgXCJpbmRleC5odG1sXCIpLFxuICAgICAgICBwYW5lbDogcmVzb2x2ZShwYWdlc0RpciwgXCJwYW5lbFwiLCBcImluZGV4Lmh0bWxcIiksXG4gICAgICAgIGNvbnRlbnQ6IHJlc29sdmUocGFnZXNEaXIsIFwiY29udGVudFwiLCBcImluZGV4LnRzXCIpLFxuICAgICAgICBiYWNrZ3JvdW5kOiByZXNvbHZlKHBhZ2VzRGlyLCBcImJhY2tncm91bmRcIiwgXCJpbmRleC50c1wiKSxcbiAgICAgICAgcG9wdXA6IHJlc29sdmUocGFnZXNEaXIsIFwicG9wdXBcIiwgXCJpbmRleC5odG1sXCIpLFxuICAgICAgICBuZXd0YWI6IHJlc29sdmUocGFnZXNEaXIsIFwibmV3dGFiXCIsIFwiaW5kZXguaHRtbFwiKSxcbiAgICAgICAgb3B0aW9uczogcmVzb2x2ZShwYWdlc0RpciwgXCJvcHRpb25zXCIsIFwiaW5kZXguaHRtbFwiKSxcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IChjaHVuaykgPT4gYHNyYy9wYWdlcy8ke2NodW5rLm5hbWV9L2luZGV4LmpzYCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9yL0Rlc2t0b3AvYmxvY2tjb2RlcnMvY3Jvc3MtY2hhaW4td2FsbGV0L3V0aWxzL3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3IvRGVza3RvcC9ibG9ja2NvZGVycy9jcm9zcy1jaGFpbi13YWxsZXQvdXRpbHMvcGx1Z2lucy9tYWtlLW1hbmlmZXN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3IvRGVza3RvcC9ibG9ja2NvZGVycy9jcm9zcy1jaGFpbi13YWxsZXQvdXRpbHMvcGx1Z2lucy9tYWtlLW1hbmlmZXN0LnRzXCI7aW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBjb2xvckxvZyBmcm9tICcuLi9sb2cnO1xuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4uLy4uL3NyYy9tYW5pZmVzdCc7XG5pbXBvcnQgeyBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcblxuY29uc3QgeyByZXNvbHZlIH0gPSBwYXRoO1xuXG5jb25zdCBvdXREaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJywgJ3B1YmxpYycpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYWtlTWFuaWZlc3QoKTogUGx1Z2luT3B0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnbWFrZS1tYW5pZmVzdCcsXG4gICAgYnVpbGRFbmQoKSB7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob3V0RGlyKSkge1xuICAgICAgICBmcy5ta2RpclN5bmMob3V0RGlyKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWFuaWZlc3RQYXRoID0gcmVzb2x2ZShvdXREaXIsICdtYW5pZmVzdC5qc29uJyk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMobWFuaWZlc3RQYXRoLCBKU09OLnN0cmluZ2lmeShtYW5pZmVzdCwgbnVsbCwgMikpO1xuXG4gICAgICBjb2xvckxvZyhgTWFuaWZlc3QgZmlsZSBjb3B5IGNvbXBsZXRlOiAke21hbmlmZXN0UGF0aH1gLCAnc3VjY2VzcycpO1xuICAgIH0sXG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3IvRGVza3RvcC9ibG9ja2NvZGVycy9jcm9zcy1jaGFpbi13YWxsZXQvdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3IvRGVza3RvcC9ibG9ja2NvZGVycy9jcm9zcy1jaGFpbi13YWxsZXQvdXRpbHMvbG9nLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3IvRGVza3RvcC9ibG9ja2NvZGVycy9jcm9zcy1jaGFpbi13YWxsZXQvdXRpbHMvbG9nLnRzXCI7dHlwZSBDb2xvclR5cGUgPSAnc3VjY2VzcycgfCAnaW5mbycgfCAnZXJyb3InIHwgJ3dhcm5pbmcnIHwga2V5b2YgdHlwZW9mIENPTE9SUztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29sb3JMb2cobWVzc2FnZTogc3RyaW5nLCB0eXBlPzogQ29sb3JUeXBlKSB7XG4gIGxldCBjb2xvcjogc3RyaW5nID0gdHlwZSB8fCBDT0xPUlMuRmdCbGFjaztcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdzdWNjZXNzJzpcbiAgICAgIGNvbG9yID0gQ09MT1JTLkZnR3JlZW47XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIGNvbG9yID0gQ09MT1JTLkZnQmx1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgIGNvbG9yID0gQ09MT1JTLkZnUmVkO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnd2FybmluZyc6XG4gICAgICBjb2xvciA9IENPTE9SUy5GZ1llbGxvdztcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgY29uc29sZS5sb2coY29sb3IsIG1lc3NhZ2UpO1xufVxuXG5jb25zdCBDT0xPUlMgPSB7XG4gIFJlc2V0OiAnXFx4MWJbMG0nLFxuICBCcmlnaHQ6ICdcXHgxYlsxbScsXG4gIERpbTogJ1xceDFiWzJtJyxcbiAgVW5kZXJzY29yZTogJ1xceDFiWzRtJyxcbiAgQmxpbms6ICdcXHgxYls1bScsXG4gIFJldmVyc2U6ICdcXHgxYls3bScsXG4gIEhpZGRlbjogJ1xceDFiWzhtJyxcbiAgRmdCbGFjazogJ1xceDFiWzMwbScsXG4gIEZnUmVkOiAnXFx4MWJbMzFtJyxcbiAgRmdHcmVlbjogJ1xceDFiWzMybScsXG4gIEZnWWVsbG93OiAnXFx4MWJbMzNtJyxcbiAgRmdCbHVlOiAnXFx4MWJbMzRtJyxcbiAgRmdNYWdlbnRhOiAnXFx4MWJbMzVtJyxcbiAgRmdDeWFuOiAnXFx4MWJbMzZtJyxcbiAgRmdXaGl0ZTogJ1xceDFiWzM3bScsXG4gIEJnQmxhY2s6ICdcXHgxYls0MG0nLFxuICBCZ1JlZDogJ1xceDFiWzQxbScsXG4gIEJnR3JlZW46ICdcXHgxYls0Mm0nLFxuICBCZ1llbGxvdzogJ1xceDFiWzQzbScsXG4gIEJnQmx1ZTogJ1xceDFiWzQ0bScsXG4gIEJnTWFnZW50YTogJ1xceDFiWzQ1bScsXG4gIEJnQ3lhbjogJ1xceDFiWzQ2bScsXG4gIEJnV2hpdGU6ICdcXHgxYls0N20nLFxufSBhcyBjb25zdDtcbiIsICJ7XG4gIFwibmFtZVwiOiBcImNyb3NzLWNoYWluLXdhbGxldFwiLFxuICBcImRpc3BsYXlOYW1lXCI6IFwiQ3Jvc3MtQ2hhaW4gV2FsbGV0XCIsXG4gIFwidmVyc2lvblwiOiBcIjEuMC4wXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJUaGlzIHdhbGxldCBpcyBhIGNyb3NzLWNoYWluIHdhbGxldCB0aGF0IGFsbG93cyB1c2VycyB0byBtYW5hZ2UgYW5kIHRyYW5zZmVyIHRva2VucyBiZXR3ZWVuIEVWTSBhbmQgV0FTTSBjaGFpbnMuIEJ1aWx0IHdpdGggdGhlIHVzZXIgZXhwZXJpZW5jZSBpbiBtaW5kLCB0aGUgd2FsbGV0IGlzIGVsZWdhbnQgYW5kIGludHVpdGl2ZS4gSXQgaXMgdGhlIG9ubHkgd2FsbGV0IG9uIHRoZSBtYXJrZXQgY2FwYWJsZSBvZiBtYWtpbmcgdGhpcyB0eXBlIG9mIHRyYW5zZmVyIHdpdGhvdXQgdXNpbmcgYW4gZXh0ZXJuYWwgcGxhdGZvcm0uXCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2Jsb2NrY29kZXJzL2Nyb3NzLWNoYWluLXdhbGxldC5naXRcIlxuICB9LFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwiYnVpbGRcIjogXCJ0c2MgLS1ub0VtaXQgJiYgdml0ZSBidWlsZFwiLFxuICAgIFwiZGV2XCI6IFwibm9kZW1vblwiXG4gIH0sXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJyZWFjdFwiOiBcIl4xOC4yLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIl4xOC4yLjBcIixcbiAgICBcInJlYWN0LWljb25zXCI6IFwiXjQuNy4xXCIsXG4gICAgXCJ3b3V0ZXJcIjogXCJeMi4xMC4wLWFscGhhLjRcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdHlwZXMvY2hyb21lXCI6IFwiXjAuMC4yMDhcIixcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwiXjE4LjExLjE4XCIsXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMC4yNlwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4wLjEwXCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl41LjQ4LjJcIixcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXJcIjogXCJeNS40OC4yXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiOiBcIl4zLjAuMVwiLFxuICAgIFwiYXV0b3ByZWZpeGVyXCI6IFwiXjEwLjQuMTNcIixcbiAgICBcImVzbGludFwiOiBcIl44LjMyLjBcIixcbiAgICBcImVzbGludC1jb25maWctcHJldHRpZXJcIjogXCJeOC42LjBcIixcbiAgICBcImVzbGludC1wbHVnaW4taW1wb3J0XCI6IFwiXjIuMjcuNVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1qc3gtYTExeVwiOiBcIl42LjcuMVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1yZWFjdFwiOiBcIl43LjMyLjFcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3QtaG9va3NcIjogXCJeNC42LjBcIixcbiAgICBcImZzLWV4dHJhXCI6IFwiXjExLjEuMFwiLFxuICAgIFwibm9kZW1vblwiOiBcIl4yLjAuMThcIixcbiAgICBcInBvc3Rjc3NcIjogXCJeOC40LjIxXCIsXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl4zLjIuNFwiLFxuICAgIFwidHMtbm9kZVwiOiBcIl4xMC45LjFcIixcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNC45LjRcIixcbiAgICBcInZpdGVcIjogXCJeNC4wLjRcIlxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3IvRGVza3RvcC9ibG9ja2NvZGVycy9jcm9zcy1jaGFpbi13YWxsZXQvc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9yL0Rlc2t0b3AvYmxvY2tjb2RlcnMvY3Jvc3MtY2hhaW4td2FsbGV0L3NyYy9tYW5pZmVzdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9yL0Rlc2t0b3AvYmxvY2tjb2RlcnMvY3Jvc3MtY2hhaW4td2FsbGV0L3NyYy9tYW5pZmVzdC50c1wiO2ltcG9ydCBwa2cgZnJvbSAnLi4vcGFja2FnZS5qc29uJztcbmltcG9ydCB7IE1hbmlmZXN0VHlwZSB9IGZyb20gJ0BzcmMvbWFuaWZlc3QtdHlwZSc7XG5cbmNvbnN0IG1hbmlmZXN0OiBNYW5pZmVzdFR5cGUgPSB7XG4gIG1hbmlmZXN0X3ZlcnNpb246IDMsXG4gIG5hbWU6IHBrZy5kaXNwbGF5TmFtZSxcbiAgdmVyc2lvbjogcGtnLnZlcnNpb24sXG4gIGRlc2NyaXB0aW9uOiBwa2cuZGVzY3JpcHRpb24sXG4gIG9wdGlvbnNfcGFnZTogJ3NyYy9wYWdlcy9vcHRpb25zL2luZGV4Lmh0bWwnLFxuICBiYWNrZ3JvdW5kOiB7XG4gICAgc2VydmljZV93b3JrZXI6ICdzcmMvcGFnZXMvYmFja2dyb3VuZC9pbmRleC5qcycsXG4gICAgdHlwZTogJ21vZHVsZScsXG4gIH0sXG4gIGFjdGlvbjoge1xuICAgIGRlZmF1bHRfcG9wdXA6ICdzcmMvcGFnZXMvcG9wdXAvaW5kZXguaHRtbCcsXG4gICAgZGVmYXVsdF9pY29uOiAnaWNvbi0zNC5wbmcnLFxuICB9LFxuICBjaHJvbWVfdXJsX292ZXJyaWRlczoge1xuICAgIG5ld3RhYjogJ3NyYy9wYWdlcy9uZXd0YWIvaW5kZXguaHRtbCcsXG4gIH0sXG4gIGljb25zOiB7XG4gICAgXCIxMjhcIjogJ2ljb24tMTI4LnBuZycsXG4gIH0sXG4gIGNvbnRlbnRfc2NyaXB0czogW1xuICAgIHtcbiAgICAgIG1hdGNoZXM6IFsnaHR0cDovLyovKicsICdodHRwczovLyovKicsICc8YWxsX3VybHM+J10sXG4gICAgICBqczogWydzcmMvcGFnZXMvY29udGVudC9pbmRleC5qcyddLFxuICAgICAgY3NzOiBbJ2NvbnRlbnRTdHlsZS5jc3MnXSxcbiAgICB9LFxuICBdLFxuICBkZXZ0b29sc19wYWdlOiAnc3JjL3BhZ2VzL2RldnRvb2xzL2luZGV4Lmh0bWwnLFxuICB3ZWJfYWNjZXNzaWJsZV9yZXNvdXJjZXM6IFtcbiAgICB7XG4gICAgICByZXNvdXJjZXM6IFsnY29udGVudFN0eWxlLmNzcycsICdpY29uLTEyOC5wbmcnLCAnaWNvbi0zNC5wbmcnXSxcbiAgICAgIG1hdGNoZXM6IFtdLFxuICAgIH0sXG4gIF0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBtYW5pZmVzdDtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvci9EZXNrdG9wL2Jsb2NrY29kZXJzL2Nyb3NzLWNoYWluLXdhbGxldC91dGlscy9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9yL0Rlc2t0b3AvYmxvY2tjb2RlcnMvY3Jvc3MtY2hhaW4td2FsbGV0L3V0aWxzL3BsdWdpbnMvY29weS1jb250ZW50LXN0eWxlLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3IvRGVza3RvcC9ibG9ja2NvZGVycy9jcm9zcy1jaGFpbi13YWxsZXQvdXRpbHMvcGx1Z2lucy9jb3B5LWNvbnRlbnQtc3R5bGUudHNcIjtpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGNvbG9yTG9nIGZyb20gJy4uL2xvZyc7XG5pbXBvcnQgeyBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcblxuY29uc3QgeyByZXNvbHZlIH0gPSBwYXRoO1xuXG5jb25zdCByb290ID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICcuLicpO1xuY29uc3QgY29udGVudFN0eWxlID0gcmVzb2x2ZShyb290LCAnc3JjJywgJ3BhZ2VzJywgJ2NvbnRlbnQnLCAnc3R5bGUuY3NzJyk7XG5jb25zdCBvdXREaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJywgJ3B1YmxpYycpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb3B5Q29udGVudFN0eWxlKCk6IFBsdWdpbk9wdGlvbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ21ha2UtbWFuaWZlc3QnLFxuICAgIGJ1aWxkRW5kKCkge1xuICAgICAgZnMuY29weUZpbGVTeW5jKGNvbnRlbnRTdHlsZSwgcmVzb2x2ZShvdXREaXIsICdjb250ZW50U3R5bGUuY3NzJykpO1xuXG4gICAgICBjb2xvckxvZygnY29udGVudFN0eWxlIGNvcGllZCcsICdzdWNjZXNzJyk7XG4gICAgfSxcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFQsU0FBUyxvQkFBb0I7QUFDelYsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsV0FBQUEsZ0JBQWU7OztBQ0ZrVixZQUFZLFFBQVE7QUFDOVgsWUFBWSxVQUFVOzs7QUNDUCxTQUFSLFNBQTBCLFNBQWlCLE1BQWtCO0FBQ2xFLE1BQUksUUFBZ0IsUUFBUSxPQUFPO0FBRW5DLFVBQVEsTUFBTTtBQUFBLElBQ1osS0FBSztBQUNILGNBQVEsT0FBTztBQUNmO0FBQUEsSUFDRixLQUFLO0FBQ0gsY0FBUSxPQUFPO0FBQ2Y7QUFBQSxJQUNGLEtBQUs7QUFDSCxjQUFRLE9BQU87QUFDZjtBQUFBLElBQ0YsS0FBSztBQUNILGNBQVEsT0FBTztBQUNmO0FBQUEsRUFDSjtBQUVBLFVBQVEsSUFBSSxPQUFPLE9BQU87QUFDNUI7QUFFQSxJQUFNLFNBQVM7QUFBQSxFQUNiLE9BQU87QUFBQSxFQUNQLFFBQVE7QUFBQSxFQUNSLEtBQUs7QUFBQSxFQUNMLFlB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QSxFQUNyRDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBQUc7QUFBQSxJQUNBLFdBQVcsUUFBUSxJQUFJLFlBQVk7QUFBQSxJQUNuQyxlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxVQUFVRixTQUFRLFVBQVUsWUFBWSxZQUFZO0FBQUEsUUFDcEQsT0FBT0EsU0FBUSxVQUFVLFNBQVMsWUFBWTtBQUFBLFFBQzlDLFNBQVNBLFNBQVEsVUFBVSxXQUFXLFVBQVU7QUFBQSxRQUNoRCxZQUFZQSxTQUFRLFVBQVUsY0FBYyxVQUFVO0FBQUEsUUFDdEQsT0FBT0EsU0FBUSxVQUFVLFNBQVMsWUFBWTtBQUFBLFFBQzlDLFFBQVFBLFNBQVEsVUFBVSxVQUFVLFlBQVk7QUFBQSxRQUNoRCxTQUFTQSxTQUFRLFVBQVUsV0FBVyxZQUFZO0FBQUEsTUFDcEQ7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLGdCQUFnQixDQUFDLFVBQVUsYUFBYSxNQUFNO0FBQUEsTUFDaEQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInJlc29sdmUiLCAiZnMiLCAicGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJyZXNvbHZlIiwgInBhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAib3V0RGlyIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgInJvb3QiLCAicmVzb2x2ZSIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJvdXREaXIiXQp9Cg==
