import { FooterIcon } from "@src/pages/balance/components/FooterIcon";
import { getWebAPI } from "@src/utils/env";
import { isInPopup } from "@src/utils/utils";
import { BiExpandAlt } from "react-icons/bi";

export const FullScreenFAB = () => {
  const openTab = () => {
    const API = getWebAPI()
    const url = API.runtime.getURL("src/entries/newtab/index.html");
    API.tabs.create({ url });
  };

  if (!isInPopup()) return null

  return (
    <FooterIcon
      icon={BiExpandAlt}
      onClick={openTab}
    />
  );
};
