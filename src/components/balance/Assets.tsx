import { useEffect, useState } from "react";
import { useNetworkContext } from "../../providers/NetworkProvider";
import { getNatitveAssetBalance } from "../../utils/assets";
import { useAccountContext } from "../../providers/AccountProvider";
import { ApiPromise } from "@polkadot/api";
import { BsArrowUpRight } from "react-icons/bs";

export const Assets = () => {
  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (api && selectedAccount.value?.address) {
      getAssets(api);
    }
  }, [api, selectedAccount]);

  const getAssets = async (api: ApiPromise) => {
    const nativeAsset = await getNatitveAssetBalance(
      api,
      selectedAccount.value.address,
      selectedChain?.nativeCurrency.decimals || 1
    );
    setAssets([
      {
        ...selectedChain.nativeCurrency,
        amount: nativeAsset,
      },
    ]);
  };

  console.log("assets", assets);

  return (
    <>
      {assets.map((asset, index) => (
        <div
          key={index.toString()}
          className="bg-[#343A40] px-8 py-4 rounded-xl flex gap-2 items-center justify-between"
        >
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 bg-black rounded-full" />
            <div className="flex gap-1 text-xl">
              <p>{asset.amount}</p>
              <p>{asset.symbol}</p>
            </div>
          </div>

          <button className="bg-none outline-none rounded-full">
            <BsArrowUpRight
              size={23}
              className="hover:bg-custom-green-bg rounded-full"
            />
          </button>
        </div>
      ))}
    </>
  );
};
