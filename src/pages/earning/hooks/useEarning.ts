import { MUMBAI_TESTNET } from "@src/constants/chains";
import { useLoading, useToast } from "@src/hooks";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { Framework } from "@superfluid-finance/sdk-core";
import { useEffect, useState } from "react";
import { ASSETS_INFO, EarningAssets } from "../utils/assets-per-chain";
import Extension from "@src/Extension";
import { BigNumber, ethers, utils } from "ethers";
import { useLocation } from "react-router-dom";
import { useDialog } from "@src/hooks/common/useDialog";
import { cfaABI } from "@src/pages/earningDetail";

const SUPPORTED_CHAINS = [MUMBAI_TESTNET.name];

const FRECUENCIES = [
  {
    label: "Daily",
    value: "daily",
  },
  {
    label: "Weekly",
    value: "weekly",
  },
  {
    label: "Monthly",
    value: "monthly",
  },
];

const HOURS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24,
];

interface Asset {
  image?: string;
  label: string;
}

const getFrecuencyToSeconds = (frecuency: string) => {
  switch (frecuency) {
    case "daily":
      return 86400;
    case "weekly":
      return 604800;
    case "monthly":
      return 2629756;
    default:
      return 86400;
  }
};

export const useEarning = () => {
  const { state } = useLocation();

  const {
    state: { selectedChain, api: provider },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { showErrorToast, showSuccessToast } = useToast();
  const { isLoading, starLoading, endLoading } = useLoading();
  const {
    isLoading: isLoadingActiveSwaps,
    starLoading: starLoadingActiveSwaps,
    endLoading: endLoadingActiveSwaps,
  } = useLoading();
  const { isOpen, openDialog, closeDialog } = useDialog();

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
  const [activeSwaps, setActiveSwaps] = useState<any[]>([]);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState<string>("0");

  const [estimatedFee, setEstimatedFee] = useState<string>("0");

  const [frecuency, setFrecuency] = useState({
    frecuency: FRECUENCIES[0].value,
    howManyDays: "",
    selectedDayManually: false,
    hour: HOURS[9],
  });

  const init = async () => {
    try {
      const getChainAssets = EarningAssets[selectedChain?.name];

      if (!getChainAssets) return;

      const { assets, assetPairs } = getChainAssets;

      const firstAsset = state?.token
        ? assets.find((asset) => asset === state?.token) || assets[0]
        : assets[0];

      setPairAssets(assetPairs);

      const image = ASSETS_INFO[firstAsset].image;

      setAssetsToSell(
        assets.map((asset) => ({
          label: asset,
          image: ASSETS_INFO[asset].image,
        }))
      );
      setSelectedAssetToSell({
        label: firstAsset,
        image,
      });

      const assetsToBuy = assetPairs[firstAsset];
      setAssetsToBuy(
        assetsToBuy.map((asset) => ({
          label: asset,
          image: ASSETS_INFO[asset].image,
        }))
      );
      setSelectedAssetToBuy({
        label: assetsToBuy[0],
        image: ASSETS_INFO[assetsToBuy[0]].image,
      });

      loadActiveSwaps(assets);
    } catch (error) {
      showErrorToast(error);
    }
  };

  const loadActiveSwaps = async (assetNames: string[]) => {
    starLoadingActiveSwaps();
    try {
      const sf = await Framework.create({
        chainId: 80001,
        provider,
      });

      const assets = await Promise.all(
        assetNames.map(async (assetName) => sf.loadSuperToken(assetName))
      );

      let activeFlows = await Promise.all(
        assets.map((asset) =>
          asset.getAccountFlowInfo({
            account: selectedAccount.value.address,
            providerOrSigner: provider,
          })
        )
      );

      activeFlows = activeFlows.map((flow, index) => ({
        ...flow,
        asset: assetNames[index],
        st: assets[index],
      }));

      const activesFlowsToSave = activeFlows.filter(
        (flow) => flow.flowRate !== "0"
      );

      setActiveSwaps(activesFlowsToSave);
    } catch (error) {
      showErrorToast(error);
    }
    endLoadingActiveSwaps();
  };

  const selectedAssetIsInActiveSwaps = activeSwaps.some(
    (swap) => swap.asset === selectedAssetToSell.label
  );

  const handleSwap = async () => {
    if (!amount) return;

    starLoading();

    openDialog();

    try {
      // estimated fee

      const pk = await Extension.showKey();

      const wallet = new ethers.Wallet(
        pk as string,
        provider as ethers.providers.JsonRpcProvider
      );

      const bnAmount = utils.parseEther(amount);
      const frecuencyInSeconds = getFrecuencyToSeconds(frecuency.frecuency);

      const flowRate = bnAmount.div(frecuencyInSeconds);

      const contract = new ethers.Contract(
        "0xcfa132e353cb4e398080b9700609bb008eceb125",
        cfaABI,
        wallet
      );

      const sf = await Framework.create({
        chainId: EarningAssets[selectedChain?.name].chainId,
        provider,
      });

      const token = await sf.loadSuperToken(selectedAssetToSell.label);
      let fee = BigNumber.from("0");

      if (!selectedAssetIsInActiveSwaps) {
        fee = await contract.estimateGas.createFlow(
          token.address,
          selectedAccount.value.address,
          "0x0794c89b0767d480965574Af38052aab32496E00",
          flowRate,
          "0x000000"
        );
      } else {
        fee = await contract.estimateGas.updateFlow(
          token.address,
          selectedAccount.value.address,
          "0x0794c89b0767d480965574Af38052aab32496E00",
          flowRate,
          "0x000000"
        );
      }

      const feeData = await provider.getFeeData();

      const _gasLimit = fee;
      const _maxFeePerGas = feeData.maxFeePerGas as ethers.BigNumber;
      const _maxPriorityFeePerGas =
        feeData.maxPriorityFeePerGas as ethers.BigNumber;

      const avg = _maxFeePerGas.add(_maxPriorityFeePerGas).div(2);
      const estimatedTotal = avg.mul(_gasLimit);

      const estimatedFee = utils.formatEther(estimatedTotal.toString());

      setEstimatedFee(estimatedFee);
    } catch (error) {
      console.log(error);
      showErrorToast(error);
    }
    endLoading();
  };

  const confirmHandleSwap = async () => {
    if (!amount) return;
    starLoading();
    try {
      const bnAmount = utils.parseEther(amount);
      const frecuencyInSeconds = getFrecuencyToSeconds(frecuency.frecuency);

      const sf = await Framework.create({
        chainId: EarningAssets[selectedChain?.name].chainId,
        provider,
      });

      const token = await sf.loadSuperToken(selectedAssetToSell.label);

      const privateKey = await Extension.showKey();

      const signer = sf.createSigner({
        privateKey,
        provider,
      });

      const flowRate = bnAmount.div(frecuencyInSeconds).toString();

      if (!selectedAssetIsInActiveSwaps) {
        const flowOperation = (await token).createFlow({
          sender: await signer.getAddress(),
          receiver: EarningAssets[selectedChain?.name].contractAddress,
          flowRate,
        });

        const txnResponse = await flowOperation.exec(signer);
        await txnResponse.wait();

        showSuccessToast("Swap created successfully");
        loadActiveSwaps([
          ...activeSwaps.map((swap) => swap.asset),
          selectedAssetToSell.label,
        ]);
      } else {
        const flowOperation = (await token).updateFlow({
          sender: await signer.getAddress(),
          receiver: EarningAssets[selectedChain?.name].contractAddress,
          flowRate,
        });

        const txnResponse = await flowOperation.exec(signer);
        await txnResponse.wait();

        showSuccessToast("Swap updated successfully");
        loadActiveSwaps([...activeSwaps.map((swap) => swap.asset)]);
      }
      closeDialog();
    } catch (error) {
      showErrorToast(error);
    }
    endLoading();
  };

  const selectAssetFromActiveSwaps = (tokenName: string) => {
    if (!tokenName) return;

    setSelectedAssetToSell({
      label: tokenName,
      image: ASSETS_INFO[tokenName].image,
    });

    const assetsToBuy = paisAssets[tokenName];
    setAssetsToBuy(
      assetsToBuy.map((asset: string) => ({
        label: asset,
        image: ASSETS_INFO[asset].image,
      }))
    );

    setSelectedAssetToBuy({
      label: assetsToBuy[0],
      image: ASSETS_INFO[assetsToBuy[0]].image,
    });
  };

  useEffect(() => {
    if (!SUPPORTED_CHAINS.includes(selectedChain?.name)) return;

    init();
  }, [selectedChain]);

  useEffect(() => {
    if (!selectedAssetToSell) return;

    const assetToBuy = paisAssets[selectedAssetToSell.label];

    if (!assetToBuy) return;

    setAssetsToBuy(
      assetToBuy.map((asset: string) => ({
        label: asset,
        image: ASSETS_INFO[asset].image,
      }))
    );
    setSelectedAssetToBuy({
      label: assetToBuy[0],
      image: ASSETS_INFO[assetToBuy[0]].image,
    });
  }, [selectedAssetToSell, paisAssets]);

  useEffect(() => {
    if (!selectedAccount || !provider || !selectedAssetToSell.label) return;

    const getBalance = async () => {
      setSelectedTokenBalance("0");

      try {
        const sf = await Framework.create({
          chainId: EarningAssets[selectedChain?.name].chainId,
          provider,
        });

        const token = await sf.loadSuperToken(selectedAssetToSell.label);

        const balance = await token.balanceOf({
          account: selectedAccount.value.address,
          providerOrSigner: provider,
        });

        const formatedBalance = utils.formatEther(balance.toString());

        setSelectedTokenBalance((+formatedBalance).toFixed(4));
      } catch (error) {
        showErrorToast("error_obtaining balance");
      }
    };

    getBalance();
  }, [selectedAccount, provider, selectedAssetToSell?.label]);

  return {
    assetsToSell,
    assetsToBuy,
    selectedAssetToBuy,
    setSelectedAssetToBuy,
    selectedAssetToSell,
    setSelectedAssetToSell,
    amount,
    setAmount,
    // createSwap,
    frecuency,
    setFrecuency,
    isLoading,
    activeSwaps,
    isLoadingActiveSwaps,
    selectedAssetIsInActiveSwaps,
    selectedTokenBalance,
    handleSwap,
    confirmHandleSwap,
    selectAssetFromActiveSwaps,
    isOpen,
    closeDialog,
    estimatedFee,
  };
};
