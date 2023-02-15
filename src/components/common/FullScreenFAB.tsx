import { BsFullscreen } from "react-icons/bs";

export const FullScreenFAB = () => {
  const openTab = () => {
    const url = chrome.runtime.getURL("src/entries/newtab/index.html");
    chrome.tabs.create({ url });
  };

  return (
    <button
      className="rounded-full drop-shadow-lg flex justify-center items-center"
      onClick={openTab}
    >
      <BsFullscreen />
    </button>
  );
};
