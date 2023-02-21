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
import { useForm } from "react-hook-form";
import { useNetworkContext } from "@src/providers";
import { yupResolver } from "@hookform/resolvers/yup";
import { number, object } from "yup";
import { ethers } from "ethers";
import { useToast } from "@src/hooks";
import { useAccountContext } from "@src/providers/AccountProvider";

export const Send = () => {
  const { t } = useTranslation("send");
  const { showErrorToast } = useToast();

  const {
    state: { selectedChain, api },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const schema = useMemo(() => {
    return object({
      from: object().required(t("required") as string),
      to: object().required(t("required") as string),
      destinationAccount: object().required(t("required") as string),
      amount: number().required(t("required") as string),
      asset: object().required(t("required") as string),
    }).required();
  }, []);

  const {
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      from: selectedChain,
      to: selectedChain,
      destinationAccount: "",
      amount: 0,
      asset: selectedChain?.nativeCurrency,
    },
    resolver: yupResolver(schema),
  });

  const [evmFees, setEvmFees] = useState({});
  const [loadingFee, setLoadingFee] = useState(true);
  const [isSendingTx, setIsSendingTx] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    //
    try {
      setIsSendingTx(true);
      // ethers.providers.JsonRpcProvider
      const tx = {
        // from: selectedAccount.value.address,
        to: data.destinationAccount.address,
        value: ethers.utils.parseEther(String(data.amount)),
      };

      const pk = await Extension.showPrivateKey();

      console.log({
        tx,
        pk,
      });

      const wallet = new ethers.Wallet(
        pk as string,
        api as ethers.providers.JsonRpcProvider
      );

      const res = await wallet.sendTransaction(tx);
      res.wait();
      console.log("tx result", res);
    } catch (error) {
      console.log(error);
      showErrorToast(error as string);
    } finally {
      setIsSendingTx(false);
    }
  });

  const formatEthAmount = useCallback(
    (amount: any) => {
      return ethers.utils.formatUnits(
        amount,
        selectedChain?.nativeCurrency.decimals as number
      );
    },
    [selectedChain?.nativeCurrency.decimals]
  );

  useEffect(() => {
    (async () => {
      try {
        const feeData = await (
          api as ethers.providers.JsonRpcProvider
        ).getFeeData();

        const gas = formatEthAmount(feeData.gasPrice);
        const lastBaseFeePerGas = formatEthAmount(feeData.lastBaseFeePerGas);
        const maxFeePerGas = formatEthAmount(feeData.maxFeePerGas);
        const maxPriorityFeePerGas = formatEthAmount(
          feeData.maxPriorityFeePerGas
        );

        setEvmFees({
          gas,
          lastBaseFeePerGas,
          maxFeePerGas,
          maxPriorityFeePerGas,
        });
      } catch (error) {
        showErrorToast(error);
      } finally {
        setLoadingFee(false);
      }
    })();
  }, []);

  return (
    <PageWrapper contentClassName="bg-[#29323C]">
      <div className="mx-auto">
        <div className="mb-7">
          <p className="font-medium text-2xl">{t("title")}</p>
        </div>
        <div className="flex gap-2 justify-center items-end">
          <div className="px-2">
            <p className="mb-2">From:</p>
            <SelectableChain selectedChain={getValues("from")} />
          </div>
          <TbChevronRight size={26} />
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
                setValue("destinationAccount", account)
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
              {selectedAccount.type.includes("EVM") ? (
                <>
                  {Object.keys(evmFees).map((key) => (
                    <div key={key} className="flex justify-between">
                      <p>{key}</p>
                      <p>{evmFees[key]}</p>
                    </div>
                  ))}
                </>
              ) : (
                <></>
              )}
            </div>
          )}
        </div>

        <LoadingButton
          classname="font-medium text-base bg-custom-green-bg w-full py-2 md:py-4 rounded-md"
          onClick={onSubmit}
          isLoading={isSendingTx}
        >
          {t("continue")}
        </LoadingButton>
      </div>
    </PageWrapper>
  );
};
