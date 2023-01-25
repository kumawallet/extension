import pkg from "../package.json";
import { ManifestTypeV2, ManifestTypeV3 } from "@src/manifest-type";

const isChrome = process.env.BROWSER_TARGET === "CHROME";

const manifestV3: ManifestTypeV3 = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icon-34.png",
  },
  chrome_url_overrides: {
    newtab: "src/pages/newtab/index.html",
  },
  icons: {
    "128": "icon-128.png",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      css: ["contentStyle.css"],
    },
  ],
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: ["contentStyle.css", "icon-128.png", "icon-34.png"],
      matches: [],
    },
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
  permissions: [
    "storage",
    "activeTab", // REVIEW: Is this needed?
    "tabs", // REVIEW: Is this needed?
  ],
};

const manifestV2: ManifestTypeV2 = {
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  manifest_version: 2,
  browser_action: {
    default_popup: "src/pages/popup/index.html",
    default_title: "Open the popup",
  },
  optional_permissions: ["<all_urls>"],
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      run_at: "document_end",
      js: ["src/pages/content/index.js"],
      css: ["contentStyle.css"],
    },
  ],
  background: {
    page: "src/pages/background/index.js",
    persistent: false,
  },
  icons: {
    "128": "vite.svg",
  },
};

export default isChrome ? manifestV3 : manifestV2;
