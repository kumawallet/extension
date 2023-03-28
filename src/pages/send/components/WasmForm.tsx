import { FC, useEffect, useState, useMemo } from "react";
import { LoadingButton, Loading } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { CommonFormFields } from "./CommonFormFields";
import { useFormContext } from "react-hook-form";
import {
  useAccountContext,
  useAssetContext,
  useNetworkContext,
} from "@src/providers";
import { ApiPromise } from "@polkadot/api";
import Extension from "@src/Extension";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { useToast } from "@src/hooks";
import { AccountType } from "@src/accounts/types";
import { NumericFormat } from "react-number-format";
import { confirmTx, polkadotExtrinsic } from "../Send";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { BN } from "bn.js";
import { formatBN } from "@src/utils/assets";
import { ContractPromise } from "@polkadot/api-contract";
import metadata from "@src/constants/metadata.json";
import { ContractTx } from "@polkadot/api-contract/base/types";

const defaultFees = {
  "estimated fee": new BN("0"),
  "estimated total": new BN("0"),
};

interface WasmFormProps {
  confirmTx: confirmTx;
}

export const WasmForm: FC<WasmFormProps> = ({ confirmTx }) => {
  const { t } = useTranslation("send");

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const {
    state: { selectedChain, api },
  } = useNetworkContext();

  const {
    state: { assets },
  } = useAssetContext();

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = useFormContext();

  const { showErrorToast } = useToast();

  const [fee, setFee] = useState(defaultFees);
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [sender, setSender] = useState<KeyringPair | null>(null);
  const [extrinsic, setExtrinsic] = useState<polkadotExtrinsic | null>(null);
  const [aditional, setAditional] = useState({
    tip: "0",
  });

  const _api = api as ApiPromise;
  const decimals = selectedChain?.nativeCurrency.decimals || 1;
  const currencyUnits = 10 ** decimals;
  const amount = watch("amount");
  const asset = watch("asset");
  const isNativeAsset = asset?.id === "-1";
  const destinationAccount = watch("destinationAccount");
  const destinationIsInvalid = Boolean(errors?.destinationAccount?.message);
  const nativeSymbol = selectedChain?.nativeCurrency.symbol;

  console.log(asset);

  useEffect(() => {
    (async () => {
      const seed = await Extension.showSeed();
      const keyring = new Keyring({ type: "sr25519" });
      const sender = keyring.addFromMnemonic(seed as string);
      setSender(sender);
    })();
  }, []);

  const onSubmit = handleSubmit(async () => {
    confirmTx({
      type: AccountType.WASM,
      tx: extrinsic as polkadotExtrinsic,
      aditional: {
        tip: Number(aditional.tip) * currencyUnits || "0",
      },
      sender: sender as KeyringPair,
    });
  });

  useEffect(() => {
    if (destinationIsInvalid) {
      setFee(defaultFees);
      return;
    }

    if (!destinationAccount || amount <= 0) return;

    setIsLoadingFee(true);

    const loadFees = setTimeout(async () => {
      await getFeeData();
      setIsLoadingFee(false);
    }, 1000);

    return () => clearTimeout(loadFees);
  }, [amount, destinationAccount, destinationIsInvalid, asset?.id]);

  const getFeeData = async () => {
    if (!destinationAccount) return;
    try {
      const _amount = isNativeAsset
        ? amount * currencyUnits
        : amount * 10 ** asset.decimals;

      const bnAmount = new BN(
        String(_amount.toLocaleString("fullwide", { useGrouping: false }))
      );

      let extrinsic: SubmittableExtrinsic<"promise"> | ContractTx<"promise">;
      let estimatedFee = new BN("0");

      if (asset?.address) {
        // extrinsic from contract assets
        const refTime = new BN("1000000000000");
        const proofSize = new BN("1000000000000");
        const contract = new ContractPromise(api, metadata, asset.address);
        const { gasRequired } = await contract.query.transfer(
          selectedAccount.value.address,
          {
            gasLimit: api.registry.createType("WeightV2", {
              refTime,
              proofSize,
            }),
          },
          destinationAccount,
          bnAmount
        );

        extrinsic = await contract.tx.transfer(
          {
            gasLimit: api.registry.createType("WeightV2", gasRequired),
          },
          destinationAccount,
          bnAmount
        );

        const { proofSize: _proofSize, refTime: _refTime } =
          gasRequired.toJSON();

        estimatedFee = new BN(String(_proofSize)).add(new BN(String(_refTime)));
      } else {
        if (asset?.id === "-1") {
          extrinsic = await _api.tx.balances.transfer(
            destinationAccount,
            bnAmount
          );
        } else {
          extrinsic = await _api.tx.assets.transfer(
            asset.id,
            destinationAccount,
            bnAmount
          );
        }

        const { partialFee } = await extrinsic.paymentInfo(
          sender as KeyringPair
        );
        estimatedFee = partialFee;
      }

      setExtrinsic(extrinsic);

      const amounToShow =
        asset?.id === "-1" ? bnAmount.add(estimatedFee) : estimatedFee;

      setFee({
        "estimated fee": estimatedFee,
        "estimated total": amounToShow,
      });
    } catch (error) {
      console.log(error);
      showErrorToast(error);
      setFee(defaultFees);
    }
  };

  const canContinue = Number(amount) > 0 && destinationAccount && !isLoadingFee;

  const isEnoughToPay = useMemo(() => {
    if (!amount || !currencyUnits) return false;

    try {
      const _amount = isNativeAsset
        ? amount * currencyUnits
        : amount * 10 ** asset.decimals;

      const bnAmount = new BN(
        _amount.toLocaleString("fullwide", { useGrouping: false })
      );
      const estimatedTotal = fee["estimated total"];
      const BN0 = new BN("0");

      if (isNativeAsset) {
        const BNBalance = new BN(
          (asset?.balance * currencyUnits).toLocaleString("fullwide", {
            useGrouping: false,
          })
        );
        return bnAmount.gt(BN0) && estimatedTotal.lte(BNBalance);
      } else {
        const BNBalance = new BN(asset?.balance);
        const nativeBalance = assets[0].balance;

        return (
          bnAmount.lte(BNBalance) &&
          estimatedTotal.gt(BN0) &&
          estimatedTotal.lte(nativeBalance)
        );
      }
    } catch (error) {
      return false;
    }
  }, [fee, asset, amount]);

  return (
    <>
      <CommonFormFields />

      <div className="mb-3">
        <p>{t("tip")}</p>
        <div className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white">
          <NumericFormat
            className="bg-transparent w-8/12 outline-0"
            allowNegative={false}
            allowLeadingZeros={false}
            value={aditional.tip}
            onValueChange={({ value }) => {
              setAditional((state) => ({
                ...state,
                tip: value,
              }));
            }}
            allowedDecimalSeparators={["%"]}
          />
        </div>
      </div>

      {isLoadingFee ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <p>{t("estimated_fee")}</p>
            <p>{formatBN(fee["estimated fee"].toString(), decimals)}</p>
          </div>
          <div className="flex justify-between">
            <p>{t("estimated_total")}</p>
            {isNativeAsset ? (
              <>
                <p className="font-bold">
                  {`${formatBN(
                    fee["estimated total"].toString(),
                    decimals
                  )} ${nativeSymbol}`}
                </p>
              </>
            ) : (
              <>
                <p className="font-bold">{`${amount} ${
                  asset?.symbol
                } + ${formatBN(
                  fee["estimated total"].toString(),
                  decimals
                )} ${nativeSymbol}`}</p>
              </>
            )}
          </div>
        </div>
      )}

      {canContinue && !isEnoughToPay && (
        <p className="text-sm mt-2 text-red-500 text-center">
          {t("insufficient_balance")}
        </p>
      )}

      <LoadingButton
        classname="font-medium text-base bg-custom-green-bg w-full py-2 md:py-4 rounded-md mt-7"
        isDisabled={!canContinue || !isEnoughToPay}
        onClick={onSubmit}
      >
        {t("continue")}
      </LoadingButton>
    </>
  );
};
