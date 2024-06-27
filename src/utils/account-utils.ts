import { isHex } from "@polkadot/util";
import { decodeAddress, encodeAddress, isAddress } from "@polkadot/util-crypto";
import { ASSETS_ICONS } from "@src/constants/assets-icons";
import { PASSWORD_REGEX, PRIVATE_KEY_OR_SEED_REGEX } from "./constants";

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

  if (_account.includes("OL")) {
    address = _account.slice(3);
    type = "OL";
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

export const iconURL = (type: string) => {
  if (type.toLowerCase().includes("wasm")) {
    return ASSETS_ICONS["DOT"];
  }

  if (type.toLowerCase().includes("evm")) {
    return ASSETS_ICONS["ETH"];
  }

  if (type.toLowerCase().includes("ol")) {
    return ASSETS_ICONS["OL"];
  }

  return "";
};

export const validatePasswordFormat = (password: string) => {
  if (!password) throw new Error("password_required");
  if (!PASSWORD_REGEX.test(password)) throw new Error("password_invalid");
};

export const validatePrivateKeyOrSeedFormat = (privateKeyOrSeed: string) => {
  if (!privateKeyOrSeed) throw new Error("private_key_or_seed_required");
  if (!PRIVATE_KEY_OR_SEED_REGEX.test(privateKeyOrSeed))
    throw new Error("private_key_or_seed_invalid");
};
