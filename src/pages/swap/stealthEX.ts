import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { Keyring } from "@polkadot/keyring";
import {
  GraphQLClient,
  RequestDocument,
  Variables,
  gql,
} from "graphql-request";
import { ActiveSwaps, InitProps, SwapAsset, Swapper } from "./base";
import { formatBN, transformAmountStringToBN } from "@src/utils/assets";
import { AccountType } from "@src/accounts/types";
import { messageAPI } from "@src/messageAPI/api";
import { transformAddress } from "@src/utils/account-utils";

interface StealthExToken {
  id: string;
  name: string;
  symbol: string;
  image: string;
  network: string;
}

const StealthEx_MAP_NATIVE_TOKENS: {
  [key: string]: { realName: string; stealthExName: string; prefix?: number }[];
} = {
  polkadot: [
    {
      realName: "DOT",
      stealthExName: "DOT",
      prefix: 0,
    },
  ],
  astar: [
    {
      realName: "ASTR",
      stealthExName: "ASTR",
      prefix: 5,
    },
  ],
  "moonbeam-evm": [
    {
      realName: "GLMR",
      stealthExName: "GLMR",
    },
  ],
  acala: [
    {
      realName: "ACA",
      stealthExName: "ACA",
      prefix: 10,
    },
  ],
  kusama: [
    {
      realName: "KSM",
      stealthExName: "KSM",
      prefix: 2,
    },
  ],
  ethereum: [
    {
      realName: "ETH",
      stealthExName: "ETH",
    },
    {
      realName: "DAI",
      stealthExName: "DAI",
    },
    {
      realName: "USDC",
      stealthExName: "USDC",
    },
    {
      realName: "USDT",
      stealthExName: "USDTERC20",
    },
    {
      realName: "WBTC",
      stealthExName: "WBTC",
    },
  ],
  polygon: [
    {
      realName: "MATIC",
      stealthExName: "MATIC",
    },
    {
      realName: "DAI",
      stealthExName: "DAIMATIC",
    },
    {
      realName: "USDT",
      stealthExName: "USDTPOLY",
    },
    {
      realName: "WBTC",
      stealthExName: "WBTCMATIC",
    },
  ],
  binance: [
    {
      realName: "BNB",
      stealthExName: "BNB",
    },
    {
      realName: "BUSD",
      stealthExName: "BNBBSC",
    },
    {
      realName: "DAI",
      stealthExName: "DAIBSC",
    },
    {
      realName: "DOT",
      stealthExName: "DOTBSC",
    },
    {
      realName: "ETH",
      stealthExName: "ETHBSC",
    },
    {
      realName: "MATIC",
      stealthExName: "MATICBSC",
    },
    {
      realName: "USDT",
      stealthExName: "USDTBEP20",
    },
    {
      realName: "USDC",
      stealthExName: "USDCBSC",
    },
  ],
  "moonriver-evm": [
    {
      realName: "MOVR",
      stealthExName: "MOVR",
    },
  ],
  shiden: [
    {
      realName: "SDN",
      stealthExName: "SDN",
      prefix: 5,
    },
  ],
};

export class StealthEX implements Swapper {
  private gqlClient: GraphQLClient;
  public protocol: string = "stealthex";
  public bridgeFee: string = "0.4%";
  public swap_info: string = "stealthex_swap_message";
  private tokens: StealthExToken[] = [];
  public type = "swapper";
  public chainId = "";

  constructor() {
    this.gqlClient = new GraphQLClient(
      `${import.meta.env.VITE_BACKEND_URL}/graphql`
    );
  }

  async init({ chainIds }: InitProps) {
    try {
      const tokens =
        this.tokens.length === 0
          ? await this.getTokens()
          : (this.tokens as SwapAsset[]);

      this.tokens = tokens;

      const nativeTokens =
        chainIds
          .filter((chainId) => StealthEx_MAP_NATIVE_TOKENS[chainId])
          .map((chainId) => StealthEx_MAP_NATIVE_TOKENS[chainId])
          .flat() || [];

      const pairs = tokens;

      const nativeAssets = nativeTokens.map((ntoken) => {
        const token = this.tokens.find(
          (token) => token.symbol === ntoken.stealthExName.toLocaleLowerCase()
        );

        return {
          name: token?.name || "",
          symbol: token?.symbol.toUpperCase() || "",
          label: ntoken.realName,
          image: token?.image || "",
          id: ntoken.stealthExName || token?.id,
          balance: "0",
          decimals: 0,
          network: token?.network || "",
          chainId: chainIds.find((chainId) =>
            StealthEx_MAP_NATIVE_TOKENS[chainId].some(
              (token) => token.stealthExName === ntoken.stealthExName
            )
          ),
        } as SwapAsset;
      });

      return {
        nativeAssets,
        pairs,
      };
    } catch (error) {
      return {
        nativeAssets: [],
        pairs: [],
      };
    }
  }

  sendPetition({
    document,
    variables,
  }: {
    document: RequestDocument;
    variables?: Variables;
  }) {
    return this.gqlClient.request(document, variables);
  }

  async getTokens(): Promise<SwapAsset[]> {
    const {
      getTokensToSwap: { tokens },
    } = (await this.sendPetition({
      document: gql`
        query {
          getTokensToSwap {
            tokens {
              image
              name
              network
              symbol
            }
          }
        }
      `,
    })) as {
      getTokensToSwap: {
        tokens: SwapAsset[];
      };
    };

    const _formatedTokens = tokens.map((token) => ({
      ...token,
      id: token.symbol,
      balance: "0",
      decimals: 0,
      label: token.symbol.toUpperCase(),
    }));

    return _formatedTokens;
  }

  async getEstimatedAmount({
    from,
    to,
    amount,
  }: {
    from: string;
    to: string;
    amount: string;
  }) {
    const {
      getEstimatedAmount: { estimated, min },
    } = (await this.sendPetition({
      document: gql`
        {
          getEstimatedAmount(
            amount: "${amount}"
            from: "${from}"
            to: "${to}"
          ){
            estimated
            min
          }
        }
      `,
    })) as {
      getEstimatedAmount: {
        estimated: number;
        min: number;
      };
    };

    return {
      estimatedAmount: String(estimated),
      minAmount: String(min),
    };
  }

  async createSwap({
    addressTo,
    addressFrom,
    amountFrom,
    currencyFrom,
    currencyTo,
    currencyDecimals,
    assetToSell,
    nativeAsset,
  }: {
    addressFrom: string;
    addressTo: string;
    amountFrom: string;
    currencyFrom: string;
    currencyTo: string;
    currencyDecimals: number;
    nativeAsset: {
      symbol: string;
      decimals: number;
    };
    assetToSell: {
      symbol: string;
      decimals: number;
    };
  }) {
    const prefix = Object.values(StealthEx_MAP_NATIVE_TOKENS).find((tokens) =>
      tokens.some(
        (token) =>
          token.stealthExName.toLowerCase() === nativeAsset.symbol.toLowerCase()
      )
    )?.[0]?.prefix;

    const formattedAddressFrom = transformAddress(addressFrom, prefix);

    const {
      createSwap: { destination, error, id },
    } = (await this.sendPetition({
      document: gql`
        {
          createSwap(
            addressFrom: "${formattedAddressFrom}"
            addressTo: "${addressTo}"
            amountFrom: "${amountFrom}"
            currencyFrom: "${currencyFrom}"
            currencyTo: "${currencyTo}"
          ) {
            destination
            error
            id
          }
        }
      `,
    })) as {
      createSwap: {
        destination: string;
        error: string;
        id: string;
      };
    };

    if (error) {
      throw new Error(error);
    }

    const fee = {
      gasLimit: "",
      estimatedFee: new BN(0).toString(),
      estimatedTotal: new BN(0).toString(),
    };

    return {
      fee,
      destination,
      id,
    };
  }

  async confirmTx({
    amount,
    assetToTransfer,
    destinationAccount,
  }: {
    assetToTransfer: {
      id: string;
      decimals: number;
      address: string;
    };
    amount: string;
    destinationAccount: string;
  }) {
    let extrinsicHash = "";
    let evmTx = null;
    let type = "";

    const isNativeAsset = assetToTransfer?.id === "-1";

    // if (this.api instanceof ApiPromise) {
    //   type = AccountType.WASM;

    //   const bnAmount = transformAmountStringToBN(
    //     amount,
    //     assetToTransfer.decimals
    //   );

    //   if (isNativeAsset) {
    //     const extrinsic = this.api.tx.balances.transferKeepAlive(
    //       destinationAccount,
    //       bnAmount
    //     );

    //     extrinsicHash = extrinsic.toHex();
    //   } else {
    //     const extrinsic = this.api.tx.assets.transfer(
    //       assetToTransfer.id,
    //       destinationAccount,
    //       bnAmount
    //     );

    //     extrinsicHash = extrinsic.toHex();
    //   }
    // } else if (this.api instanceof ethers.providers.JsonRpcProvider) {
    //   const pk = await messageAPI.showKey();
    //   // const pk = await Extension.showKey();
    //   const wallet = new ethers.Wallet(pk as string, this.api);

    //   type = AccountType.EVM;

    //   const tx = {
    //     from: wallet.address,
    //     to: destinationAccount,
    //     value: transformAmountStringToBN(
    //       amount,
    //       assetToTransfer.decimals
    //     ).toString(),
    //   };

    //   if (isNativeAsset) {
    //     const [feeData, gasLimit] = await Promise.all([
    //       this.api.getFeeData(),
    //       this.api.estimateGas(tx),
    //     ]);

    //     evmTx = {
    //       ...tx,
    //       gasLimit,
    //       maxFeePerGas: feeData.maxFeePerGas as BigNumber,
    //       maxPriorityFeePerGas: feeData.maxPriorityFeePerGas as BigNumber,
    //       type: 2,
    //     };
    //   } else {
    //     const contract = new ethers.Contract(
    //       assetToTransfer.address,
    //       [
    //         "function transfer(address to, uint256 value) public returns (bool)",
    //       ],
    //       wallet
    //     );
    //     const feeData = await this.api.getFeeData();
    //     const gasLimit = await contract.estimateGas
    //       .transfer(destinationAccount, tx.value)
    //       .catch(() => BigNumber.from("21000"));

    //     evmTx = await contract.populateTransaction.transfer(tx.to, tx.value, {
    //       gasLimit,
    //       maxFeePerGas: feeData.maxFeePerGas as unknown as BigNumberish,
    //       maxPriorityFeePerGas:
    //         feeData.maxPriorityFeePerGas as unknown as BigNumberish,
    //     });
    //   }
    // }

    return {
      extrinsicHash,
      evmTx,
      type,
    };
  }

  async getActiveSwaps(): Promise<ActiveSwaps[]> {
    return [];
  }

  async saveSwapInStorage() {
    // await messageAPI.addSwap({
    //   protocol: this.protocol,
    //   swap: { id: swapId },
    // });
    // await Extension.addSwap(this.protocol, { id: swapId });
  }

  canChangeSetAssetToSell() {
    return true;
  }

  showRecipentAddressFormat() {
    return true;
  }

  mustConfirmTx() {
    return true;
  }
}
