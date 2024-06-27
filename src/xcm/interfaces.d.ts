export type Version = "V0" | "V1" | "V2" | "V3";

export interface ExtrinsicValues {
  address: string;
  amount: BN | BigNumberish | string;
  assetSymbol?: string;
  xcmPalletVersion: string;
}

export interface MapResponseXCM {
  pallet: string;
  method: string;
  extrinsicValues: {
    asset?: unknown;
    dest?: unknown;
    beneficiary?: unknown;
    assets?: unknown;
    feeAssetItem?: number;
    currencyId?: unknown;
    amount?: unknown | string;
    destWeightLimit?: string | { Limited: number };
  };
}

export interface MapResponseEVM {
  contractAddress: string;
  abi: string | unknown;
  method: string;
  extrinsicValues: {
    currency_address: string;
    amount: string;
    destination: unknown;
    weight: string;
  };
}

export type Map = (props: ExtrinsicValues) => MapResponseXCM | MapResponseEVM;

export interface IXCM_MAPPING {
  [key: string]: {
    [key: string]: Map;
  };
}
