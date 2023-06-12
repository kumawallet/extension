import { BN0 } from "@src/constants/assets";
import { Version } from "./interfaces";
import { BN, u8aToHex } from "@polkadot/util";
import { BigNumberish } from "ethers";
import { decodeAddress } from "@polkadot/util-crypto";

type fungibleAsset = BN | BigNumberish | string;
type parents = 0 | 1;
type interior = "Here" | unknown;

export const getDest = ({
  parents = 0,
  parachainId = null,
  version = "V1",
}: {
  parents?: number;
  parachainId?: number | null;
  version?: Version;
}) => {
  return {
    [version]: {
      parents,
      interior: parachainId
        ? {
            X1: {
              Parachain: {
                id: parachainId,
              },
            },
          }
        : "Here",
    },
  };
};

export const getAssets = ({
  version = "V1",
  fungible = BN0,
  interior = "Here",
  parents = 0,
}: {
  version?: Version;
  fungible: fungibleAsset;
  interior?: interior;
  parents?: parents;
}) => {
  if (version === "V0") {
    return {
      V0: [
        {
          ConcreteFungible: {
            id: "Null",
            amount: fungible,
          },
        },
      ],
    };
  }

  return {
    [version]: [
      {
        id: {
          Concrete: {
            parents,
            interior,
          },
        },
        fun: {
          Fungible: fungible,
        },
      },
    ],
  };
};

export const transformAddress = (address: string) => {
  const isHex = address.startsWith("0x");

  const accountId = isHex ? address : u8aToHex(decodeAddress(address));

  return {
    accountId,
  };
};

export const getBeneficiary = ({
  address = "",
  version = "V1",
  account = "AccountId32",
  parents = 0,
}: {
  address: string;
  version?: Version;
  account?: string;
  parents?: parents;
}) => {
  const { accountId } = transformAddress(address);

  const accountKey = account === "AccountId32" ? "id" : "key";

  return {
    [version]: {
      parents,
      interior: {
        X1: {
          [account]: {
            network: "Any",
            [accountKey]: accountId,
          },
        },
      },
    },
  };
};

export const XCM = {
  pallets: {
    XCM_PALLET: {
      NAME: "xcmPallet",
      methods: {
        RESERVE_TRANSFER_ASSETS: "reserveTransferAssets",
        LIMITED_RESERVE_TRANSFER_ASSETS: "limitedReserveTransferAssets",
      },
    },
    POLKADOT_XCM: {
      NAME: "polkadotXcm",
      methods: {
        RESERVE_WITHDRAW_ASSETS: "reserveWithdrawAssets",
        RESERVE_TRANSFER_ASSETS: "reserveTransferAssets",
        LIMITED_RESERVE_TRANSFER_ASSETS: "limitedReserveTransferAssets",
      },
    },
    X_TOKENS: {
      NAME: "xTokens",
      methods: {
        TRANSFER: "transfer",
      },
    },
  },
};
