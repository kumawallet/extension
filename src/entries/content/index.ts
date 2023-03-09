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
    const response = await chrome.runtime.sendMessage(data);
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
    // switch (data.method) {
    //   case "sign_message": {
    //     const response = await chrome.runtime.sendMessage(data);
    //     e.source?.postMessage(
    //       {
    //         response_method: data.method,
    //         data: response,
    //       },
    //       {
    //         targetOrigin: e.origin,
    //       }
    //     );
    //     return;
    //   }
    //   // case "get_account_info": {
    //   //   const response = await chrome.runtime.sendMessage(e.data);
    //   //   e.source?.postMessage(
    //   //     {
    //   //       response_method: data.method,
    //   //       data: response,
    //   //     },
    //   //     {
    //   //       targetOrigin: e.origin,
    //   //     }
    //   //   );
    //   //   return;
    //   // }
    //   default:
    //     break;
    // }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.origin === "kuma") {
    // console.log("content listener", request);
    if (request.method.endsWith("_response") && request.from === "bg") {
      // console.log(request);
      window.postMessage({ ...request, from: "content" });
      return "";
    }

    // switch (request.method) {
    //   case "sign_message_response":
    //     window.postMessage(request);
    //     return "";
    //     break;

    //   default:
    //     break;
    // }
  }
});
