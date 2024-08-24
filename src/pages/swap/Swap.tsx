import { Button, HeaderBack, InputErrorMessage, PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import {
  AssetAmountInput,
  RecipientAddress,
  SelectableAsset,
  SwapInfo,
} from "./components";
import { useAssetContext } from "@src/providers";
import { swapType, TxInfoState, useSwap } from "./hooks";
import { formatBN } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef } from "react";
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
    onBackBalance,
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

  const canSend = balanceIsSufficient && recipient.address !== "" && assetsToSell.length > 0 && assetToSell.type === swapType.stealhex|| balanceIsSufficient &&  assetsToSell.length > 0 && assetToSell.type === swapType.hydradx;
  const clearExistingInterval = () => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };
  const intervalIdRef = useRef<number | null>(null);
  const debouncedHandleAmount = useCallback((label: "sell" | "buy", amount: string) => {
  
    
  
    if (assetToSell && assetToSell.type === swapType.hydradx) {
      handleAmounts(label, amount)
  
      clearExistingInterval();
  
      intervalIdRef.current = setInterval(() => {
        handleAmounts(label, amount);
      }, 30000)as unknown as number;
    } else {

      handleAmounts(label, amount);

      clearExistingInterval();
      
      handleAmounts(label, amount)
    }
    return () => clearExistingInterval();
  }, [amounts, minSellAmount, assetToSell, assetToBuy]);


  
  return (
    <PageWrapper
      contentClassName="h-full flex-1 "
      innerContentClassName="flex flex-col !bg-[#212529]"
    >
      {mustConfirmTx ? (
        <SwapTxSummary tx={tx} onBack={onBack} onConfirm={onConfirmTx} />
      ) : (
        <>
         <HeaderBack navigate={navigate} title={t("title")} onBackAsync={onBackBalance}/>
          <SelectAccount
            selectedAddress={tx.addressFrom}
            onChangeValue={(value) => setSenderAddress(value)}
          />

          <div className="flex flex-col h-[inherit]">
            <div className="flex-1 mt-4">

              <div className="flex flex-col gap-3">
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
                    onValueChange={(val) => {
                        if(val.endsWith(".") || val.length === 0) return
                        debouncedHandleAmount("sell", val)

                    }}
                    isReadOnly={isCreatingSwap}
                    showBalance
                    isPairValid={isPairValid}
                    type="sell"
                    selectableAsset={
                      <SelectableAsset
                        value={assetToSell as SwapAsset}
                        options={assetsToSell}
                        onChange={(asset) =>{ 
                          handleAssetChange("sell", asset)
                        }}
                        isLoading={isLoading || isLoadingAssets}
                        defaulValue={assetToSell as SwapAsset}
                        containerClassName="flex-none w-[40%]"
                        buttonClassName="rounded-r-none bg-[#343a40] border-none border-r-[0.1px] border-r-[#727e8b17]"
                        position="left"
                        isReadOnly={isCreatingSwap}
                        type="sell"
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
                  onValueChange={() => {}}
                  isReadOnly={isCreatingSwap}
                  showBalance={false}
                  type="buy"
                  selectableAsset={
                    <SelectableAsset
                      value={assetToBuy as SwapAsset}
                      options={assetsToBuy}
                      isLoading={isLoading || isLoadingAssets}
                      onChange={(asset) => handleAssetChange("buy", asset)}
                      defaulValue={assetToBuy as SwapAsset}
                      containerClassName="flex-none w-[40%]"
                      buttonClassName="rounded-r-none bg-[#343a40] border-none border-r-[0.1px] border-r-[#727e8b17]"
                      position="left"
                      isReadOnly={isCreatingSwap}
                      type="buy"
                    />
                  }
                />
              </div>

               <div className={`flex flex-col gap-2 ${assetToSell && assetToSell.type === swapType.hydradx && "pt-4"}`}>
               {assetToSell && assetToSell.type === swapType.stealhex &&<RecipientAddress
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
                />}
                <SwapInfo {...txInfo as TxInfoState} />
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
