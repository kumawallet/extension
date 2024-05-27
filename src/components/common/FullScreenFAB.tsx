import { isInPopup } from "@src/utils/utils";
import { Maximize } from "@src/components/icons/Maximize"
import { Browser } from "@src/utils/constants";

export const FullScreenFAB = () => {
  const openTab = () => {
    const url = Browser.runtime.getURL("src/entries/newtab/index.html");
    Browser.tabs.create({ url });
  };

  if (!isInPopup()) return null

  return (
    <button data-testid="full-screen" onClick={openTab} className="hover:bg-gray-500 p-2">
      <Maximize size="50" color="#B0B0CE" />
    </button>
  );
};
