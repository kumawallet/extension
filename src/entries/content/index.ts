function inject() {
  const file = chrome.runtime.getURL("src/entries/scripts/index.js");

  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file);
  document.body.append(script);
}

inject();

window.addEventListener("message", async function (e) {
  console.log("content", e);

  // if (e.data["from"] === "signed_tab") {
  //   chrome.windows.remove(-2);
  // }

  if (e.data["from"] === "kuma") {
    const response = await chrome.runtime.sendMessage(e.data);

    // console.log("content", response);
    // console.log(e);
    e.source?.postMessage(
      {
        to: e.data["method"],
        ...response,
      },
      {
        targetOrigin: e.origin,
      }
    );
  }
});
