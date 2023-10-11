import {
  Button,
  InputErrorMessage,
  PageTitle,
  PageWrapper,
  ReEnterPassword,
} from "@src/components/common";
import { useTranslation } from "react-i18next";
import {
  AssetAmountInput,
  RecipientAddress,
  SelectableAsset,
  TxInfo,
} from "./components";
import { HiMiniArrowsRightLeft } from "react-icons/hi2";
import { useThemeContext } from "@src/providers";
import { useSwap } from "./hooks";
import { formatBN } from "@src/utils/assets";

export const Swap = () => {
  const { t } = useTranslation("swap");
  const { color } = useThemeContext();

  const {
    assets,
    assetToSell,
    assetToBuy,
    setAssetToBuy,
    setAssetToSell,
    handleRecipientChange,
    isValidWASMAddress,
    recipient,
    txInfo,
    amounts,
    handleAmounts,
    handleAssetChange,
    swap,
    isLoading,
    balanceIsSufficient,
    setMaxAmout
  } = useSwap();

  return (
    <PageWrapper contentClassName="bg-[#29323C] h-full">
      <ReEnterPassword />
      <div className="flex flex-col h-[inherit]">
        <PageTitle title={t("title")} canNavigateBack />
        <div className="flex-1">
          <div className="flex justify-center items-center gap-3">
            <SelectableAsset
              value={assetToSell}
              options={assets}
              onChange={(asset) => handleAssetChange("sell", asset)}
              defaulValue={assetToSell}
              label={t("transfer_from") as string}
            />
            <HiMiniArrowsRightLeft className="mt-7" size={20} />
            <SelectableAsset
              value={assetToBuy}
              options={assets}
              onChange={(asset) => handleAssetChange("buy", asset)}
              defaulValue={assetToBuy}
              label={t("transfer_to") as string}
            />
          </div>

          <div className="flex flex-col gap-5 mt-10">
            <div>
              <AssetAmountInput
                amount={amounts.sell}
                balance={formatBN(
                  assetToSell.balance || "0",
                  assetToSell.decimals,
                  2
                )}
                hasMaxOption
                label={t("you_send") as string}
                onMax={setMaxAmout}
                onValueChange={(val) => handleAmounts("sell", val)}
                selectableAsset={
                  <SelectableAsset
                    value={assetToSell}
                    options={assets}
                    onChange={setAssetToSell}
                    defaulValue={assetToSell}
                    containerClassName="flex-none w-[40%] border-l-[0.1px] border-l-[#E5E7EB]"
                    buttonClassName="rounded-l-none"
                  />
                }
              />
              {!balanceIsSufficient && (
                <InputErrorMessage
                  message={t("insufficient_balance") as string}
                />
              )}
            </div>

            <AssetAmountInput
              amount={amounts.buy}
              balance={formatBN(
                assetToBuy.balance || "0",
                assetToBuy.decimals,
                2
              )}
              label={t("you_receive") as string}
              onValueChange={(val) => handleAmounts("buy", val)}
              selectableAsset={
                <SelectableAsset
                  value={assetToBuy}
                  options={assets}
                  onChange={setAssetToBuy}
                  defaulValue={assetToBuy}
                  containerClassName="flex-none w-[40%] border-l-[0.1px] border-l-[#E5E7EB]"
                  buttonClassName="rounded-l-none"
                />
              }
            />
          </div>

          <RecipientAddress
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

          <TxInfo {...txInfo} />
        </div>

        <Button
          isLoading={isLoading}
          classname={`font-medium text-base capitalize w-full py-2 bg-[#212529] hover:bg-${color}-primary !mx-0`}
          onClick={swap}
        >
          {t("proceed")}
        </Button>
      </div>
    </PageWrapper>
  );
};
