import { decodeAddress } from "@polkadot/util-crypto";
import { utils } from "ethers";

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
  type: "evm" | "wasm"
): boolean => {
  try {
    if (type === "evm" && address.length === 42) {
      return utils.isAddress(address);
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
