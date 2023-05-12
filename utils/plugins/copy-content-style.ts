import * as path from "path";
import colorLog from "../log";
import { PluginOption } from "vite";

const { resolve } = path;

const root = resolve(__dirname, "..", "..");

export default function copyContentStyle(): PluginOption {
  return {
    name: "make-manifest",
    buildEnd() {
      colorLog("contentStyle copied", "success");
    },
  };
}
