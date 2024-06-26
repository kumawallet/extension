import { decodeAddress } from "@polkadot/util-crypto";
import { Chain, Transaction } from "@src/types";
import { isAddress, FeeData } from "ethers";

const EVM_ERRORS = [
  "execution reverted: ERC20: transfer amount exceeds balance",
  "insufficient funds for intrinsic transaction cost",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isKnownEstimatedFeeError = (error: any): boolean => {
  const reason = error?.reason;

  if (reason && EVM_ERRORS.includes(reason)) {
    return true;
  }

  return false;
};

export const validateRecipientAddress = (
  address: string,
  type: "evm" | "wasm" | "ol"
): boolean => {
  try {
    if (type === "ol") {
      return address.length === 64;
    }

    if (type === "evm" && address.length === 42) {
      return isAddress(address);
    }

    if (type === "wasm") {
      decodeAddress(address);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

export const getTxLink = (chain: Chain, transaction: Transaction) => {
  const chainType = chain?.type;
  if (chainType === "wasm") {
    return `${chain?.explorer}/extrinsic/${transaction.hash}`;
  }

  if (chainType === "evm") {
    return `${chain?.explorer}/tx/${transaction.hash}`;
  }

  if (chainType === "ol") {
    return `${chain?.explorer}/transactions/${transaction.version}`;
  }
};

export const getEVMFee = ({
  feeData,
  gasLimit,
}: {
  feeData: FeeData;
  gasLimit: bigint;
}) => {
  return (
    (feeData?.maxFeePerGas || BigInt(0)) * gasLimit +
    (feeData?.maxPriorityFeePerGas || BigInt(0))
  );
};
