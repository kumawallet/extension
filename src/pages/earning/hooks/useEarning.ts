import { MUMBAI_TESTNET } from "@src/constants/chains";
import { useToast } from "@src/hooks";
import { useNetworkContext } from "@src/providers";
import { Framework } from "@superfluid-finance/sdk-core";
import { useEffect, useState } from "react";
import { EarningAssets } from "../utils/assets-per-chain";
// import Extension from "@src/Extension";

const SUPPORTED_CHAINS = [MUMBAI_TESTNET.name];

interface Asset {
  image?: string;
  label: string;
}

export const useEarning = () => {
  const {
    state: { selectedChain, api: provider },
  } = useNetworkContext();

  const { showErrorToast } = useToast();

  const [assetsToSell, setAssetsToSell] = useState<Asset[]>([]);
  const [assetsToBuy, setAssetsToBuy] = useState<Asset[]>([]);

  const [selectedAssetToSell, setSelectedAssetToSell] = useState<Asset>({
    label: "",
  });
  const [selectedAssetToBuy, setSelectedAssetToBuy] = useState<Asset>({
    label: "",
  });
  const [paisAssets, setPairAssets] = useState<any>({});

  const [amount, setAmount] = useState<string>("");

  const init = async () => {
    try {
      const getChainAssets = EarningAssets[selectedChain?.name];

      if (!getChainAssets) return;

      const { assets, assetPairs } = getChainAssets;

      const firstAsset = assets[0];

      setPairAssets(assetPairs);

      setAssetsToSell(assets.map((asset) => ({ label: asset })));
      setSelectedAssetToSell({ label: firstAsset });

      const assetsToBuy = assetPairs[firstAsset];
      setAssetsToBuy(assetsToBuy.map((asset) => ({ label: asset })));
      setSelectedAssetToBuy({ label: assetsToBuy[0] });
    } catch (error) {
      showErrorToast(error);
    }
  };

  const createSwap = async () => {
    try {
      if (!amount) return;

      const sf = await Framework.create({
        chainId: 80001,
        provider,
      });

      const token = await sf.loadSuperToken("DAIx");

      // const privateKey = await Extension.showKey();

      // const signer = sf.createSigner({
      //   privateKey,
      //   provider,
      // });

      // const flowOperation = (await token).createFlow({
      //   sender: await signer.getAddress(),
      //   receiver: EarningAssets[selectedChain?.name].contractAddress,
      //   flowRate: amount,
      // });

      // console.log("flowOperation", flowOperation);
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    if (!SUPPORTED_CHAINS.includes(selectedChain?.name)) return;

    init();
  }, [selectedChain]);

  useEffect(() => {
    if (!selectedAssetToSell) return;

    const assetToBuy = paisAssets[selectedAssetToSell.label];

    if (!assetToBuy) return;

    setAssetsToBuy(assetToBuy.map((asset: string) => ({ label: asset })));
    setSelectedAssetToBuy({ label: assetToBuy[0] });
  }, [selectedAssetToSell, paisAssets]);

  return {
    assetsToSell,
    assetsToBuy,
    selectedAssetToBuy,
    setSelectedAssetToBuy,
    selectedAssetToSell,
    setSelectedAssetToSell,
    amount,
    setAmount,
    createSwap,
  };
};
