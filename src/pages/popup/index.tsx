import { createRoot } from "react-dom/client";
import "@assets/styles/base.css";
import "@pages/popup/index.css";
import { Main } from "@src/main";

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(<Main />);
}

init();
