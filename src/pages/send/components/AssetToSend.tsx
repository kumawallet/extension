import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useAccountContext,
  useAssetContext,
  useNetworkContext,
} from "@src/providers";
import { NumericFormat } from "react-number-format";
import { useFormContext } from "react-hook-form";
import { SendTxForm } from "../Send";
import { XCM } from "@src/constants/xcm";
import { Chain, IAsset } from "@src/types";
import { HiMiniChevronDown } from "react-icons/hi2";
import { XCM_ASSETS_MAPPING } from "@src/xcm/assets";
import { FiArrowDownCircle } from "react-icons/fi";
import { formatBN, getType } from "@src/utils/assets";
import { useDebounce } from "react-use";
import { AssetIcon, SelectableOptionModal } from "@src/components/common";
import { GoCircle, GoCheckCircle } from "react-icons/go";

const ICON_WIDTH = 18;

type IconField<T> = keyof T;
type LabelField<T> = keyof T;

const ItemPlaceHolder = () => (
  <>
    <div className="w-4 h-4 rounded-full bg-gray-500 animate-pulse" />
    <div className="w-10 rounded-md h-3 bg-gray-500 animate-pulse" />
  </>
);

export const SelectItem = <
  T extends {
    symbol: string;
  }
>({
  onChangeValue,
  value,
  items,
  labelField = "symbol",
  buttonClassname = "",
  containerClassname = "",
  iconField = "symbol",
  iconWidth = ICON_WIDTH,
  selectedLabelClassName = "",
  selectedItemContainerClassName = "",
  modalTitle = "",
}: {
  buttonClassname?: string;
  containerClassname?: string;
  onChangeValue: (value: T) => void;
  value: T | null;
  items: T[];
  labelField: LabelField<T>;
  iconField: IconField<T>;
  iconWidth?: number;
  selectedLabelClassName?: string;
  selectedItemContainerClassName?: string;
  modalTitle?: string;
}) => {
  const hasMultipleItems = items.length > 0;

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    if (!hasMultipleItems) return;
    setIsOpen(true);
  }

  return (
    <>
      <div className={containerClassname}>
        <button
          onClick={openModal}
          className={`flex items-center text-sm gap-1 ${buttonClassname}`}
        >
          <div
            className={`flex items-center gap-1 ${selectedItemContainerClassName}`}
          >
            {!value ? (
              <ItemPlaceHolder />
            ) : (
              <>
                {iconField === "symbol" ? (
                  <AssetIcon
                    asset={
                      {
                        symbol: value?.[iconField] || "",
                      } as IAsset
                    }
                    width={iconWidth}
                  />
                ) : (
                  <img
                    src={value?.[iconField] as string}
                    width={iconWidth}
                    className="rounded-full"
                  />
                )}

                <span className={selectedLabelClassName}>
                  {/* 
// @ts-expect-error -- * */}
                  {value?.[labelField]}
                </span>
              </>
            )}
          </div>
          {hasMultipleItems && <HiMiniChevronDown size={18} />}
        </button>
      </div>

      <SelectableOptionModal<T>
        isOpen={isOpen}
        items={items}
        closeModal={closeModal}
        emptyMessage="No items"
        title={modalTitle}
        filterBy={[labelField as string]}
        Item={({ item }) => (
          <button
            onClick={() => {
              onChangeValue(item);
              closeModal();
            }}
            className="flex items-center justify-between bg-[#1C1C27] hover:bg-gray-500 hover:bg-opacity-30 w-full py-2 px-4 rounded-xl"
          >
            <div className="flex gap-2 items-center">
              {iconField === "symbol" ? (
                <AssetIcon
                  asset={
                    {
                      symbol: item?.[iconField] || "",
                    } as IAsset
                  }
                  width={ICON_WIDTH}
                />
              ) : (
                <img
                  // @ts-expect-error -- *
                  src={item?.[iconField] || ""}
                  width={ICON_WIDTH}
                  className="rounded-full"
                />
              )}

              <span className="ml-3 text-xl">
                {/* 
// @ts-expect-error -- * */}
                {item[labelField]}
              </span>
            </div>
            <div>
              {value?.[labelField] === item[labelField] ? (
                <GoCheckCircle size={16} color="#2CEC84" />
              ) : (
                <GoCircle size={16} color="#AEAEB2" />
              )}
            </div>
          </button>
        )}
      />
    </>
  );
};

interface AssetToSelect {
  id: string;
  symbol: string;
  decimals: number;
  balance: string;
  address: string | undefined;
}

const styles = {
  row: "flex justify-between p-3",
};

export const AssetToSend = () => {
  const { t } = useTranslation("send");

  const {
    state: { chains, selectedChain },
  } = useNetworkContext();
  const {
    state: { assets },
  } = useAssetContext();
  const {
    state: { accounts },
  } = useAccountContext();

  const { setValue, getValues, watch } = useFormContext<SendTxForm>();
  const originNetwork = watch("originNetwork");
  const targetChain = watch("targetNetwork");
  const selectedAsset = watch("asset");
  const senderAddress = watch("senderAddress");
  const isXCM = watch("isXcm");

  const [chainsToSend, setChainsToSend] = useState<Chain[]>([]);
  const [amount, setAmount] = useState<string>(getValues("amount"));

  const chainsToSelectFrom = useMemo(() => {
    if (!senderAddress) return [];

    const activeChainIds = Object.keys(selectedChain);

    const allChains = chains.map((chain) => chain.chains).flat();

    const chainsToSend = allChains.filter((chain) =>
      activeChainIds.includes(chain.id)
    );

    const account = accounts.find(
      (account) => account.value?.address === senderAddress
    );

    if (!account) return;

    const chainsByType = chainsToSend.filter(
      (chain) => chain.type === getType(account?.type?.toLowerCase())
    );

    setValue("originNetwork", chainsByType[0]);
    return chainsByType;
  }, [chains, selectedChain, senderAddress, accounts]);

  useEffect(() => {
    if (!originNetwork?.id) return;

    const xcmChainsList = XCM[originNetwork?.id || ""];
    if (xcmChainsList?.length > 0) {
      const allChains = chains.flatMap((chain) => chain.chains);
      const xcmChains = allChains.filter((chain) =>
        xcmChainsList.includes(chain.id)
      );
      setChainsToSend([originNetwork, ...xcmChains]);
    } else {
      setChainsToSend([originNetwork]);
    }
    setValue("targetNetwork", originNetwork);
  }, [originNetwork]);

  useEffect(() => {
    setValue("isXcm", targetChain?.id !== originNetwork?.id);
  }, [targetChain]);

  const assetsToSelect = useMemo(() => {
    if (!originNetwork || !targetChain || !senderAddress) return [];

    const keyIndex = Object.keys(assets).find((key) =>
      key.toLowerCase().includes(senderAddress.toLowerCase())
    );

    if (!keyIndex) return [];

    const _assetFromChain = assets[keyIndex]?.[originNetwork.id as string];

    if (!_assetFromChain) return [];

    const availableAssets = _assetFromChain.assets || [];

    if (isXCM) {
      const xcmAssets =
        XCM_ASSETS_MAPPING[originNetwork?.id]?.[targetChain?.id] || [];

      const filteredAssets = availableAssets.filter(
        ({ symbol }, index, self) =>
          xcmAssets.includes(symbol) &&
          self.findIndex((s) => s.symbol === symbol) === index
      );

      const _assets =
        filteredAssets.length > 0 ? filteredAssets : availableAssets;

      const defaultAsset = _assets[0];

      setValue("asset", {
        id: defaultAsset?.id || "",
        symbol: defaultAsset?.symbol || "",
        decimals: defaultAsset?.decimals || 1,
        balance: String(defaultAsset?.balance || "0"),
        address: defaultAsset?.address,
      });
      return _assets.map(({ id, symbol, decimals, balance, address }) => ({
        id,
        symbol,
        decimals,
        balance: String(balance),
        address,
      }));
    } else {
      setValue("asset", {
        id: availableAssets[0]?.id || "",
        symbol: originNetwork?.symbol,
        decimals: originNetwork?.decimals || 1,
        balance: String(availableAssets[0]?.balance || "0"),
        address: availableAssets[0]?.address || "",
      });
      return availableAssets.map(
        ({ id, symbol, decimals, balance, address }) => ({
          id,
          symbol,
          decimals,
          balance: String(balance),
          address,
        })
      );
    }
  }, [originNetwork, targetChain, assets, isXCM, senderAddress]);

  useDebounce(
    () => {
      setValue("amount", amount);
    },
    300,
    [amount]
  );

  return (
    <>
      <div className="bg-[#1C1C27] flex flex-col mb-2 rounded-sm py-2">
        {/* First row */}
        <div className={styles.row}>
          <div className="flex items-center gap-1" data-testid="asset-to-send">
            <span className="text-[#9CA3AF] font-medium">{t("asset")}</span>
            <SelectItem<AssetToSelect>
              items={assetsToSelect}
              onChangeValue={(asset) => {
                if (selectedAsset?.id === asset.id) return;

                setValue("asset", {
                  id: asset.id,
                  symbol: asset.symbol,
                  decimals: asset.decimals,
                  balance: asset?.balance,
                  address: asset.address,
                });
              }}
              value={selectedAsset as AssetToSelect}
              labelField="symbol"
              iconField="symbol"
              selectedLabelClassName="text-[#D0D0D0]"
              modalTitle={t("select_asset")}
            />
          </div>

          <SelectItem<Chain>
            items={chainsToSelectFrom || []}
            onChangeValue={(network) => {
              setValue("originNetwork", network);
              setValue("targetNetwork", network);
            }}
            value={originNetwork}
            labelField="name"
            iconField="logo"
          />
        </div>
        <div className="w-full h-[1px] bg-[#636669B2]" />
        {/* Second row */}
        <div className={`${styles.row} py-1`}>
          <NumericFormat
            data-testid="amount-input"
            className="bg-transparent text-[#9CA3AF] outline-none border-none px-1 text-lg font-bold w-[15ch]"
            onValueChange={({ value }) => {
              setAmount(value);
            }}
            value={amount}
            thousandSeparator=","
          />

          <div className="flex items-center gap-1">
            <span className="text-[#9CA3AF]">{t("bal")}:</span>
            <span className="flex whitespace-nowrap items-center ml-1 text-[#F5F9FF]">
              {formatBN(
                selectedAsset?.balance || "0",
                selectedAsset?.decimals,
                2
              )}{" "}
              {selectedAsset?.symbol || ""}
            </span>
            <button
              className="text-[#7C4DC4]"
              onClick={() => {
                setValue(
                  "amount",
                  formatBN(
                    selectedAsset?.balance || "0",
                    selectedAsset?.decimals,
                    null
                  )
                );
              }}
            >
              {t("max")}
            </button>
          </div>
        </div>
      </div>

      <FiArrowDownCircle className="mx-auto -my-4" size={26} />

      <div className="flex justify-around mt-1 py-3 px-2 bg-[#1C1C27] rounded-sm">
        <SelectItem<Chain>
          items={chainsToSend}
          onChangeValue={(chain) => {
            if (targetChain?.id === chain.id) return;
            setValue("targetNetwork", chain);
          }}
          value={targetChain}
          labelField="name"
          containerClassname="w-full"
          buttonClassname="w-full flex justify-end items-center gap-24 pr-4"
          iconField="logo"
          iconWidth={24}
          selectedLabelClassName="text-lg ml-16 text-nowrap"
          modalTitle={t("select_chain")}
        />
      </div>
    </>
  );
};
