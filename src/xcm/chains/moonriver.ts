import { numberToHex, u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import xTokensAbi from "@src/abi/xtokens_moonbeam_abi.json";
import {
  PARACHAINS,
  POLKADOT_PARACHAINS,
  RELAY_CHAINS,
} from "@src/constants/chains";
import { Map } from "../interfaces";

export const MOONRIVER_EXTRINSICS: { [key: string]: Map } = {
  [RELAY_CHAINS.KUSAMA]: ({ address, amount }) => {
    const _address =
      "0x01" + u8aToHex(decodeAddress(address), undefined, false) + "00";

    return {
      contractAddress: "0x0000000000000000000000000000000000000804",
      abi: xTokensAbi as unknown,
      method: "transfer",
      extrinsicValues: {
        currency_address: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080", //asset address
        amount: amount.toString(),
        destination: [1, [_address]],
        weight: "4000000000", // Weight
      },
    };
  },

  [PARACHAINS.SHIDEN]: ({ address, amount, assetSymbol }) => {
    const addressIsHex = address.startsWith("0x");

    const _address = addressIsHex
      ? "0x03" + address.slice(2) + "00"
      : "0x01" + u8aToHex(decodeAddress(address), undefined, false) + "00";

    let currency_address = "";

    switch (assetSymbol?.toLowerCase()) {
      case "movr": {
        currency_address = "0x0000000000000000000000000000000000000802";
        break;
      }
      case "xcsdn": {
        currency_address = "0xFFFfffFF0Ca324C842330521525E7De111F38972";
        break;
      }
      default:
        throw new Error("Invalid asset symbol");
    }

    return {
      contractAddress: "0x0000000000000000000000000000000000000804",
      abi: xTokensAbi as unknown,
      method: "transfer",
      extrinsicValues: {
        currency_address, //asset address
        amount: amount.toString(),
        destination: [
          1,
          [
            "0x00" +
              "0000" +
              numberToHex(POLKADOT_PARACHAINS.ASTAR.id).split("0x")[1],
            _address,
          ],
        ],
        weight: "4000000000", // Weight
      },
    };
  },
};

enum MOONRIVER_ASSETS {
  MOVR = "MOVR",
  xcKSM = "xcKSM",
  xcSDN = "xcSDN",
}

export const MOONRIVER_ASSETS_MAPPING = {
  [RELAY_CHAINS.KUSAMA]: [MOONRIVER_ASSETS.xcKSM],
  [PARACHAINS.SHIDEN]: [MOONRIVER_ASSETS.MOVR, MOONRIVER_ASSETS.xcSDN],
};
