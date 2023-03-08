import Extension from "../../Extension";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("message in background", {
    request,
    sender,
  });

  if (request.from === "signed_tab") {
    chrome.windows.remove(request.id);

    return;
  }

  chrome.windows.create({
    // tabId: 1,
    url: chrome.runtime.getURL("src/entries/popup/index.html?query=1"),
    type: "popup",
    top: 0,
    left: 0,
    width: 357,
    height: 600,
  });
  // if (request)
  // getSelectedAccount()
  //   .then((res) => sendResponse({ account: res }))
  //   .catch((err) => {
  //     console.log("extension error");
  //     sendResponse({ err: String(err) });
  //   });
  return true;
});

const getSelectedAccount = () => {
  return Extension.getSelectedAccount();
};
