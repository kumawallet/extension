import { useMemo, useState } from "react";
import { PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { yupResolver } from "@hookform/resolvers/yup";
import { number, object, string } from "yup";
import { useLoading, useToast } from "@src/hooks";
import { useNavigate } from "react-router-dom";
import { AccountType } from "@src/accounts/types";
import { ConfirmTx, WasmForm, EvmForm } from "./components";
import { BALANCE } from "@src/routes/paths";
import { FiChevronLeft } from "react-icons/fi";
import { IAsset, SendForm, Tx, TxToProcess } from "@src/types";
import { BigNumber, Contract } from "ethers";
import { getWebAPI } from "@src/utils/env";
import { XCM_MAPPING } from "@src/xcm/extrinsics";
import { MapResponseEVM } from "@src/xcm/interfaces";
import { isValidAddress } from "@src/utils/account-utils";

const WebAPI = getWebAPI();

export const Send = () => {
  const { t } = useTranslation("send");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();
  const { isLoading, starLoading, endLoading } = useLoading();

  const {
    state: { selectedChain, type, rpc },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [tx, setTx] = useState<Tx | null>(null);

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
        .test(
          "valid address",
          tCommon("invalid_address") as string,
          (address) => isValidAddress(address)
        )
        .required(t("required") as string),
      amount: number().required(t("required") as string),
      asset: object().required(t("required") as string),
    }).required();
  }, []);

  const methods = useForm<SendForm>({
    defaultValues: {
      from: selectedChain,
      to: selectedChain,
      destinationAccount: "",
      amount: 0,
      asset: {},
      isXcm: false,
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const { getValues } = methods;

  const decimals = selectedChain?.nativeCurrency.decimals || 1;
  const currencyUnits = 10 ** decimals;

  const sendTx = async () => {
    starLoading();
    const amount = getValues("amount");
    const destinationAddress = getValues("destinationAccount");
    const originAddress = selectedAccount.value.address;
    const asset = getValues("asset") as IAsset;
    const destinationNetwork = getValues("to").name;
    const isXcm = getValues("isXcm");
    const to = getValues("to");

    const txToSend: Partial<TxToProcess> = {
      amount,
      originAddress,
      destinationAddress,
      rpc: rpc as string,
      asset,
      destinationNetwork,
      networkInfo: selectedChain,
      originNetwork: selectedChain,
    };

    try {
      if (tx?.type === AccountType.WASM) {
        txToSend.tx = {
          txHash: tx.tx.toHex(),
          type: AccountType.WASM,
        };
      } else {
        const isNativeAsset = asset?.id === "-1";

        let _tx;
        const _amount = isNativeAsset
          ? amount * currencyUnits
          : amount * 10 ** (asset?.decimals || 0 as number);

        const bnAmount = BigNumber.from(
          _amount.toLocaleString("fullwide", { useGrouping: false })
        );

        if (isXcm) {
          const { method, extrinsicValues } = XCM_MAPPING[selectedChain.name][
            to.name
          ]({
            address: destinationAddress,
            amount: bnAmount,
            assetSymbol: asset.symbol,
            xcmPalletVersion: "",
          }) as MapResponseEVM;

          // TODO: refactor
          _tx = await (tx?.tx as Contract)[method](
            ...Object.keys(extrinsicValues).map(
              (key) =>
                extrinsicValues[
                key as
                | "currency_address"
                | "amount"
                | "destination"
                | "weight"
                ]
            ),
            {
              gasLimit: tx?.fee["gas limit"],
              maxFeePerGas: tx?.fee["max fee per gas"],
              maxPriorityFeePerGas: tx?.fee["max priority fee per gas"],
              type: 2,
            }
          );
        } else if (isNativeAsset) {
          _tx = await tx?.sender.sendTransaction({
            ...tx.tx,
          });
        } else {
          _tx = await (tx?.tx as Contract).transfer(
            destinationAddress,
            bnAmount,
            {
              gasLimit: tx?.fee["gas limit"],
              maxFeePerGas: tx?.fee["max fee per gas"],
              maxPriorityFeePerGas: tx?.fee["max priority fee per gas"],
            }
          );
        }

        txToSend.tx = {
          txHash: _tx.hash,
          type: AccountType.EVM,
        };
      }

      const { id } = await WebAPI.windows.getCurrent();

      await WebAPI.runtime.sendMessage({
        from: "popup",
        origin: "kuma",
        method: "process_tx",
        popupId: id,
        tx: txToSend,
      });

      showSuccessToast(t("tx_send"));
      navigate(BALANCE, {
        state: {
          tab: "activity",
        },
      });
    } catch (error) {
      showErrorToast(error);
    }
    endLoading();
  };

  return (
    <PageWrapper contentClassName="bg-[#29323C] h-full">
      <FormProvider {...methods}>
        {!tx ? (
          <div className="mx-auto">
            <div className="flex gap-3 items-center mb-7">
              <FiChevronLeft
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
