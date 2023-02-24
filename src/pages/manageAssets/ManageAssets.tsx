import { Loading, LoadingButton, PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAccountContext } from "@src/providers/accountProvider/AccountProvider";
import { useEffect, useState } from "react";
import { useToast } from "@src/hooks";
import { useNetworkContext } from "@src/providers/networkProvider/NetworkProvider";
import { ApiPromise } from "@polkadot/api";
import { u8aToString } from "@polkadot/util";

type assetId = string | number;
type accountId32 = string;

type MetadaObject = {
  entries: () => Promise<any>;
};

// TODO: move to global instance?
interface AssetPallet {
  account: (assetId: assetId, accountId32: accountId32) => Promise<any>;
  asset: (assetId?: assetId) => null | object;
  metadata: ((assetId: assetId) => Promise<any>) | MetadaObject;
}

export const ManageAssets = () => {
  const { t } = useTranslation("manage_assets");
  const {
    state: { api, selectedChain },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const navigate = useNavigate();
  const { showErrorToast } = useToast();
  const isEVM = selectedAccount.type.includes("EVM");

  const [chainSupportAsset, setchainSupportAsset] = useState(false);
  const [loading, setIsLoading] = useState(true);
  const [assetPallet, setAssetPallet] = useState<null | AssetPallet>(null);
  const [search, setSearch] = useState("");
  const [assetToSelect, setAssetToSelect] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    if (!isEVM) {
      loadPolkadotAssets();
    }
  }, []);

  const loadPolkadotAssets = async () => {
    try {
      const assetPallet = await (api as ApiPromise)?.query?.assets;
      console.log(assetPallet);
      if (!assetPallet) {
        setchainSupportAsset(false);
        return;
      }

      setAssetPallet(assetPallet);
      setchainSupportAsset(true);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchPolkadotAsset = async () => {
    if (!search) {
      const assets = await (assetPallet?.metadata as MetadaObject).entries();
      setAssetToSelect(
        assets.map(
          ([
            {
              args: [id],
            },
            asset,
          ]) => {
            return {
              id: Number(id),
              name: u8aToString(asset?.name),
              symbol: u8aToString(asset?.symbol),
              decimals: Number(asset?.decimals),
            };
          }
        )
      );
    } else {
      const assetMetadata = await assetPallet?.metadata(search);
    }
    setSelectedAsset(null);
  };

  const addAsset = () => {
    console.log("TODO: call method to save asset");
  };

  return (
    <>
      <PageWrapper>
        <div className="flex gap-3 items-center mb-7">
          <BiLeftArrowAlt
            size={26}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <p className="text-xl">{t("title")}</p>
        </div>
        <div className="py-12">
          {loading && <Loading />}
          {!loading && !chainSupportAsset && (
            <p>
              {t("this_chain_only_support_native_asset")}{" "}
              {selectedChain?.nativeCurrency.name || ""}
            </p>
          )}
          {!loading && chainSupportAsset && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                {t("search_asset")}
              </label>
              <input
                className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
                value={search}
                onChange={({ target }) => setSearch(target.value)}
                onKeyDown={({ key }) =>
                  key === "Enter" && searchPolkadotAsset()
                }
              />
              <div className="flex flex-col gap-4">
                {assetToSelect.map((asset) => (
                  <button
                    className={`flex flex-col px-2 py-1 rounded-xl ${
                      asset?.id === selectedAsset?.id &&
                      "bg-custom-green-bg bg-opacity-40"
                    } hover:bg-custom-green-bg hover:bg-opacity-40`}
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <span>{asset.name}</span>
                    <span>Symbol: {asset.symbol}</span>
                    <span>decimals: {asset.decimals}</span>
                    <span>id: {asset.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
      <footer className="fixed bottom-0 left-0 right-0 py-2 bg-[#343A40] px-2 flex justify-center w-full">
        <LoadingButton isDisabled={!selectedAsset} onClick={addAsset}>
          Add Asset
        </LoadingButton>
      </footer>
    </>
  );
};
