import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAssetContext, useNetworkContext } from "@src/providers";
import { NumericFormat } from "react-number-format";
import { useFormContext } from "react-hook-form";
import { SendTxForm } from "../Send";
import { XCM } from "@src/constants/xcm";
import { Chain, IAsset } from "@src/types";
import { HiMiniChevronDown } from "react-icons/hi2";
import { XCM_ASSETS_MAPPING } from "@src/xcm/assets";
import { FiArrowDownCircle } from "react-icons/fi";
import { formatBN } from "@src/utils/assets";
import { useDebounce } from "react-use";
import { AssetIcon, SelectableOptionModal } from "@src/components/common";

const ICON_WIDTH = 18;

type IconField<T> = keyof T;
type LabelField<T> = keyof T;

const SelectItem = <
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
          className={`flex items-center text-sm gap-1 ${value ? "" : "animate-spin"
            } ${buttonClassname}`}
        >
          <div
            className={`flex items-center gap-1 ${selectedItemContainerClassName}`}
          >
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
        Item={({ item }) => (
          <button
            onClick={() => {
              onChangeValue(item);
              closeModal();
            }}
            className="flex flex-col bg-[#1C1C27] hover:bg-gray-500 hover:bg-opacity-30 w-full p-2 rounded-xl"
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
    state: { chains },
  } = useNetworkContext();
  const {
    state: { assets },
  } = useAssetContext();

  const { setValue, getValues, watch } = useFormContext<SendTxForm>();
  const originNetwork = watch("originNetwork");
  const targetChain = watch("targetNetwork");
  const selectedAsset = watch("asset");
  const isXCM = watch("isXcm");

  const [chainsToSend, setChainsToSend] = useState<Chain[]>([targetChain]);
  const [amount, setAmount] = useState<string>(getValues("amount"));

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
  }, [originNetwork]);

  useEffect(() => {
    setValue("isXcm", targetChain.id !== originNetwork.id);
  }, [targetChain]);

  const assetsToSelect = useMemo(() => {
    if (!originNetwork || !targetChain) return [];

    if (isXCM) {
      const xcmAssets =
        XCM_ASSETS_MAPPING[originNetwork?.id]?.[targetChain?.id] || [];

      const filteredAssets = assets.filter(
        ({ symbol }, index, self) =>
          xcmAssets.includes(symbol) &&
          self.findIndex((s) => s.symbol === symbol) === index
      );

      const _assets = filteredAssets.length > 0 ? filteredAssets : assets;

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
        id: assets[0]?.id || "",
        symbol: originNetwork.symbol,
        decimals: originNetwork.decimals || 1,
        balance: String(assets[0]?.balance || "0"),
        address: assets[0]?.address || "",
      });
      return assets.map(({ id, symbol, decimals, balance, address }) => ({
        id,
        symbol,
        decimals,
        balance: String(balance),
        address,
      }));
    }
  }, [originNetwork, assets, isXCM]);

  useDebounce(
    () => {
      setValue("amount", amount);
    },
    300,
    [amount]
  );

  return (
    <>
      <div className="bg-[#1C1C27] flex flex-col mb-2 rounded-[10px] py-2">
        {/* First row */}
        <div className={styles.row}>
          <div className="flex items-center gap-1">
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
              // @ts-expect-error -- *
              value={
                selectedAsset || {
                  symbol: originNetwork.symbol,
                  decimals: originNetwork.decimals || 1,
                  balance: "0",
                  id: "-1",
                  address: "",
                }
              }
              labelField="symbol"
              iconField="symbol"
              selectedLabelClassName="text-[#D0D0D0]"
              modalTitle={t("select_asset")}
            />
          </div>

          <SelectItem<Chain>
            items={[]}
            onChangeValue={() => null}
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
              {formatBN(selectedAsset.balance, selectedAsset.decimals, 2)}{" "}
              {selectedAsset.symbol}
            </span>
            <button
              className="text-[#7C4DC4]"
              onClick={() => {
                setValue(
                  "amount",
                  formatBN(selectedAsset.balance, selectedAsset.decimals, null)
                );
              }}
            >
              {t("max")}
            </button>
          </div>
        </div>
      </div>

      <FiArrowDownCircle className="mx-auto -my-4" size={26} />

      <div className="flex justify-around mt-1 py-3 px-2 bg-[#1C1C27] rounded-[10px]">
        <SelectItem<Chain>
          items={chainsToSend}
          onChangeValue={(chain) => {
            if (targetChain.id === chain.id) return;
            setValue("targetNetwork", chain);
          }}
          value={targetChain}
          labelField="name"
          containerClassname="w-full"
          buttonClassname="w-full flex justify-end items-center gap-24 pr-4"
          iconField="logo"
          iconWidth={24}
          selectedLabelClassName="text-lg ml-16"
          modalTitle={t("select_chain")}
        />
      </div>
    </>
  );
};
