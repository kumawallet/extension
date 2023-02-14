import { createRoot } from "react-dom/client";
import "@src/base.css";
import { Main } from "@src/main";

// function init() {
//   const rootContainer = document.querySelector("#__root");
//   if (!rootContainer) throw new Error("Can't find Newtab root element");
//   const root = createRoot(rootContainer);
//   root.render(<Main />);
// }

// init();

// refreshOnUpdate("pages/content/components/Demo");

const root = document.createElement("div");
root.id = "chrome-extension-boilerplate-react-vite-content-view-root";
document.body.append(root);

createRoot(root).render(<Main />);
