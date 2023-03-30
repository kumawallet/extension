const isChrome = navigator.userAgent.match(/chrome|chromium|crios/i);

export type Browser = typeof chrome | typeof window.browser;

export const useExtension = () => {
  const extension = isChrome ? chrome : window.browser;

  const sendNotification = (title: string, message: string) => {
    extension.notifications.create("", {
      title,
      message,
      type: "basic",
      iconUrl: chrome.runtime.getURL("icon-128.png"),
    });
  };

  return { extension, sendNotification };
};
