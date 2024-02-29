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
import { Chain, IAsset, SendForm, Tx } from "@src/types";
import { BigNumber, Contract } from "ethers";
import { XCM_MAPPING } from "@src/xcm/extrinsics";
import { MapResponseEVM } from "@src/xcm/interfaces";
import { isValidAddress } from "@src/utils/account-utils";
import { formatBN } from "@src/utils/assets";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";

export const Send = () => {
  const { t } = useTranslation("send");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();
  const { isLoading, starLoading, endLoading } = useLoading();

  const {
    state: { selectedChain, },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [tx, setTx] = useState<Tx | null>();

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
      from: selectedChain as Chain,
      to: selectedChain as Chain,
      destinationAccount: "",
      amount: 0,
      asset: {},
      isXcm: false,
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const { getValues } = methods;

  const decimals = selectedChain?.decimals || 1;
  const currencyUnits = 10 ** decimals;

  const asset = getValues("asset") as IAsset;
  const amount = getValues("amount");

  const sendTx = async () => {
    starLoading();
    const amount = getValues("amount");
    const destinationAddress = getValues("destinationAccount");
    const originAddress = selectedAccount.value.address;
    const asset = getValues("asset") as IAsset;
    const destinationNetwork = getValues("to").name;
    const isXcm = getValues("isXcm");
    const to = getValues("to");

    try {
      if (tx?.type === AccountType.WASM) {
        await messageAPI.sendSubstrateTx({
          hexExtrinsic: tx.tx,
          amount: amount.toString(),
          asset: {
            id: asset.id,
            symbol: asset.symbol || "",
          },
          destinationAddress,
          originAddress,
          destinationNetwork,
          networkName: selectedChain?.name || "",
          rpc: selectedChain?.rpcs[0] as string,
        })

      } else {
        const isNativeAsset = asset?.id === "-1";

        let _tx;
        const _amount = isNativeAsset
          ? amount * currencyUnits
          : amount * 10 ** (asset?.decimals || (0 as number));

        const bnAmount = BigNumber.from(
          _amount.toLocaleString("fullwide", { useGrouping: false })
        );

        if (isXcm) {
          const { method, extrinsicValues } = XCM_MAPPING[selectedChain!.name][
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
              gasLimit: tx?.fee.gasLimit,
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
              gasLimit: tx?.fee.gasLimit,
              maxFeePerGas: tx?.fee["max fee per gas"],
              maxPriorityFeePerGas: tx?.fee["max priority fee per gas"],
            }
          );
        }

        // async to avoid waiting for the tx to be mined
        messageAPI.sendEvmTx({
          txHash: _tx.hash as string,
          fee: {
            gasLimit: tx?.fee.gasLimit?.toString() || "",
            maxFeePerGas: tx?.fee["max fee per gas"]?.toString() || "",
            maxPriorityFeePerGas: tx?.fee["max priority fee per gas"]?.toString() || "",
          },
          amount: amount.toString(),
          asset: {
            id: asset.id,
            symbol: asset.symbol || "",
          },
          destinationAddress,
          originAddress,
          destinationNetwork,
          networkName: selectedChain?.name || "",
          rpc: selectedChain?.rpcs[0] as string,
        })
      }
      showSuccessToast(t("tx_send"));
      navigate(BALANCE, {
        state: {
          tab: "activity",
        },
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _error: any = error;
      showErrorToast(_error?.body || _error?.error?.message || _error.message || _error);
      captureError(_error)
    }
    endLoading();
  };

  const estimatedTotal =
    asset?.id === "-1"
      ? `${formatBN(
        tx?.fee.estimatedTotal.toString() || "",
        asset.decimals,
        8
      )} ${asset?.symbol}`
      : `${amount} ${asset?.symbol} + ${formatBN(
        tx?.fee.estimatedTotal.toString() || "",
        asset.decimals,
        8
      )} ${selectedChain?.symbol}`;

  return (
    <PageWrapper contentClassName="bg-[#29323C] h-full flex-1">
      <FormProvider {...methods}>
        {!tx ? (
          <div className="mx-auto">
            <div className="flex gap-3 items-center mb-7">
              <FiChevronLeft
                size={26}
                className="cursor-pointer"
                onClick={() => navigate(-1)}
              />

              <p className="text-lg">{t("title")}</p>
            </div>

            {selectedChain?.type === "wasm" ? (
              <WasmForm confirmTx={setTx} />
            ) : (
              <EvmForm confirmTx={setTx} />
            )}
          </div>
        ) : (
          <ConfirmTx
            fee={{
              gasLimit:
                tx.type === AccountType.EVM ? tx.fee.gasLimit.toString() : "",
              estimatedFee: `${formatBN(
                tx.fee.estimatedFee.toString(),
                asset?.decimals,
                10
              )} ${selectedChain?.symbol || ""}`,
              estimatedTotal: estimatedTotal,
            }}
            onConfirm={sendTx}
            isLoading={isLoading}
            onBack={() => setTx(null)}
          />
        )}
      </FormProvider>
    </PageWrapper>
  );
};
