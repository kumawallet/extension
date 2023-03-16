import { useMemo, useState } from "react";
import { PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { useNetworkContext, useTxContext } from "@src/providers";
import { yupResolver } from "@hookform/resolvers/yup";
import { number, object, string } from "yup";
import { useToast } from "@src/hooks";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { useNavigate } from "react-router-dom";
import { BiLeftArrowAlt } from "react-icons/bi";
import { isHex } from "@polkadot/util";
import { isAddress } from "ethers/lib/utils";
import { WasmForm } from "./components/WasmForm";
import { EvmForm } from "./components/EvmForm";
import { AccountType } from "@src/accounts/types";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { BigNumber, ethers } from "ethers";
import { ConfirmTx } from "./components";
import { KeyringPair } from "@polkadot/keyring/types";
import { BALANCE } from "../../routes/paths";

export type polkadotExtrinsic = SubmittableExtrinsic<"promise">;

export type evmTx =
  ethers.utils.Deferrable<ethers.providers.TransactionRequest>;

export type Tx =
  | {
      type: AccountType.WASM;
      tx: polkadotExtrinsic;
      aditional: object;
      sender: KeyringPair;
    }
  | {
      type: AccountType.EVM;
      tx: evmTx;
      aditional?: object;
      sender: ethers.Wallet;
    };

export type confirmTx = ({ type, tx, aditional }: Tx) => void;

export const Send = () => {
  const { t } = useTranslation("send");
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const {
    state: { selectedChain, type },
  } = useNetworkContext();

  const { addTxToQueue } = useTxContext();

  const [tx, setTx] = useState<Tx | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const schema = useMemo(() => {
    return object({
      from: object()
        .typeError(t("required") as string)
        .required(t("required") as string),
      to: object()
        .typeError(t("required") as string)
        .required(t("required") as string),
      destinationAccount: string()
        .typeError(t("required") as string)
        .test("valid address", t("invalid_address") as string, (address) => {
          try {
            if (!address) return false;

            if (isHex(address)) {
              return isAddress(address);
            } else {
              encodeAddress(decodeAddress(address));
            }

            return true;
          } catch (error) {
            return false;
          }
        })
        .required(t("required") as string),
      amount: number().required(t("required") as string),
      asset: object().required(t("required") as string),
    }).required();
  }, []);

  const methods = useForm<any>({
    defaultValues: {
      from: selectedChain,
      to: selectedChain,
      destinationAccount: "",
      amount: 0,
      asset: selectedChain?.nativeCurrency,
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { getValues } = methods;

  const sendTx = async () => {
    setIsLoading(true);
    const amount = getValues("amount");
    const destinationAccount = getValues("destinationAccount");

    try {
      if (tx?.type === AccountType.WASM) {
        addTxToQueue({
          amount,
          destinationAccount,
          tx,
        });
      } else {
        const value = ethers.utils.parseEther(amount);

        const _tx = await tx?.sender.sendTransaction({
          ...tx.tx,
          value,
        });
        addTxToQueue({
          amount,
          destinationAccount,
          tx: _tx,
        });
      }
      showSuccessToast(t("tx_send"));
      navigate(BALANCE, {
        state: {
          tab: "activity",
        },
      });
    } catch (error) {
      // const completeError = String(error);
      // console.log(completeError);
      const _err = String(error).split('\\"message\\":\\"')[1].split('\\"}')[0];
      showErrorToast(_err || error);
    }
    setIsLoading(false);
  };

  return (
    <PageWrapper contentClassName="bg-[#29323C] h-full">
      <FormProvider {...methods}>
        {!tx ? (
          <div className="mx-auto">
            <div className="flex gap-3 items-center mb-7">
              <BiLeftArrowAlt
                size={26}
                className="cursor-pointer"
                onClick={() => navigate(-1)}
              />

              <p className="text-xl">{t("title")}</p>
            </div>

            {type === "WASM" ? (
              <WasmForm confirmTx={setTx} />
            ) : (
              <EvmForm confirmTx={setTx} />
            )}
          </div>
        ) : (
          <ConfirmTx tx={tx} onConfirm={sendTx} isLoading={isLoading} />
        )}
      </FormProvider>
    </PageWrapper>
  );
};
