import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { ImCoinDollar } from "react-icons/im";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MANAGE_ASSETS, SEND } from "@src/routes/paths";
import { BsArrowUpRight } from "react-icons/bs";
import { useAssetContext, useNetworkContext } from "@src/providers";
import { Loading, AssetIcon } from "@src/components/common";
import { Popover, Switch, Transition } from "@headlessui/react";
import { ApiPromise } from "@polkadot/api";
import { formatUSDAmount } from "@src/utils/assets";
import { BN } from "@polkadot/util";

const timeoutDuration = 120;

export const Assets = () => {
  const { t } = useTranslation("balance");
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

  const triggerRef = useRef();
  const timeOutRef = useRef();

  const handleEnter = (isOpen: boolean) => {
    clearTimeout(timeOutRef.current);
    !isOpen && triggerRef.current?.click();
  };

  const handleLeave = (isOpen: boolean) => {
    timeOutRef.current = setTimeout(() => {
      isOpen && triggerRef.current?.click();
    }, timeoutDuration);
  };

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
        <Popover key={index}>
          {({ open }) => (
            <div
              onMouseEnter={() => handleEnter(open)}
              onMouseLeave={() => handleLeave(open)}
            >
              <Popover.Button
                ref={triggerRef}
                className="bg-[#343A40] px-2 py-2 rounded-2xl  font-inter w-full outline-none"
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <AssetIcon asset={asset} width={32} />
                    <div className="flex flex-col">
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
                      <div className="text-xs text-gray-400 text-start">
                        {formatUSDAmount(asset.amount || 0)}
                      </div>
                    </div>
                  </div>

                  <a
                    href="#"
                    className="bg-none outline-none p-2 flex justify-center items-center hover:bg-custom-green-bg rounded-full"
                  >
                    <BsArrowUpRight size={23} onClick={() => navigate(SEND)} />
                  </a>
                </div>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel
                  static={true}
                  className="absolute left-1/2 z-50 mt-3 -translate-x-1/2 transform px-4"
                >
                  <div className="bg-[#343A40] shadow-lg px-10 py-5 rounded-2xl flex flex-col gap-2 font-inter">
                    <p>
                      {t("transferable")}:{" "}
                      {formatAmountWithDecimals(
                        Number(asset.transferable),
                        6,
                        asset.decimals
                      )}
                    </p>

                    {asset.reserved && !(asset.reserved as BN).isZero() && (
                      <p>
                        {t("reserved")}:{" "}
                        {formatAmountWithDecimals(
                          Number(asset.reserved),
                          6,
                          asset.decimals
                        )}
                      </p>
                    )}

                    {asset.frozen && !(asset.frozen as BN).isZero() && (
                      <p>
                        {t("frozen")}:{" "}
                        {formatAmountWithDecimals(
                          Number(asset.frozen),
                          6,
                          asset.decimals
                        )}
                      </p>
                    )}
                  </div>
                </Popover.Panel>
              </Transition>
            </div>
          )}
        </Popover>
      ))}

      {showManageAssets && (
        <div className="flex justify-center mt-2">
          <button
            className="flex gap-1 items-center text-gray-200 rounded-xl px-2 py-1 hover:bg-custom-green-bg hover:bg-opacity-30"
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
