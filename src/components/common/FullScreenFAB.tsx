import { getWebAPI } from "@src/utils/env";
import { isInPopup } from "@src/utils/utils";
import { BsFullscreen } from "react-icons/bs";

export const FullScreenFAB = () => {
  const openTab = () => {
    const API = getWebAPI()
    const url = API.runtime.getURL("src/entries/newtab/index.html");
    API.tabs.create({ url });
  };

  if (!isInPopup()) return null

  return (
    <button
      className="rounded-full drop-shadow-lg flex justify-center items-center"
      onClick={openTab}
    >
      <BsFullscreen />
    </button>
  );
};
