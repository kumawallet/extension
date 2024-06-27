import { Button, HeaderBack, InputErrorMessage, PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import {
  AssetAmountInput,
  RecipientAddress,
  SelectableAsset,
  SwapInfo,
} from "./components";
import { HiMiniArrowsRightLeft } from "react-icons/hi2";
import { useAssetContext } from "@src/providers";
import { useSwap } from "./hooks";
import { formatBN } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import debounce from "lodash.debounce";
import { SwapAsset } from "./base";
import { SwapTxSummary } from "./components/SwapTxSummary";
import { SelectAccount } from "../send/components/SelectAccount";

export const Swap = () => {
  const { t } = useTranslation("swap");
  const navigate = useNavigate();

  const {
    state: { isLoadingAssets },
  } = useAssetContext();

  const {
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
    isLoadingBuyAsset,
    isLoadingSellAsset,
    isValidWASMAddress,
    minSellAmount,
    mustConfirmTx,
    onBack,
    recipient,
    sellBalanceError,
    setMaxAmout,
    showRecipientAddress,
    swap,
    swapInfoMessage,
    tx,
    txInfo,
    onConfirmTx,
    isPairValid,
    setSenderAddress,
  } = useSwap();

  const canSend =
    balanceIsSufficient && recipient.address !== "" && assetsToSell.length > 0;

  const debouncedHandleAmount = useCallback(debounce(handleAmounts, 300), [
    amounts,
    minSellAmount,
    assetToSell,
    assetToBuy,
  ]);


  return (
    <PageWrapper
      contentClassName="h-full flex-1 "
      innerContentClassName="flex flex-col !bg-[#212529]"
    >
      {mustConfirmTx ? (
        <SwapTxSummary tx={tx} onBack={onBack} onConfirm={onConfirmTx} />
      ) : (
        <>
         <HeaderBack navigate={navigate} title={t("title")} />
          <SelectAccount
            selectedAddress={tx.addressFrom}
            onChangeValue={(value) => setSenderAddress(value)}
          />

          <div className="flex flex-col h-[inherit]">
            <div className="flex-1 mt-4">
              <div className="flex justify-center items-center gap-3 pt-5">
                <SelectableAsset
                  buttonClassName={`border-prrimary-default`}
                  value={assetToSell as SwapAsset}
                  options={assetsToSell}
                  onChange={(asset) => handleAssetChange("sell", asset)}
                  defaulValue={assetToSell as SwapAsset}
                  label={t("transfer_from") as string}
                  position="left"
                  isLoading={isLoading || isLoadingAssets}
                  isReadOnly={isCreatingSwap}
                />
                <HiMiniArrowsRightLeft size={20} />
                <SelectableAsset
                  value={assetToBuy as SwapAsset}
                  options={assetsToBuy}
                  onChange={(asset) => handleAssetChange("buy", asset)}
                  defaulValue={assetToBuy as SwapAsset}
                  label={t("transfer_to") as string}
                  isLoading={isLoading || isLoadingAssets}
                  position="right"
                  isReadOnly={isCreatingSwap}
                />
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <div>
                  <AssetAmountInput
                    minSellAmount={minSellAmount}
                    isLoading={
                      isLoading || isLoadingSellAsset || isLoadingAssets
                    }
                    amount={amounts.sell}
                    balance={formatBN(
                      assetToSell?.balance?.toString() || "0",
                      assetToSell?.decimals,
                      4
                    )}
                    hasMaxOption
                    label={t("you_send") as string}
                    onMax={setMaxAmout}
                    onValueChange={(val) => debouncedHandleAmount("sell", val)}
                    isReadOnly={isCreatingSwap}
                    showBalance
                    isPairValid={isPairValid}
                    selectableAsset={
                      <SelectableAsset
                        value={assetToSell as SwapAsset}
                        options={assetsToSell}
                        onChange={(asset) => handleAssetChange("sell", asset)}
                        isLoading={isLoading || isLoadingAssets}
                        defaulValue={assetToSell as SwapAsset}
                        containerClassName="flex-none w-[40%]"
                        buttonClassName="rounded-l-none bg-[#343a40] border-none border-l-[0.1px] border-l-[#727e8b17]"
                        position="right"
                        isReadOnly={isCreatingSwap}
                      />
                    }
                  />
                  {!balanceIsSufficient && isPairValid && (
                    <InputErrorMessage
                      message={
                        sellBalanceError ? (t(sellBalanceError) as string) : ""
                      }
                    />
                  )}
                  {!isPairValid && (
                    <InputErrorMessage
                      message={t("pair_not_supported") as string}
                    />
                  )}
                </div>

                <AssetAmountInput
                  isLoading={isLoading || isLoadingBuyAsset || isLoadingAssets}
                  amount={amounts.buy}
                  balance={formatBN(
                    assetToBuy?.balance?.toString() || "0",
                    assetToBuy?.decimals,
                    4
                  )}
                  label={t("you_receive") as string}
                  onValueChange={(asset) => debouncedHandleAmount("buy", asset)}
                  isReadOnly={isCreatingSwap}
                  showBalance={false}
                  selectableAsset={
                    <SelectableAsset
                      value={assetToBuy as SwapAsset}
                      options={assetsToBuy}
                      isLoading={isLoading || isLoadingAssets}
                      onChange={(asset) => handleAssetChange("buy", asset)}
                      defaulValue={assetToBuy as SwapAsset}
                      containerClassName="flex-none w-[40%]"
                      buttonClassName="rounded-l-none bg-[#343a40] border-none border-l-[0.1px] border-l-[#727e8b17]"
                      position="right"
                      isReadOnly={isCreatingSwap}
                    />
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <RecipientAddress
                  recipentAddressFormat={
                    showRecipientAddress ? assetToBuy?.label?.toUpperCase() : ""
                  }
                  isOptional={false}
                  containerClassName="mt-4"
                  address={recipient.address}
                  isNotOwnAddress={recipient.isNotOwnAddress}
                  isValidAddress={isValidWASMAddress}
                  onAddressChange={(address) =>
                    handleRecipientChange("address", address)
                  }
                  onTogleRecipient={(value) =>
                    handleRecipientChange("isNotOwnAddress", value)
                  }
                  infoTooltipMessage={swapInfoMessage}
                />
                <SwapInfo {...txInfo} />
              </div>
            </div>

            <Button
              isDisabled={!canSend}
              isLoading={
                isLoading ||
                isLoadingBuyAsset ||
                isLoadingSellAsset ||
                isCreatingSwap
              }
              classname={`font-medium text-base capitalize w-full py-2 mt-4 !mx-0`}
              onClick={swap}
            >
              {t("proceed")}
            </Button>
          </div>
        </>
      )}
    </PageWrapper>
  );
};
