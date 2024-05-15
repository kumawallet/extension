import { isHex } from "@polkadot/util";
import { decodeAddress, encodeAddress, isAddress } from "@polkadot/util-crypto";

export const cropAccount = (account: string, length = 4) => {
  if (!account) return "";
  const firstLetters = account.slice(0, length);

  const lastLetters = account.slice(account.length - length, account.length);

  return `${firstLetters}...${lastLetters}`;
};

export const formatAccount = (_account: string) => {
  let address = "";
  let type = "";

  if (_account.includes("EVM")) {
    address = _account.slice(4);
    type = "EVM";
  }

  if (_account.includes("WASM")) {
    address = _account.slice(5);
    type = "WASM";
  }

  return { address, type };
};

export const transformAddress = (
  address: string,
  addressPrefix: number | undefined = 0
) => {
  if (!address) return "";

  if (address.startsWith("0x") || address.length === 64) return address;

  const publicKey = decodeAddress(address);

  const formattedAddress = encodeAddress(publicKey, addressPrefix);

  return formattedAddress;
};

export const getAccountType = (accountType = "") => {
  if (accountType.includes("IMPORTED_")) {
    return accountType.split("IMPORTED_")[1];
  }

  return accountType;
};

export const isValidAddress = (
  address: string | undefined,
  addressType?: "evm" | "wasm"
) => {
  if (!address) return false;

  const validateEVM = addressType || addressType === "evm";
  const validateWASM = addressType || addressType === "wasm";

  try {
    if (validateEVM && isHex(address)) {
      return isAddress(address);
    } else if (validateWASM) {
      encodeAddress(decodeAddress(address));
    }

    return true;
  } catch (error) {
    return false;
  }
};
