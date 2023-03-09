import { makeQuerys } from "@src/utils/utils";
import Extension from "../../Extension";

const openPopUp = (params: any) => {
  const querys = makeQuerys(params);

  // console.log(querys);

  return chrome.windows.create({
    url: chrome.runtime.getURL(`src/entries/popup/index.html${querys}`),
    type: "popup",
    top: 0,
    left: 0,
    width: 357,
    height: 600,
    focused: true,
  });
};

// read messages from content
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.origin === "kuma") {
    // console.log("bg listener", request);

    try {
      switch (request.method) {
        case "sign_message": {
          await openPopUp({ ...request, tabId: sender.tab?.id });
          return;
        }

        case "sign_message_response": {
          if (request.from !== "popup") return;
          await chrome.tabs.sendMessage(Number(request.toTabId), {
            ...request,
            from: "bg",
          });
          if (request.fromWindowId)
            await chrome.windows.remove(request.fromWindowId as number);

          return;
        }

        case "get_account_info": {
          getSelectedAccount().then(sendResponse).catch(sendResponse);
          return;
        }

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      await chrome.tabs.sendMessage(Number(request.toTabId), {
        ...{
          ...request,
          method: `${request.method}_response`,
        },
        from: "bg",
        error,
      });
      return error;
    }

    return true;
  }
});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "sign_message") {
    port.onDisconnect.addListener(async function (port) {
      const queries = port.sender?.url?.split("?")[1];
      const { tabId, origin, method } = Object.fromEntries(
        new URLSearchParams(queries)
      );
      await chrome.tabs.sendMessage(Number(tabId), {
        origin,
        method: `${method}_response`,
        response: null,
        from: "bg",
      });
    });
  }
});

const getSelectedAccount = () => {
  return Extension.getSelectedAccount();
};
