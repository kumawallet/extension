import { useState, useMemo, useEffect } from "react";
import { ImCoinDollar } from "react-icons/im";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MANAGE_ASSETS } from "@src/routes/paths";
import {
  useAssetContext,
  useNetworkContext,
  useThemeContext,
} from "@src/providers";
import { Loading,  Button } from "@src/components/common";
import { Switch } from "@headlessui/react";
import { ApiPromise } from "@polkadot/api";
import { Asset }  from "./Asset";

export const Assets = () => {
  const { t } = useTranslation("balance");
  const { color } = useThemeContext();
  const navigate = useNavigate();
  const {
    state: { type, api },
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
                showAllAssets ? `bg-${color}-primary` : "bg-custom-gray-bg"
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
        <Asset asset={asset} key={index} />
      ))}

      {showManageAssets && (
        <div className="flex justify-center mt-2">
          <Button onClick={() => navigate(MANAGE_ASSETS)} variant="text">
            <span className="flex gap-1 items-center">
              <ImCoinDollar />
              <span>{t("manage_assets")}</span>
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};
