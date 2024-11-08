import pkg from "../package.json";
import { isProduction } from "./utils/env";

const commonManifest = {
  name: pkg.displayName,
  content_scripts: [
    {
      matches: ["file://*/*", "http://*/*", "https://*/*"],
      run_at: "document_end",
      js: ["src/entries/content/index.js"],
    },
  ],
  icons: {
    "128": "icon-128.png",
  },
  description: pkg.description,
  permissions: [
    "storage",
    "activeTab",
    "tabs",
    "notifications",
  ] as chrome.runtime.ManifestPermissions[],
  version: pkg.version,
};

const BACKGROUND = "src/entries/background/index.js";
const ICON34 = "icon-34.png";
const SECURITY = "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'";
const POPUP = "src/entries/popup/index.html";

const manifestV3: chrome.runtime.ManifestV3 = {
  ...commonManifest,
  manifest_version: 3,
  background: {
    service_worker: BACKGROUND,
    type: "module",
  },
  action: {
    default_popup: POPUP,
    default_icon: ICON34,
  },
  ...(!isProduction && {
    chrome_url_overrides: {
      newtab: "src/entries/newtab/index.html",
    },
  }),
  web_accessible_resources: [
    {
      resources: ["src/entries/scripts/index.js"],
      matches: ["<all_urls>"],
    },
  ],
  content_security_policy: {
    extension_pages: SECURITY,
  },
};

export default manifestV3;
