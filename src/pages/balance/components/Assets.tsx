import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MANAGE_ASSETS } from "@src/routes/paths";
import { useAssetContext } from "@src/providers";
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

  const [showAllAssets, setShowAllAssets] = useState(false);

  const filteredAsset = useMemo(() => {
    // @ts-expect-error --- *
    let _assets = [];

    const outputObject: {
      [key: string]: {
        balance: number;
        amount: number;
        symbol: string;
        decimals: number;
        id: string;
        accountKey: string;
      }[];
    } = {};

    if (Object.keys(assets).length !== 0) {
      Object.keys(assets).forEach((accountKey) => {
        const networks = assets[accountKey];
        Object.keys(networks).forEach((network) => {
          const assets = networks[network].assets;
          assets.forEach((asset) => {
            if (!outputObject[asset.symbol]) {
              outputObject[asset.symbol] = [];
            }
            // @ts-expect-error --- *
            outputObject[asset.symbol].push({ ...asset, accountKey });
          });
        });
      });


      _assets = Object.keys(outputObject).map((key) => {
        const asset = outputObject[key];

        const accountKeysInfo = {};

        asset.forEach((a) => {
          // @ts-expect-error --- *
          if (!accountKeysInfo[a.accountKey]) {
            // @ts-expect-error --- *

            accountKeysInfo[a.accountKey] = {
              balance: 0,
              amount: 0,
              symbol: a.symbol,
              decimals: a.decimals,
              id: a.id,
            };
          }

          // @ts-expect-error --- *
          accountKeysInfo[a.accountKey].balance += Number(a.balance);
          // @ts-expect-error --- *
          accountKeysInfo[a.accountKey].amount += Number(a.amount);
        });

        const balance = Object.values(accountKeysInfo).reduce((acc, _asset) => {
          // @ts-expect-error --- *
          return acc + Number(_asset.balance || 0);
        }, 0);

        const amount = Object.values(accountKeysInfo).reduce((acc, _asset) => {
          // @ts-expect-error --- *
          return acc + Number(_asset.amount || 0);
        }, 0);

        return {
          symbol: key,
          balance: formatAmountWithDecimals(
            balance as number,
            3,
            asset[0].decimals
          ),
          amount,
          decimals: asset[0].decimals,
          accounts: accountKeysInfo,
          id: asset[0].id,
        };
      });
    }

    // @ts-expect-error --- *
    _assets = _assets.sort((a, b) => {
      return b.balance - a.balance;
    });

    if (showAllAssets) return _assets;

    return _assets.filter((asset) => asset.id === "-1" || asset.balance !== 0);
  }, [JSON.stringify(assets), showAllAssets]);

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

      {filteredAsset.map((asset, index) => {
        return <Asset asset={asset} key={index} />;
      })}

      <div className="flex justify-center mt-2">
        <Button onClick={() => navigate(MANAGE_ASSETS)} variant="text">
          <span className="flex gap-1 items-center">
            <CgOptions />
            <span>{t("manage_assets")}</span>
          </span>
        </Button>
      </div>
    </div>
  );
};
