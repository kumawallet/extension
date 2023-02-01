import pkg from "../package.json";
import { isChrome } from "./utils/env";

const commonManifest = {
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  permissions: ["storage"] as chrome.runtime.ManifestPermissions[],
};

const BACKGROUND = "src/pages/background/index.js";
const ICON34 = "icon-34.png";
const ICON128 = "icon-128.png";
const SECURITY = "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'";
const POPUP = "src/pages/popup/index.html";

const manifestV3: chrome.runtime.ManifestV3 = {
  ...commonManifest,
  manifest_version: 3,
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: BACKGROUND,
    type: "module",
  },
  action: {
    default_popup: POPUP,
    default_icon: ICON34,
  },
  chrome_url_overrides: {
    newtab: "src/pages/newtab/index.html",
  },
  icons: {
    "128": ICON128,
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
    extension_pages: SECURITY,
  },
};

const manifestV2: chrome.runtime.ManifestV2 = {
  ...commonManifest,
  manifest_version: 2,
  browser_action: {
    default_popup: POPUP,
    default_title: "Open the popup",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      run_at: "document_end",
      js: ["src/pages/content/index.js"],
      css: ["contentStyle.css"],
    },
  ],
  background: {
    page: BACKGROUND,
    persistent: false,
  },
  icons: {
    "128": ICON128,
  },
  content_security_policy: SECURITY,
};

export default isChrome ? manifestV3 : manifestV2;
