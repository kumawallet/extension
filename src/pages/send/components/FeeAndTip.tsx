import { FC, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SendTxForm } from "../Send";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { ApiPromise, Keyring } from "@polkadot/api";
import { XCM_MAPPING } from "@src/xcm/extrinsics";
import { formatBN, transformAmountStringToBN } from "@src/utils/assets";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { MapResponseEVM, MapResponseXCM } from "@src/xcm/interfaces";
import { KeyringPair } from "@polkadot/keyring/types";
import { BigNumberish, Contract, Wallet, providers } from "ethers";
import { messageAPI } from "@src/messageAPI/api";
import { Switch } from "@headlessui/react";
import { NumericFormat } from "react-number-format";
import erc20Abi from "@src/constants/erc20.abi.json";
import { useToast } from "@src/hooks";
import {
  isKnownEstimatedFeeError,
  validateRecipientAddress,
} from "@src/utils/transfer";

interface FeeAndTipProps {
  containerClassname?: string;
}

export const FeeAndTip: FC<FeeAndTipProps> = ({ containerClassname }) => {
  const { t } = useTranslation("send");

  const { showErrorToast } = useToast();

  const {
    state: { selectedAccount },
  } = useAccountContext();
  const {
    state: { api },
  } = useNetworkContext();

  const { watch, getValues, setValue } = useFormContext<SendTxForm>();
  const originNetwork = watch("originNetwork");
  const targetNetwork = watch("targetNetwork");
  const recipient = watch("recipientAddress");
  const sender = watch("senderAddress");
  const amount = watch("amount");
  const fee = watch("fee");
  const asset = watch("asset");

  const [signer, setSigner] = useState<KeyringPair | Wallet | undefined>(
    undefined
  );

  useEffect(() => {
    if (!sender) return;

    (async () => {
      try {

        const seed = await messageAPI.showKey();

        if (selectedAccount.type.toLowerCase().includes("evm")) {
          const wallet = new Wallet(seed as string, api);
          setSigner(wallet);
        } else if (selectedAccount.type.toLowerCase().includes("wasm")) {
          const seed = await messageAPI.showKey();
          const keyring = new Keyring({ type: "sr25519" });
          const sender = keyring.addFromMnemonic(seed as string);
          setSigner(sender);
        }
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, [sender]);

  useEffect(() => {
    if (
      !recipient ||
      !sender ||
      !asset ||
      !originNetwork ||
      !targetNetwork ||
      !api ||
      !amount ||
      !signer
    )
      return;

    if (
      !validateRecipientAddress(recipient, originNetwork.type as "evm" | "wasm")
    ) {
      return;
    }


    if (amount === "0") {
      return setValue("fee", "0");
    }

    (async () => {
      setValue("isLoadingFee", true);
      try {
        const originChainType = originNetwork.type;
        let estimatedFee = "0";

        const isXCM = getValues("isXcm");
        const isNativeAsset = asset.symbol === originNetwork.symbol;

        const bnAmount = transformAmountStringToBN(amount, asset.decimals);
        if (originChainType === "wasm") {
          let extrinsic: SubmittableExtrinsic<"promise"> | unknown;
          //

          if (isXCM) {
            const query = (api as ApiPromise).query;
            const xcmPallet = query.polkadotXcm || query.xcmPallet;
            const xcmPalletVersion = await xcmPallet.palletVersion();

            const { method, pallet, extrinsicValues } = XCM_MAPPING[
              originNetwork.id
            ][targetNetwork.id]({
              address: recipient,
              amount: bnAmount,
              assetSymbol: asset.symbol,
              xcmPalletVersion: xcmPalletVersion.toString(),
            }) as MapResponseXCM;

            extrinsic = (api as ApiPromise).tx[pallet][method](
              ...Object.keys(extrinsicValues)
                .filter(
                  (key) =>
                    extrinsicValues[
                    key as
                    | "dest"
                    | "beneficiary"
                    | "assets"
                    | "feeAssetItem"
                    | "currencyId"
                    | "amount"
                    | "destWeightLimit"
                    ] !== null
                )
                .map(
                  (key) =>
                    extrinsicValues[
                    key as
                    | "dest"
                    | "beneficiary"
                    | "assets"
                    | "feeAssetItem"
                    | "currencyId"
                    | "amount"
                    | "destWeightLimit"
                    ]
                )
            );
          } else if (isNativeAsset) {
            // native asset transfer
            extrinsic = (api as ApiPromise).tx.balances.transferAllowDeath(
              recipient,
              bnAmount
            );
          } else {
            extrinsic = (api as ApiPromise).tx.assets.transfer(
              asset.id,
              recipient,
              bnAmount
            );
          }

          const { partialFee } = await (
            extrinsic as SubmittableExtrinsic<"promise">
          ).paymentInfo(signer as KeyringPair);

          estimatedFee = partialFee.toString();

          setValue(
            "extrinsicHash",
            (extrinsic as SubmittableExtrinsic<"promise">)?.toHex()
          );

          setValue("fee", estimatedFee);
        } else if (originChainType === "evm") {

          const partialTx = {
            from: sender,
            to: recipient,
            value: bnAmount.toString(),
          };

          if (isXCM) {
            const { method, abi, contractAddress, extrinsicValues } =
              XCM_MAPPING[originNetwork.id][targetNetwork.id]({
                address: recipient,
                amount: bnAmount,
                assetSymbol: asset.symbol,
                xcmPalletVersion: "",
              }) as MapResponseEVM;

            const contract = new Contract(
              contractAddress,
              abi as string,
              signer as Wallet
            );

            const [feeData, gasLimit] = await Promise.all([
              (api as providers.JsonRpcProvider).getFeeData(),
              contract.estimateGas?.[method](
                ...Object.keys(extrinsicValues).map(
                  (key) =>
                    extrinsicValues[
                    key as
                    | "currency_address"
                    | "amount"
                    | "destination"
                    | "weight"
                    ]
                )
              ),
            ]);

            const estimatedFee =
              feeData.maxFeePerGas
                ?.mul(gasLimit)
                .add(feeData.maxPriorityFeePerGas!) || "0";
            setValue("fee", estimatedFee.toString());

            const result = await contract.populateTransaction?.[method](
              ...Object.keys(extrinsicValues).map(
                (key) =>
                  extrinsicValues[
                  key as
                  | "currency_address"
                  | "amount"
                  | "destination"
                  | "weight"
                  ]
              )
            );
            setValue("evmTx", result);
          } else if (isNativeAsset) {
            const [feeData, gasLimit] = await Promise.all([
              (api as providers.JsonRpcProvider).getFeeData(),
              (api as providers.JsonRpcProvider).estimateGas(partialTx),
            ]);

            const estimatedFee =
              feeData.maxFeePerGas
                ?.mul(gasLimit)
                .add(feeData.maxPriorityFeePerGas!) || "0";

            setValue("fee", estimatedFee.toString());

            setValue("evmTx", {
              ...partialTx,
              gasLimit,
              maxFeePerGas: feeData.maxFeePerGas as unknown as BigNumberish,
              maxPriorityFeePerGas:
                feeData.maxPriorityFeePerGas as unknown as BigNumberish,
              type: 2,
            });
          } else if (asset.address) {
            const contract = new Contract(
              asset.address,
              erc20Abi,
              signer as Wallet
            );

            const [feeData, gasLimit] = await Promise.all([
              (api as providers.JsonRpcProvider).getFeeData(),
              contract.estimateGas.transfer(partialTx.to, partialTx.value),
            ]);

            const estimatedFee =
              feeData.maxFeePerGas
                ?.mul(gasLimit)
                .add(feeData.maxPriorityFeePerGas!) || "0";
            setValue("fee", estimatedFee.toString());

            const result = await contract.populateTransaction.transfer(
              partialTx.to,
              partialTx.value,
              {
                gasLimit,
                maxFeePerGas: feeData.maxFeePerGas as unknown as BigNumberish,
                maxPriorityFeePerGas:
                  feeData.maxPriorityFeePerGas as unknown as BigNumberish,
              }
            );
            setValue("evmTx", result);
          }
        }
      } catch (error) {
        if (isKnownEstimatedFeeError(error)) {
          setValue("haveSufficientBalance", false);
        } else {
          showErrorToast("fees_error");
        }
      }
      setValue("isLoadingFee", false);
    })();
  }, [asset, originNetwork, targetNetwork, recipient, api, amount, signer]);

  const isLoadingFee = watch("isLoadingFee");
  const isTipEnabled = watch("isTipEnabled");
  const tip = watch("tip");

  return (
    <div
      className={`${containerClassname} flex flex-col gap-2 justify-around py-3 px-4 bg-[#1C1C27] rounded-xl`}
    >
      <div className="w-full flex justify-between items-center">
        <p className="text-[#A3A3A3]">{t("estimated_fee")}</p>
        <p className={`text-[#FEFDFD] ${isLoadingFee ? "animate-pulse" : ""}`}>
          {formatBN(fee, originNetwork.decimals || 1, 6)}{" "}
          {originNetwork.symbol || ""}
        </p>
      </div>
      <div className="w-full flex justify-between items-center">
        <p className="text-[#A3A3A3]">{t("tip")}</p>
        <Switch
          checked={isTipEnabled}
          onChange={(value) => setValue("isTipEnabled", value)}
          className={`${isTipEnabled ? "bg-teal-400" : "bg-gray-400"
            } relative inline-flex ha-[0.6rem] w-[1.9rem] items-center rounded-full`}
        >
          <span className="sr-only">Enable tip</span>
          <span
            className={`${isTipEnabled ? "translate-x-4" : "translate-x-0"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>
      {isTipEnabled && (
        <div className="py-1">
          <div className="flex items-center p-2 border border-[#636669] rounded-2xl">
            <NumericFormat
              className="bg-transparent text-[#9CA3AF] outline-none border-none px-1 text-lg w-[2ch]"
              onValueChange={({ value }) => {
                setValue("tip", value);
              }}
              value={tip}
              thousandSeparator=","
              onInput={(e) => {
                e.currentTarget.style.width =
                  (e.currentTarget.value.length || 1) + 1 + "ch";
              }}
            />
            <span className="text-[#FEFDFD]">{targetNetwork.symbol}</span>
          </div>
        </div>
      )}
    </div>
  );
};
