import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MANAGE_ASSETS } from "@src/routes/paths";
import {
  useAssetContext,
} from "@src/providers";
import { Loading, Button } from "@src/components/common";
import { Switch } from "@headlessui/react";
import { Asset } from "./Asset";
import { CgOptions } from "react-icons/cg";
import { formatAmountWithDecimals } from "@src/utils/assets";

export const Assets = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();
  const {
    state: { assets, isLoadingAssets },
  } = useAssetContext();

  const [showAllAssets, setShowAllAssets] = useState(true);
  const [showManageAssets, setShowManageAssets] = useState(false);

  const filteredAsset = useMemo(() => {
    console.log(assets, "AASSSSSSSSSSEEEEEYTTTTTTTTTSSSSSSSSSSSs")
    const a = Object.values(assets).flatMap(asset => {
      return Object.values(asset).flatMap(subasset => {
        console.log("sub", subasset)
        console.log(formatAmountWithDecimals(
          Number(subasset.assets[0].balance),
          6,
          subasset.assets[0].decimals
        ), "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo", subasset.assets[0],subasset.assets[0])
        return subasset.assets
      });
    }
    )
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", a, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
 return a} , [JSON.stringify(assets),showAllAssets]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center mb-2 justify-end">
        <Switch.Group>
          <div className="flex items-center">
            <Switch.Label className="mr-2 text-xs font-medium">
              {t("show_all_assets")}
            </Switch.Label>
            <Switch
              checked={showAllAssets}
              onChange={() => setShowAllAssets(!showAllAssets)}
              className={`${showAllAssets ? `bg-primary-default` : "bg-custom-gray-bg"
                } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200`}
            >
              <span className="sr-only">{t("show_all_assets")}</span>
              <span
                className={`${showAllAssets ? "translate-x-6" : "translate-x-1"
                  } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200`}
              />
            </Switch>
          </div>
        </Switch.Group>
      </div>

      {isLoadingAssets && <Loading />}

      {
      filteredAsset && filteredAsset?.length !==0 && filteredAsset.map((asset, index) =>{
        console.log("sgerf ewgfgvhfhwegfgehwfghfg", asset)
        return (
        
        <Asset asset={asset} key={index} />
      )})}

      {showManageAssets && (
        <div className="flex justify-center mt-2">
          <Button onClick={() => navigate(MANAGE_ASSETS)} variant="text">
            <span className="flex gap-1 items-center">
              <CgOptions />
              <span>{t("manage_assets")}</span>
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};
