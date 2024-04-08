import { FooterIcon } from "@src/pages/balance/components/FooterIcon";
import { getWebAPI } from "@src/utils/env";
import { isInPopup } from "@src/utils/utils";
import { BiExpandAlt } from "react-icons/bi";
import { Maximize } from "@src/components/icons/Maximize"

export const FullScreenFAB = () => {
  const openTab = () => {
    const API = getWebAPI()
    const url = API.runtime.getURL("src/entries/newtab/index.html");
    API.tabs.create({ url });
  };

  if (!isInPopup()) return null

  return (
    <button onClick={openTab}>
      <Maximize size="50" color="#B0B0CE"/>
    </button>
  );
};
