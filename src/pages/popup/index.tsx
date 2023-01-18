import { createRoot } from "react-dom/client";
import "@pages/popup/index.css";
import "@assets/styles/tailwind.css";
import { Routes } from "@src/routes";

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(<Routes />);
}

init();
