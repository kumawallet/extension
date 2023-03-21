import { useState, useMemo } from "react";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { ImCoinDollar } from "react-icons/im";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MANAGE_ASSETS } from "@src/routes/paths";
import { BsArrowUpRight } from "react-icons/bs";
import { Asset, useAssetContext } from "@src/providers/assetProvider";
import { useNetworkContext } from "@src/providers";
import { Loading } from "@src/components/common";

export const Assets = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();
  const {
    state: { type },
  } = useNetworkContext();
  const {
    state: { assets, isLoadingAssets },
  } = useAssetContext();

  const [showAllAssets, setShowAllAssets] = useState(false);

  const filteredAsset = useMemo(() => {
    let _assets: Asset[] = assets;

    if (!showAllAssets) {
      _assets = _assets.filter((asset) => {
        if (asset.id === "-1") return true;

        return asset.balance > 0;
      });
    }

    return _assets;
  }, [assets, showAllAssets]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center mb-2 justify-end">
        <input
          id="default-checkbox"
          type="checkbox"
          value=""
          className="w-4 h-4 rounded accent-custom-green-bg focus:ring-2 "
          checked={showAllAssets}
          onChange={() => setShowAllAssets(!showAllAssets)}
        />
        <label htmlFor="default-checkbox" className="ml-2 text-xs font-medium">
          {t("show_all_assets")}
        </label>
      </div>

      {isLoadingAssets && <Loading />}

      {filteredAsset.map((asset, index) => (
        <div
          key={index.toString()}
          className="bg-[#343A40] px-5 py-4 rounded-xl flex items-center justify-between font-inter"
        >
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 bg-black rounded-full" />
            <div className="flex gap-1 items-center">
              <p className="font-bold text-xl">
                {formatAmountWithDecimals(asset.balance, 6)}
              </p>
              <p className="tx-sm">{asset.symbol}</p>
            </div>
          </div>

          <a
            href="#"
            className="bg-none outline-none p-2 flex justify-center items-center hover:bg-custom-green-bg rounded-full"
          >
            <BsArrowUpRight size={23} className="" />
          </a>
        </div>
      ))}

      {type === "EVM" && (
        <div className="flex justify-center mt-2">
          <button
            className="flex gap-2 items-center text-gray-200 rounded-xl px-2 py-1 hover:bg-custom-green-bg hover:bg-opacity-30"
            onClick={() => navigate(MANAGE_ASSETS)}
          >
            <ImCoinDollar />
            <span>{t("manage_assets")}</span>
          </button>
        </div>
      )}
    </div>
  );
};
