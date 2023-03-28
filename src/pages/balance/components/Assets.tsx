import { useState, useMemo, useEffect } from "react";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { ImCoinDollar } from "react-icons/im";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MANAGE_ASSETS } from "@src/routes/paths";
import { BsArrowUpRight } from "react-icons/bs";
import { useAssetContext, useNetworkContext } from "@src/providers";
import { Loading } from "@src/components/common";
import { Switch } from "@headlessui/react";
import { ApiPromise } from "@polkadot/api";

export const Assets = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();
  const {
    state: { type, api, selectedChain },
  } = useNetworkContext();
  const {
    state: { assets, isLoadingAssets },
  } = useAssetContext();

  const [showAllAssets, setShowAllAssets] = useState(false);
  const [showManageAssets, setShowManageAssets] = useState(false);

  const filteredAsset = useMemo(() => {
    let _assets = [...assets];

    if (!showAllAssets) {
      _assets = _assets.filter((asset) => {
        if (asset.id === "-1") return true;

        return asset.balance > 0;
      });
    }

    return _assets;
  }, [assets, showAllAssets]);

  useEffect(() => {
    if (!type || !api) {
      setShowManageAssets(false);
      return;
    }

    if (type === "EVM") {
      setShowManageAssets(true);
    }

    if (type === "WASM" && (api as ApiPromise).query.contracts) {
      setShowManageAssets(true);
    }
  }, [type, api]);

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
              className={`${
                showAllAssets ? "bg-custom-green-bg" : "bg-custom-gray-bg"
              } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200`}
            >
              <span className="sr-only">{t("show_all_assets")}</span>
              <span
                className={`${
                  showAllAssets ? "translate-x-6" : "translate-x-1"
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200`}
              />
            </Switch>
          </div>
        </Switch.Group>
      </div>

      {isLoadingAssets && <Loading />}

      {filteredAsset.map((asset, index) => (
        <div
          key={index.toString()}
          className="bg-[#343A40] px-5 py-4 rounded-xl flex items-center justify-between font-inter"
        >
          <div className="flex gap-2 items-center">
            {asset.id === "-1" ? (
              <img
                src={`/images/${selectedChain.logo}.png`}
                width={24}
                height={24}
                className="object-cover rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-400 bg-opacity-40 rounded-full" />
            )}
            <div className="flex gap-1 items-center">
              <p className="font-bold text-xl">
                {formatAmountWithDecimals(
                  Number(asset.balance),
                  6,
                  asset.decimals
                )}
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

      {showManageAssets && (
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
