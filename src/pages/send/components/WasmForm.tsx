import { FC, useEffect, useState } from "react";
import { LoadingButton, Loading } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { CommonFormFields } from "./CommonFormFields";
import { useFormContext } from "react-hook-form";
import { useNetworkContext } from "@src/providers";
import { ApiPromise } from "@polkadot/api";
import Extension from "@src/Extension";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { useToast } from "@src/hooks";
import { AccountType } from "@src/accounts/types";
import { NumericFormat } from "react-number-format";
import { confirmTx, polkadotExtrinsic } from "../Send";

const defaultFees = {
  "estimated fee": "0",
  "weight ref time": "0",
  "weight proof size": "0",
  "estimated total": "0",
};

interface WasmFormProps {
  confirmTx: confirmTx;
}

export const WasmForm: FC<WasmFormProps> = ({ confirmTx }) => {
  const { t } = useTranslation("send");

  const {
    state: { selectedChain, api },
  } = useNetworkContext();

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
  const destinationAccount = watch("destinationAccount");
  const destinationIsInvalid = Boolean(errors?.destinationAccount?.message);
  const currencySymbol = selectedChain?.nativeCurrency.symbol;

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
  }, [amount, destinationAccount, destinationIsInvalid]);

  const getFeeData = async () => {
    try {
      const _amount = Number(amount) * currencyUnits;

      const extrinsic = await _api.tx.balances.transfer(
        destinationAccount,
        _amount
      );

      setExtrinsic(extrinsic);

      const { weight, partialFee } = await extrinsic.paymentInfo(
        sender as KeyringPair
      );

      const fee = partialFee.toNumber() / currencyUnits;

      const total = (partialFee.toNumber() + _amount) / currencyUnits;

      setFee({
        "estimated fee": `${fee} ${currencySymbol}`,
        "weight ref time": String(weight.toJSON().refTime),
        "weight proof size": String(weight.toJSON().proofSize),
        "estimated total": `${total} ${currencySymbol}`,
      });
    } catch (error) {
      showErrorToast(error);
      setFee(defaultFees);
    }
  };

  const asset = watch("asset");

  const canContinue = Number(amount) > 0 && destinationAccount && !isLoadingFee;

  const stimatedTotal =
    Number(fee["estimated total"]?.split(currencySymbol)?.[0]?.trim()) || 0;

  const isEnoughToPay = stimatedTotal > 0 && stimatedTotal <= asset.balance;

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
          {Object.keys(fee).map((key) => (
            <div key={key} className="flex justify-between">
              <p>{key}</p>
              <p className="font-bold">{fee[key]}</p>
            </div>
          ))}
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
