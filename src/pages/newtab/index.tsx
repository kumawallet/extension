import { createRoot } from "react-dom/client";
import "@assets/styles/tailwind.css";
import { Main } from "@src/main";

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Newtab root element");
  const root = createRoot(rootContainer);
  root.render(<Main />);
}

init();
