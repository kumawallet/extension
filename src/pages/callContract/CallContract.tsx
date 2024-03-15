import {
  Button,
  PageWrapper,
  ReEnterPassword,
} from "@src/components/common";
import { useLoading, useToast } from "@src/hooks";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronRight } from "react-icons/fa";
import { ContractPromise } from "@polkadot/api-contract";
import { BN0, BigNumber0, PROOF_SIZE, REF_TIME } from "@src/constants/assets";
import { formatBN } from "@src/utils/assets";
import { BN } from "@polkadot/util";
import { Keyring } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { getWebAPI } from "@src/utils/env";
import { BigNumber, Contract, ethers, utils } from "ethers";
import { messageAPI } from "@src/messageAPI/api";

const WebAPI = getWebAPI();

interface Params {
  address: string;
  abi: string;
  method: string;
  params: string | any;
  value?: string | any;
}

interface CallContractProps {
  params?: Params;
  onClose?: () => void;
  metadata?: Record<string, string>;
}

const defaultWasmFees = {
  "estimated fee": BN0,
  "estimated total": BN0,
};

const defaultEVMFees = {
  "gas limit": BigNumber0,
  "max fee per gas": BigNumber0,
  "max priority fee per gas": BigNumber0,
  "estimated fee": BigNumber0,
  "estimated total": BigNumber0,
};

export const CallContract: FC<CallContractProps> = ({
  metadata,
  onClose,
  params,
}) => {
  const {
    abi,
    address,
    method,
    params: contractParams,
    value,
  } = params || ({} as Params);
  const { t } = useTranslation("send");

  const { showErrorToast } = useToast();
  const { isLoading, starLoading, endLoading } = useLoading();

  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [fees, setFees] = useState<
    typeof defaultEVMFees | typeof defaultWasmFees
  >({} as typeof defaultEVMFees | typeof defaultWasmFees);
  const [tx, setTx] = useState<any>(null);
  const [canSign, setCanSign] = useState(false);

  useEffect(() => {
    if (!selectedChain?.type) return;

    if (selectedChain.type === "wasm") {
      setFees(defaultWasmFees);
    } else {
      setFees(defaultEVMFees);
    }
  }, [selectedChain]);

  const init = async () => {
    starLoading();
    try {
      if (selectedChain?.type === "wasm") {
        const contract = new ContractPromise(api, abi, address);

        const _params: any = [];

        contractParams &&
          Object.keys(contractParams).forEach((key) => {
            _params.push(contractParams[key]);
          });

        if (value) {
          _params.push({
            value: typeof value === "string" ? new BN(value) : value,
          });
        }

        const { gasRequired, output } = await contract.query[method](
          selectedAccount.value.address,
          {
            gasLimit: api.registry.createType("WeightV2", {
              refTime: REF_TIME,
              proofSize: PROOF_SIZE,
            }),
          },
          ..._params
        );

        if (output?.toString() === "Ok") {
          const extrinsic = contract.tx[method](
            {
              gasLimit: api.registry.createType("WeightV2", gasRequired),
            },
            ..._params
          );

          const { proofSize: _proofSize, refTime: _refTime } =
            gasRequired.toJSON();

          const estimatedFee = new BN(String(_proofSize)).add(
            new BN(String(_refTime))
          );

          setFees({
            "estimated fee": estimatedFee,
            "estimated total": estimatedFee,
          });
          setTx(extrinsic);
        } else {
          setTx(output?.toHuman());

          setFees({
            "estimated fee": BN0,
            "estimated total": BN0,
          });
        }
      } else {
        if (!address.startsWith("0x")) throw new Error("invalid_address");

        const seed = await messageAPI.showKey();
        const wallet = new ethers.Wallet(
          seed as string,
          api as ethers.providers.JsonRpcProvider
        );

        const contract = new ethers.Contract(address, abi, wallet);

        const _params: any = [];

        contractParams &&
          Object.keys(contractParams).forEach((key) => {
            _params.push(contractParams[key]);
          });

        if (value) {
          _params.push({
            value: typeof value === "string" ? utils.parseEther(value) : value,
          });
        }

        const result = await contract.callStatic[method](..._params);

        if (result === true || Array.isArray(result)) {
          const feeData = await api.getFeeData();
          const gasLimit = await contract.estimateGas[method](..._params);

          const _gasLimit = gasLimit;
          const _maxFeePerGas = feeData.maxFeePerGas as ethers.BigNumber;
          const _maxPriorityFeePerGas =
            feeData.maxPriorityFeePerGas as ethers.BigNumber;

          const avg = _maxFeePerGas
            .add(_maxPriorityFeePerGas)
            .div(BigNumber.from(2));
          const estimatedTotal = avg.mul(_gasLimit);

          setFees({
            "gas limit": _gasLimit,
            "max fee per gas": feeData.maxFeePerGas as BigNumber,
            "max priority fee per gas":
              feeData.maxPriorityFeePerGas as BigNumber,
            "estimated fee": avg,
            "estimated total": estimatedTotal,
          });

          setTx(contract);
        }
      }
      setCanSign(true);
    } catch (error) {
      const _error = String(error);

      if (
        _error.includes("Invalid decoded address") ||
        _error.includes("bad address") ||
        _error.includes("invalid address")
      ) {
        return showErrorToast(t("invalid_contract_address"));
      }

      if (_error.includes("is not a function")) {
        return showErrorToast(t("invalid_method"));
      }

      if (
        _error.includes("arguments") ||
        _error.includes("Unknown type") ||
        _error.includes("argument")
      ) {
        return showErrorToast(t("invalid_params"));
      }

      if (_error.includes("map")) {
        return showErrorToast(t("invalid_abi"));
      }

      showErrorToast(t("contract_error"));
    }
    endLoading();
  };

  useEffect(() => {

    if (!api) return;
    (async () => {
      const isAuthorized = await messageAPI.isAuthorized();

      if (!isAuthorized) {
        return;
      }

      init();
    })();
  }, [params, api]);

  const send = async () => {
    const seed = await messageAPI.showKey();
    const { id } = await WebAPI.windows.getCurrent();

    starLoading();
    try {
      if (selectedChain?.type === "wasm") {
        if (typeof tx === "string") {
          await WebAPI.runtime.sendMessage({
            from: "popup",
            origin: metadata?.origin,
            method: `${metadata?.method}_response`,
            fromWindowId: id,
            toTabId: metadata?.tabId,
            response: tx,
          });

          return;
        }
        const keyring = new Keyring({ type: "sr25519" });
        const sender = keyring.addFromMnemonic(seed as string);
        // wasm
        const response = await (
          tx as SubmittableExtrinsic<"promise">
        ).signAndSend(sender);
        await WebAPI.runtime.sendMessage({
          from: "popup",
          origin: metadata?.origin,
          method: `${metadata?.method}_response`,
          fromWindowId: id,
          toTabId: metadata?.tabId,
          response,
        });
      } else {
        if (tx instanceof Contract === false) {
          await WebAPI.runtime.sendMessage({
            from: "popup",
            origin: metadata?.origin,
            method: `${metadata?.method}_response`,
            fromWindowId: id,
            toTabId: metadata?.tabId,
            response: tx,
          });
          return;
        }

        const _params: any = [];

        contractParams &&
          Object.keys(contractParams).forEach((key) => {
            _params.push(contractParams[key]);
          });

        if (value) {
          _params.push({
            value: typeof value === "string" ? utils.parseEther(value) : value,
          });
        }

        const txResult = await (tx as Contract)[method](..._params);

        await WebAPI.runtime.sendMessage({
          from: "popup",
          origin: metadata?.origin,
          method: `${metadata?.method}_response`,
          fromWindowId: id,
          toTabId: metadata?.tabId,
          response: txResult,
        });
      }
    } catch (error) {
      showErrorToast(error);
    }
    endLoading();
  };

  return (
    <PageWrapper contentClassName="h-full">
      <ReEnterPassword cb={init} />
      <div className="flex flex-col mx-auto h-full py-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <img
              src={selectedChain?.logo}
              width={20}
              className="object-cover rounded-full"
            />
            <p className="text-xl">{selectedChain?.name}</p>
          </div>

          <div className="flex gap-2 items-center justify-center mb-5">
            <div
              className="flex justify-around items-center bg-[#212529] rounded-xl py-3 px-5 gap-1 w-5/12"
              style={{
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
            >
              <p className="text-ellipsis overflow-hidden">
                {selectedAccount?.value?.address}
              </p>
            </div>

            <FaChevronRight />
            <div
              className="flex justify-around items-center bg-[#212529] rounded-xl py-3 px-5 gap-1 w-5/12"
              style={{
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
            >
              <p className="text-ellipsis overflow-hidden">{address}</p>
            </div>
          </div>

          <div>
            <div className="mb-5">
              <p>{t("method")}:</p>
              <div className="flex bg-gray-700 border-gray-600 rounded-xl p-4">
                <p className="text-ellipsis overflow-hidden">{method}()</p>
              </div>
            </div>

            {Object.keys(contractParams).length > 0 && (
              <>
                <p>{t("params")}:</p>
                <div className="flex flex-col gap-2 p-4 bg-gray-700 border-gray-600">
                  {Object.keys(contractParams).map((key, index) => (
                    <p key={index} className="overflow-hidden text-ellipsis">
                      {key}: {String(contractParams[key])}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {Object.keys(fees).length > 0 && (
          <div className="flex flex-col gap-1 w-full py-2">
            {selectedChain?.type === "evm" && (
              <div className="flex justify-between gap-2">
                <p>{t("gas_limit")}</p>
                <p className="font-bold">
                  {String((fees as typeof defaultEVMFees)["gas limit"])} gwei
                </p>
              </div>
            )}

            <div className="flex justify-between gap-2">
              <p>{t("estimated_fee")}</p>
              <p>
                {formatBN(
                  String(fees["estimated fee"]),
                  selectedChain?.decimals
                )}
              </p>
            </div>

            <div className="flex justify-between gap-2">
              <p>{t("estimated_total")}</p>

              <p className="font-bold">
                {`${formatBN(
                  String(fees["estimated total"]),
                  selectedChain?.decimals
                )} ${selectedChain?.symbol}`}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            isDisabled={isLoading}
            isLoading={isLoading}
            onClick={onClose}
          >
            {t("cancel")}
          </Button>
          <Button
            isDisabled={isLoading || !canSign}
            isLoading={isLoading}
            onClick={send}
          >
            {t("sign")}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};
