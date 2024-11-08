import pkg from "../../package.json";

export const isProduction = process.env.NODE_ENV === "production";
export const version = pkg.version || "0.0.0";

export const getWebAPI: () => typeof window.chrome = () =>
  navigator.userAgent.match(/chrome|chromium|crios/i) ? chrome : window.browser;
