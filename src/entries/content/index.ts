import { Browser } from "@src/utils/constants";

function inject() {
  const file = chrome.runtime.getURL("src/entries/scripts/index.js");
  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file);
  document.body.append(script);
}

inject();

// read messages from injected object
// messages MUST have origin: "kuma" atribute
window.addEventListener("message", async function (e) {
  const data = e.data;
  if (data["origin"] === "kuma") {
    const response = await Browser.runtime.sendMessage(data);
    e.source?.postMessage(
      {
        response_method: data.method,
        data: response,
      },
      {
        targetOrigin: e.origin,
      }
    );
    return;
  }
});

Browser.runtime.onMessage.addListener((request) => {
  if (request.origin === "kuma") {
    if (request.method.endsWith("_response") && request.from === "bg") {
      window.postMessage({ ...request, from: "content" });
      return "";
    }
  }
});
