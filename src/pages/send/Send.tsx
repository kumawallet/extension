import {
  InputErrorMessage,
  Loading,
  LoadingButton,
  PageWrapper,
} from "@src/components/common";
import { useTranslation } from "react-i18next";
import { TbChevronRight } from "react-icons/tb";
import { SelectableChain } from "./components/SelectableChain";
import Extension from "@src/Extension";
import { Destination } from "./components/Destination";
import { useEffect, useMemo, useState, useCallback } from "react";
import { SelectableAsset } from "./components/SelectableAsset";
import { NumericFormat } from "react-number-format";
import { FormProvider, useForm } from "react-hook-form";
import { useNetworkContext } from "@src/providers";
import { yupResolver } from "@hookform/resolvers/yup";
import { number, object, string } from "yup";
import { ethers } from "ethers";
import { useToast } from "@src/hooks";
import { useAccountContext } from "@src/providers/accountProvider/AccountProvider";
import { ApiPromise } from "@polkadot/api";
import { decodeAddress, encodeAddress, Keyring } from "@polkadot/keyring";
import Record from "@src/storage/entities/activity/Record";
import {
  RecordType,
  RecordStatus,
  TransferData,
} from "@src/storage/entities/activity/types";
import { useNavigate } from "react-router-dom";
import { BALANCE } from "@src/routes/paths";
import { BiLeftArrowAlt } from "react-icons/bi";
import { isHex } from "@polkadot/util";
import { isAddress } from "ethers/lib/utils";

export const Send = () => {
  const { t } = useTranslation("send");
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const {
    state: { selectedChain, api },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

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
  const {
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const amount = watch("amount");
  const destinationAccount = watch("destinationAccount");
  const destinationIsInvalid = Boolean(errors?.destinationAccount?.message);

  console.log({
    destinationIsInvalid,
    destinationAccount,
    errors,
  });

  const [extrinsic, setExtrinsic] = useState<any>(null);
  const [evmFees, setEvmFees] = useState<any>({});
  const [wasmFees, setWasmFees] = useState<any>({});
  const [loadingFee, setLoadingFee] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [evmTx, setEvmTx] = useState<
    ethers.utils.Deferrable<ethers.providers.TransactionRequest>
  >({
    to: "",
    value: 0,
    maxPriorityFeePerGas: 0,
    maxFeePerGas: 0,
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSendingTx(true);
    try {
      let hash = "";
      let date;
      let reference = "";

      if (selectedAccount?.type?.includes("EVM")) {
        const pk = await Extension.showPrivateKey();

        const wallet = new ethers.Wallet(
          pk as string,
          api as ethers.providers.JsonRpcProvider
        );

        const res = await wallet.sendTransaction({
          ...evmTx,
          value: Number(
            Number(evmTx.value) *
              10 ** (selectedChain?.nativeCurrency?.decimals || 1)
          ),
        });

        hash = res.hash;
        date = Date.now();
        reference = "evm";
      } else {
        const seed = await Extension.showSeed();

        const keyring = new Keyring({ type: "sr25519" });
        const sender = keyring.addFromMnemonic(seed as string);
        const unsub = await extrinsic?.signAndSend(
          sender,
          async ({ events, status, txHash, ...rest }) => {
            console.log(`Current status is ${status.type}`);

            if (status.isInBlock) {
              console.log("Included at block hash", status.asInBlock.toHex());
              console.log("Events:");
            }

            if (status.isFinalized) {
              const failedEvents = events.filter(({ event }) =>
                api.events.system.ExtrinsicFailed.is(event)
              );

              console.log("failed events", failedEvents);

              if (failedEvents.length > 0) {
                console.log("update to failed");
              } else {
                let number = 0;

                events.forEach(
                  ({ event: { data, method, section }, phase, ...evt }) => {
                    // console.log("evt", evt);

                    number = phase.toJSON().applyExtrinsic;

                    console.log(
                      "\t",
                      phase.toString(),
                      `: ${section}.${method}`,
                      data.toString()
                    );
                  }
                );

                const { block } = await (api as ApiPromise).rpc.chain.getBlock(
                  status.asFinalized.toHex()
                );
                const extrinsic = `${block.header.number.toNumber()}-${number}`;
                // console.log("block", `${blockNumber}-${number}`);
                // console.log("Finalized block hash", status.asFinalized.toHex());

                date = Date.now();
                reference = "wasm";
                const activity = {
                  address: destinationAccount,
                  type: RecordType.TRANSFER,
                  reference,
                  hash: extrinsic,
                  status: RecordStatus.PENDING,
                  createdAt: date,
                  lastUpdated: date,
                  error: undefined,
                  network: selectedChain?.name || "",
                  recipientNetwork: selectedChain?.name || "",
                  data: {
                    symbol: String(selectedChain?.nativeCurrency.symbol),
                    from: selectedAccount.value.address,
                    to: destinationAccount,
                    gas: "0",
                    gasPrice: "0",
                    value: amount,
                  } as TransferData,
                };

                await Extension.addActivity(hash, activity as Record);
                showSuccessToast(t("tx_saved"));
                navigate(BALANCE);
              }

              unsub();
            }
          }
        );
      }
    } catch (error) {
      console.log(error);
      showErrorToast(error as string);
    } finally {
      setIsSendingTx(false);
    }
  });

  const formatEthAmount = useCallback(
    (amount: any, unitName?: any) => {
      return ethers.utils.formatUnits(
        amount,
        unitName || (selectedChain?.nativeCurrency.decimals as number)
      );
    },
    [selectedChain?.nativeCurrency.decimals]
  );

  useEffect(() => {
    if (!evmTx?.to) return;
    (async () => {
      try {
        if (selectedAccount?.type?.includes("EVM")) {
          const [feeData, gasLimit] = await Promise.all([
            (api as ethers.providers.JsonRpcProvider).getFeeData(),
            (api as ethers.providers.JsonRpcProvider).estimateGas(evmTx),
          ]);

          setEvmFees({
            gasLimit: gasLimit,
            lastBaseFeePerGas: feeData.lastBaseFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          });

          setEvmTx(
            (prevState) =>
              ({
                ...prevState,
                gasLimit,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
              } as any)
          );
        }
      } catch (error) {
        showErrorToast(error);
      } finally {
        setLoadingFee(false);
      }
    })();
  }, [evmTx?.to]);

  useEffect(() => {
    if (destinationIsInvalid) {
      setEvmTx({});
      setWasmFees({});
      return;
    }

    if (selectedAccount?.type?.includes("EVM")) {
      setEvmTx((prevState) => ({
        ...prevState,
        value: amount,
        to: destinationAccount || "",
      }));
      return;
    }

    if (!destinationAccount || amount <= 0) return;

    setLoadingFee(true);

    const getData = setTimeout(async () => {
      try {
        const currencyUnits =
          10 ** (selectedChain?.nativeCurrency.decimals || 1);

        const _amount = Number(amount) * currencyUnits;

        const extrinsic = await (api as ApiPromise).tx.balances.transfer(
          destinationAccount,
          _amount
        );

        setExtrinsic(extrinsic);

        const seed = await Extension.showSeed();

        const keyring = new Keyring({ type: "sr25519" });
        const sender = keyring.addFromMnemonic(seed as string);

        const { weight, partialFee } = await extrinsic.paymentInfo(sender);

        const fee = partialFee.toNumber() / currencyUnits;

        const currencySymbol = selectedChain?.nativeCurrency.symbol;

        const total = (partialFee.toNumber() + _amount) / currencyUnits;

        setWasmFees({
          "estimated fee": `${fee} ${currencySymbol}`,
          "weight ref time": weight.toJSON().refTime,
          "weight proof size": weight.toJSON().proofSize,
          "estimated total": `${total} ${currencySymbol}`,
        });
      } catch (error) {
        console.error(error);
      }
      setLoadingFee(false);
    }, 1000);

    return () => clearTimeout(getData);
  }, [amount, destinationAccount, destinationIsInvalid]);

  const originAccountIsEVM = selectedAccount?.type?.includes("EVM");

  const canContinue = Number(amount) > 0 && destinationAccount && !loadingFee;

  return (
    <PageWrapper contentClassName="bg-[#29323C]">
      <FormProvider {...methods}>
        <div className="mx-auto">
          <div className="flex gap-3 items-center mb-7">
            <BiLeftArrowAlt
              size={26}
              className="cursor-pointer"
              onClick={() => navigate(-1)}
            />

            <p className="text-xl">{t("title")}</p>
          </div>

          <div className="flex gap-2 justify-center items-end mb-4">
            <div className="px-2">
              <p className="mb-2">From:</p>
              <SelectableChain selectedChain={getValues("from")} />
            </div>
            <TbChevronRight size={26} className="mb-2" />
            <div className="px-2">
              <p className="mb-2">To:</p>
              <SelectableChain
                canSelectChain={true}
                selectedChain={getValues("to")}
                optionChains={[]}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 mb-3">
            <div>
              <p>{t("destination_account")}</p>
              <Destination
                onSelectedAccount={(account) =>
                  // setValue("destinationAccount", account)
                  null
                }
              />
              <InputErrorMessage
                message={errors.destinationAccount?.message as string}
              />
            </div>
            <div>
              <p>{t("amount")}</p>
              <div className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white">
                <NumericFormat
                  className="bg-transparent w-8/12 outline-0"
                  allowNegative={false}
                  allowLeadingZeros={false}
                  value={getValues("amount")}
                  onValueChange={({ value }) => {
                    setValue("amount", value);
                  }}
                  allowedDecimalSeparators={["%"]}
                />

                <div className="w-4/12">
                  <SelectableAsset
                    onChangeAsset={(asset) => setValue("asset", asset)}
                  />
                </div>
              </div>
              <InputErrorMessage message={errors.amount?.message as string} />
            </div>
            {loadingFee ? (
              <Loading />
            ) : (
              <div className="flex flex-col gap-1">
                {Object.keys(originAccountIsEVM ? evmFees : wasmFees).map(
                  (key) => (
                    <div key={key} className="flex justify-between">
                      <p>{key}</p>
                      <p>
                        {originAccountIsEVM
                          ? `${Number(evmFees[key])} gwei`
                          : wasmFees[key]}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <LoadingButton
            classname="font-medium text-base bg-custom-green-bg w-full py-2 md:py-4 rounded-md"
            onClick={onSubmit}
            isLoading={isSendingTx}
            isDisabled={!canContinue}
          >
            {t("continue")}
          </LoadingButton>
        </div>
      </FormProvider>
    </PageWrapper>
  );
};
