import { FC, useEffect, useState, useMemo } from "react";
import { Button, Loading, ReEnterPassword } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { CommonFormFields } from "./CommonFormFields";
import { useFormContext } from "react-hook-form";
import {
  useAccountContext,
  useAssetContext,
  useNetworkContext,
  useThemeContext,
} from "@src/providers";
import { ApiPromise } from "@polkadot/api";
import Extension from "@src/Extension";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { useToast } from "@src/hooks";
import { AccountType } from "@src/accounts/types";
import { NumericFormat } from "react-number-format";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { BN } from "bn.js";
import { ContractPromise } from "@polkadot/api-contract";
import metadata from "@src/constants/metadata.json";
import { Fees } from "./Fees";
import { confirmTx, polkadotExtrinsic } from "@src/types";
import { PROOF_SIZE, REF_TIME } from "@src/constants/assets";
import { captureError } from "@src/utils/error-handling";
import { XCM_MAPPING } from "@src/xcm/extrinsics";
import { MapResponseXCM } from "@src/xcm/interfaces";

const defaultFees = {
  "estimated fee": new BN("0"),
  "estimated total": new BN("0"),
};

interface WasmFormProps {
  confirmTx: confirmTx;
}

export const WasmForm: FC<WasmFormProps> = ({ confirmTx }) => {
  const { t } = useTranslation("send");
  const { t: tCommon } = useTranslation("common");
  const { color } = useThemeContext();

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
    getValues,
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
  const to = watch("to");
  const isNativeAsset = asset?.id === "-1";
  const destinationAccount = watch("destinationAccount");
  const destinationIsInvalid = Boolean(errors?.destinationAccount?.message);

  const loadSender = async () => {
    const seed = await Extension.showKey();
    const keyring = new Keyring({ type: "sr25519" });
    const sender = keyring.addFromMnemonic(seed as string);
    setSender(sender);
  };

  const onSubmit = handleSubmit(async () => {
    const signedTx = await (extrinsic as polkadotExtrinsic)?.signAsync(
      sender as KeyringPair,
      {
        tip: Number(aditional.tip) * currencyUnits || "0",
      }
    );

    confirmTx({
      type: AccountType.WASM,
      tx: signedTx as polkadotExtrinsic,
      fee,
    });
  });

  const getFeeData = async () => {
    if (!destinationAccount) return;
    try {
      const _amount = isNativeAsset
        ? amount * currencyUnits
        : amount * 10 ** asset.decimals;

      const bnAmount = new BN(
        String(_amount.toLocaleString("fullwide", { useGrouping: false }))
      );

      let extrinsic: SubmittableExtrinsic<"promise"> | unknown;
      let estimatedFee = new BN("0");

      const isXcm = getValues("isXcm");

      if (isXcm) {
        const query = (api as ApiPromise).query;

        const xcmPallet = query.polkadotXcm || query.xcmPallet;

        const xcmPalletVersion = await xcmPallet.palletVersion();

        const { method, pallet, extrinsicValues } = XCM_MAPPING[
          selectedChain.name
        ][to.name]({
          address: destinationAccount,
          amount: bnAmount,
          assetSymbol: asset.symbol,
          xcmPalletVersion: xcmPalletVersion.toString(),
        }) as MapResponseXCM;

        extrinsic = _api.tx[pallet][method](
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

        const { partialFee } = await (
          extrinsic as SubmittableExtrinsic<"promise">
        ).paymentInfo(sender as KeyringPair);

        estimatedFee = partialFee;
      } else if (asset?.address) {
        // extrinsic from contract assets

        const contract = new ContractPromise(api, metadata, asset.address);
        const { gasRequired } = await contract.query.transfer(
          selectedAccount.value.address,
          {
            gasLimit: api.registry.createType("WeightV2", {
              refTime: REF_TIME,
              proofSize: PROOF_SIZE,
            }),
          },
          destinationAccount,
          bnAmount
        );

        extrinsic = contract.tx.transfer(
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
          extrinsic = _api.tx.balances.transfer(destinationAccount, bnAmount);
        } else {
          extrinsic = _api.tx.assets.transfer(
            asset.id,
            destinationAccount,
            bnAmount
          );
        }

        const { partialFee } = await (
          extrinsic as SubmittableExtrinsic<"promise">
        ).paymentInfo(sender as KeyringPair);
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
      captureError(error);
      showErrorToast(tCommon("failed_to_get_fees"));
      setFee(defaultFees);
    }
  };

  useEffect(() => {
    if (Extension.isAuthorized()) {
      loadSender();
    }
  }, []);

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
  }, [amount, destinationAccount, destinationIsInvalid, asset?.id, to?.name]);

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
      const nativeBalance = assets[0].balance;

      if (isNativeAsset) {
        return bnAmount.gt(BN0) && estimatedTotal.lte(nativeBalance);
      } else {
        const BNBalance = new BN(asset?.balance);

        return (
          bnAmount.lte(BNBalance) &&
          estimatedTotal.gt(BN0) &&
          estimatedTotal.lte(nativeBalance)
        );
      }
    } catch (error) {
      captureError(error);
      return false;
    }
  }, [fee, asset, amount, isNativeAsset]);

  return (
    <>
      <CommonFormFields />
      <ReEnterPassword cb={loadSender} />

      <div className="mb-3">
        <p className="text-xs">{t("tip")}</p>
        <div className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-[#343A40] border-gray-600 placeholder-gray-400 text-white">
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

      {isLoadingFee ? <Loading /> : <Fees fee={fee} />}

      {canContinue && !isEnoughToPay && (
        <p className="text-sm mt-2 text-red-500 text-center">
          {t("insufficient_balance")}
        </p>
      )}

      <Button
        classname={`font-medium text-base bg-[#212529] hover:bg-${color}-primary transition-all w-full py-2 md:py-4 rounded-md mt-7`}
        isDisabled={!canContinue || !isEnoughToPay}
        onClick={onSubmit}
        style={{
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        {t("continue")}
      </Button>
    </>
  );
};
