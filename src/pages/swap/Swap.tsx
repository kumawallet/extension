import {
  Button,
  InputErrorMessage,
  Loading,
  PageWrapper,
  ReEnterPassword,
  TxInfo,
} from "@src/components/common";
import { useTranslation } from "react-i18next";
import {
  AssetAmountInput,
  RecipientAddress,
  SelectableAsset,
  SwapInfo,
} from "./components";
import { HiMiniArrowRight, HiMiniArrowsRightLeft } from "react-icons/hi2";
import { useThemeContext } from "@src/providers";
import { useSwap } from "./hooks";
import { formatBN } from "@src/utils/assets";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Tab } from "@headlessui/react";
import { useCallback, useState } from "react";
import debounce from "lodash.debounce";
import { SwapAsset } from "./base";
import { TbExternalLink } from "react-icons/tb";

// waiting, confirming, exchanging, sending, finished, failed, refunded, verifying
const chipColor: { [key: string]: string } = {
  ['failed']: "bg-red-600",
  ['refunded']: "bg-red-600",
  ['finished']: "bg-green-600",
  ['waiting']: "bg-yellow-600",
};

export const Swap = () => {
  const { t } = useTranslation("swap");
  const { color } = useThemeContext();
  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const TABS = [t("exchange"), t("my_exchanges")];

  const {
    activeSwaps,
    amounts,
    assetsToBuy,
    assetsToSell,
    assetToBuy,
    assetToSell,
    balanceIsSufficient,
    handleAmounts,
    handleAssetChange,
    handleRecipientChange,
    isCreatingSwap,
    isLoading,
    isLoadingActiveSwaps,
    isLoadingBuyAsset,
    isLoadingSellAsset,
    isLoadingSellPairs,
    isValidWASMAddress,
    minSellAmount,
    mustConfirmTx,
    onBack,
    onConfirmTx,
    recipient,
    sellBalanceError,
    setMaxAmout,
    showRecipientAddress,
    swap,
    swapInfoMessage,
    tx,
    txInfo,
  } = useSwap();

  const canSend = balanceIsSufficient && recipient.address !== "";

  const debouncedHandleAmount = useCallback(debounce(handleAmounts, 300), [
    amounts,
    minSellAmount,
    assetToSell,
    assetToBuy,
  ]);


  return (
    <PageWrapper contentClassName="bg-[#29323C] h-full flex-1">
      <ReEnterPassword />

      {mustConfirmTx ? (
        <TxInfo
          addressFrom={tx.addressFrom}
          addressBridge={tx.addressBridge}
          addressTo={tx.addressTo}
          amountFrom={tx.amountFrom}
          amountBridge={tx.amountBridge}
          amountTo={tx.amountTo}
          assetFrom={tx.assetFrom}
          assetBridge={tx.assetBridge}
          assetTo={tx.assetTo}
          chainFrom={tx.chainFrom}
          chainBridge={tx.chainBridge}
          chainTo={tx.chainTo}
          fee={tx.fee}
          isLoading={isLoading}
          onConfirm={onConfirmTx}
          onBack={onBack}
        />
      ) : (
        <>
          <div className="flex gap-3 items-center mb-2">
            <FiChevronLeft
              size={26}
              className="cursor-pointer"
              onClick={() => navigate(-1)}
            />

            <p className="text-xl">{t("title")}</p>
          </div>

          <div className="flex flex-col h-[inherit]">
            <Tab.Group
              selectedIndex={selectedIndex}
              onChange={setSelectedIndex}
            >
              <Tab.List
                className={`flex space-x-1 p-1 border-b-[1px] border-b-${color}-primary mt-3`}
              >
                {TABS.map((tab) => (
                  <Tab
                    key={tab}
                    className={({ selected }) =>
                      `px-4 text-base md:text-xl py-1 focus:outline-none relative w-full ${selected
                        ? `text-${color}-secondary active-tab after:bg-${color}-fill`
                        : "text-white"
                      }`
                    }
                  >
                    {tab}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-5 px-4">
                <Tab.Panel key={0}>
                  <div className="flex-1">
                    <div className="flex justify-center items-center gap-3">
                      <SelectableAsset
                        value={assetToSell as SwapAsset}
                        options={assetsToSell}
                        onChange={(asset) => handleAssetChange("sell", asset)}
                        defaulValue={assetToSell as SwapAsset}
                        label={t("transfer_from") as string}
                        position="left"
                        isLoading={isLoading}
                        isReadOnly={isCreatingSwap}
                      />
                      <HiMiniArrowsRightLeft className="mt-7" size={20} />
                      <SelectableAsset
                        value={assetToBuy as SwapAsset}
                        options={assetsToBuy}
                        onChange={(asset) => handleAssetChange("buy", asset)}
                        defaulValue={assetToBuy as SwapAsset}
                        label={t("transfer_to") as string}
                        isLoading={isLoading || isLoadingSellPairs}
                        position="right"
                        isReadOnly={isCreatingSwap}
                      />
                    </div>

                    <div className="flex flex-col gap-5 mt-10">
                      <div>
                        <AssetAmountInput
                          minSellAmount={minSellAmount}
                          isLoading={isLoading || isLoadingSellAsset}
                          amount={amounts.sell}
                          balance={formatBN(
                            assetToSell.balance?.toString() || "0",
                            assetToSell.decimals,
                            4
                          )}
                          hasMaxOption
                          label={t("you_send") as string}
                          onMax={setMaxAmout}
                          onValueChange={(val) =>
                            debouncedHandleAmount("sell", val)
                          }
                          isReadOnly={isCreatingSwap}
                          showBalance
                          selectableAsset={
                            <SelectableAsset
                              value={assetToSell as SwapAsset}
                              options={assetsToSell}
                              onChange={(asset) =>
                                handleAssetChange("sell", asset)
                              }
                              isLoading={isLoading}
                              defaulValue={assetToSell as SwapAsset}
                              containerClassName="flex-none w-[40%] border-l-[0.1px] border-l-[#E5E7EB]"
                              buttonClassName="rounded-l-none"
                              position="right"
                              isReadOnly={isCreatingSwap}

                            />
                          }
                        />
                        {!balanceIsSufficient && (
                          <InputErrorMessage
                            message={sellBalanceError ? t(sellBalanceError) as string : ""}
                          />
                        )}
                      </div>

                      <AssetAmountInput
                        isLoading={isLoading || isLoadingBuyAsset}
                        amount={amounts.buy}
                        balance={formatBN(
                          assetToBuy.balance?.toString() || "0",
                          assetToBuy.decimals,
                          4
                        )}
                        label={t("you_receive") as string}
                        onValueChange={(asset) =>
                          debouncedHandleAmount("buy", asset)
                        }
                        isReadOnly={isCreatingSwap}
                        showBalance={false}
                        selectableAsset={
                          <SelectableAsset
                            value={assetToBuy as SwapAsset}
                            options={assetsToBuy}
                            isLoading={isLoading || isLoadingSellPairs}
                            onChange={(asset) =>
                              handleAssetChange("buy", asset)
                            }
                            defaulValue={assetToBuy as SwapAsset}
                            containerClassName="flex-none w-[40%] border-l-[0.1px] border-l-[#E5E7EB]"
                            buttonClassName="rounded-l-none"
                            position="right"
                            isReadOnly={isCreatingSwap}

                          />
                        }
                      />
                    </div>


                    <RecipientAddress
                      recipentAddressFormat={
                        showRecipientAddress
                          ? assetToBuy.label?.toUpperCase()
                          : ""
                      }
                      isOptional={false}
                      containerClassName="mt-10"
                      address={recipient.address}
                      isNotOwnAddress={recipient.isNotOwnAddress}
                      isValidAddress={isValidWASMAddress}
                      onAddressChange={(address) =>
                        handleRecipientChange("address", address)
                      }
                      onTogleRecipient={(value) =>
                        handleRecipientChange("isNotOwnAddress", value)
                      }
                    />


                    {
                      swapInfoMessage && (
                        <p className="py-3 text-gray-300">{t(swapInfoMessage)}</p>
                      )
                    }

                    <SwapInfo {...txInfo} />
                  </div>

                  <Button
                    isDisabled={!canSend}
                    isLoading={
                      isLoading || isLoadingBuyAsset || isLoadingSellAsset || isCreatingSwap
                    }
                    classname={`font-medium text-base capitalize w-full py-2 bg-[#212529] hover:bg-${color}-primary !mx-0`}
                    onClick={swap}
                  >
                    {t("proceed")}
                  </Button>
                </Tab.Panel>
                <Tab.Panel key={1}>
                  {isLoadingActiveSwaps ? (
                    <Loading />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {activeSwaps.map((swap) => (
                        <div
                          key={swap.id}
                          className="p-2 rounded-xl bg-[#727e8b17]"
                        >
                          <div className="flex justify-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="flex flex-col gap-1 items-center">
                                <img
                                  src={swap.iconFrom || ""}
                                  className="w-8 h-8"
                                />
                                <p>
                                  {`${swap.amountFrom
                                    } ${swap?.currencyFrom?.toUpperCase()}`}
                                </p>
                              </div>
                              <HiMiniArrowRight size={20} />
                              <div className="flex flex-col gap-1 items-center">
                                <img src={swap.iconTo || ""} className="w-8 h-8" />
                                <p>
                                  {`${swap.amountTo
                                    } ${swap?.currencyTo?.toUpperCase()}`}
                                </p>
                              </div>
                            </div>

                          </div>

                          <div className="mb-3 flex flex-col gap-3">
                            <p>id:
                              <a className="hover:bg-slate-400/20 rounded-xl p-1 inline-flex gap-1 items-center" href={`https://stealthex.io/exchange/?id=${swap.id}`} target="_blank" rel="noopener noreferrer">{swap.id}
                                <TbExternalLink />
                              </a>
                            </p>
                            <p className="flex items-center gap-2">status:
                              <span className={`rounded-xl p-1 ${chipColor[swap.status] || "bg-yellow-600"}`}>
                                {swap.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </>
      )}
    </PageWrapper>
  );
};
