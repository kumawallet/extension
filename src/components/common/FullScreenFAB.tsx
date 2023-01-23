import { BsFullscreen } from "react-icons/bs";

export const FullScreenFAB = () => {
  const openTab = () => {
    const url = chrome.runtime.getURL("src/pages/newtab/index.html");
    chrome.tabs.create({ url });
  };

  return (
    <button
      className="fixed right-1 bottom-0 w-20 h-20 rounded-full drop-shadow-lg flex justify-center items-center"
      onClick={openTab}
    >
      <BsFullscreen />
    </button>
  );
};
