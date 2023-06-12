import { numberToHex, u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import {
  PARACHAINS,
  POLKADOT_PARACHAINS,
  RELAY_CHAINS,
} from "@src/constants/chains";
import xTokensAbi from "@src/abi/xtokens_moonbeam_abi.json";
import { Map } from "../interfaces";

export const MOONBEAM_EXTRINSICS: { [key: string]: Map } = {
  [RELAY_CHAINS.POLKADOT]: ({ address, amount }) => {
    const _address =
      "0x01" + u8aToHex(decodeAddress(address), undefined, false) + "00";

    return {
      contractAddress: "0x0000000000000000000000000000000000000804",
      abi: xTokensAbi,
      method: "transfer",
      extrinsicValues: {
        currency_address: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080", //asset address
        amount: amount.toString(),
        destination: [1, [_address]] as unknown,
        weight: "4000000000", // Weight
      },
    };
  },

  [PARACHAINS.ASTAR]: ({ address, amount, assetSymbol }) => {
    const addressIsHex = address.startsWith("0x");

    const _address = addressIsHex
      ? "0x03" + address.slice(2) + "00"
      : "0x01" + u8aToHex(decodeAddress(address), undefined, false) + "00";

    let currency_address = "";

    switch (assetSymbol?.toLowerCase()) {
      case "glmr": {
        currency_address = "0x0000000000000000000000000000000000000802";
        break;
      }
      case "xcastr": {
        currency_address = "0xFfFFFfffA893AD19e540E172C10d78D4d479B5Cf";
        break;
      }
      default:
        throw new Error("Invalid asset symbol");
    }

    return {
      contractAddress: "0x0000000000000000000000000000000000000804",
      abi: xTokensAbi,
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

  [PARACHAINS.ACALA]: ({ address, amount, assetSymbol }) => {
    const addressIsHex = address.startsWith("0x");

    const _address = addressIsHex
      ? "0x03" + address.slice(2) + "00"
      : "0x01" + u8aToHex(decodeAddress(address), undefined, false) + "00";

    let currency_address = "";

    switch (assetSymbol?.toLowerCase()) {
      case "glmr": {
        currency_address = "0x0000000000000000000000000000000000000802";
        break;
      }
      case "xcaca": {
        currency_address = "0xffffFFffa922Fef94566104a6e5A35a4fCDDAA9f";
        break;
      }
      default:
        throw new Error("Invalid asset symbol");
    }

    return {
      contractAddress: "0x0000000000000000000000000000000000000804",
      abi: xTokensAbi,
      method: "transfer",
      extrinsicValues: {
        currency_address, //asset address
        amount: amount.toString(),
        destination: [
          1,
          [
            "0x00" +
              "0000" +
              numberToHex(POLKADOT_PARACHAINS.ACALA.id).split("0x")[1],
            _address,
          ],
        ],
        weight: "4000000000", // Weight
      },
    };
  },
};

enum MOONBEAM_ASSETS {
  GLMR = "GLMR",
  xcASTR = "xcASTR",
  xcACA = "xcACA",
  xcDOT = "xcDOT",
}

export const MOONBEAM_ASSETS_MAPPING = {
  [RELAY_CHAINS.POLKADOT]: [MOONBEAM_ASSETS.xcDOT],
  [PARACHAINS.ASTAR]: [MOONBEAM_ASSETS.GLMR, MOONBEAM_ASSETS.xcASTR],
  [PARACHAINS.ACALA]: [MOONBEAM_ASSETS.GLMR, MOONBEAM_ASSETS.xcACA],
};
