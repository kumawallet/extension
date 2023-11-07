import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";
import Extension from "@src/Extension";
import {
  ACALA,
  ASTAR,
  BINANCE,
  ETHEREUM,
  KUSAMA,
  MOONBEAM,
  MOONRIVER,
  POLKADOT,
  POLYGON,
  SHIDEN,
} from "@src/constants/chains";
import { ethers } from "ethers";
import { Keyring } from "@polkadot/keyring";
import {
  GraphQLClient,
  RequestDocument,
  Variables,
  gql,
} from "graphql-request";
import { ActiveSwaps, InitProps, Swapper } from "./base";

interface StealthExToken {
  id: string;
  name: string;
  symbol: string;
  image: string;
  network: string;
}

const StealthEx_MAP_NATIVE_TOKENS: {
  [key: string]: { realName: string; stealthExName: string }[];
} = {
  [POLKADOT.name]: [
    {
      realName: "DOT",
      stealthExName: "DOT",
    },
  ],
  [ASTAR.name]: [
    {
      realName: "ASTR",
      stealthExName: "ASTR",
    },
  ],
  [MOONBEAM.name]: [
    {
      realName: "GLMR",
      stealthExName: "GLMR",
    },
  ],
  [ACALA.name]: [
    {
      realName: "ACA",
      stealthExName: "ACA",
    },
  ],
  [KUSAMA.name]: [
    {
      realName: "KSM",
      stealthExName: "KSM",
    },
  ],
  [ETHEREUM.name]: [
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
  [POLYGON.name]: [
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
  [BINANCE.name]: [
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
  [MOONRIVER.name]: [
    {
      realName: "MOVR",
      stealthExName: "MOVR",
    },
  ],
  [SHIDEN.name]: [
    {
      realName: "SDN",
      stealthExName: "SDN",
    },
  ],
};

export class StealthEX implements Swapper {
  private api: ApiPromise | ethers.providers.JsonRpcProvider | null = null;
  private gqlClient: GraphQLClient;

  public swap_info: string = "stealthex_swap_message";

  constructor() {
    this.gqlClient = new GraphQLClient(
      `${import.meta.env.VITE_BACKEND_URL}/graphql`
    );
  }

  async init({ chainName, nativeCurrency, api }: InitProps) {
    this.api = api;

    const tokens = await this.getTokens();

    const nativeTokens = StealthEx_MAP_NATIVE_TOKENS[chainName] || [];

    const pairTokens = await this.getPairTokensFromNativeCurrency(
      nativeCurrency
    );

    const pairs = tokens
      .filter((token) => pairTokens.includes(token.symbol))
      .map(
        (token, index) =>
          ({
            name: token.name,
            label: token.symbol,
            image: token.image,
            id: token.id || index,
            balance: "0",
            decimals: 0,
            network: token.network,
            symbol: token?.symbol.toUpperCase() || "",
          } as Asset)
      );

    const nativeAssets = nativeTokens.map((ntoken) => {
      const token = tokens.find(
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
      } as Asset;
    });

    return {
      nativeAssets,
      pairs,
    };
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

  async getTokens(): Promise<StealthExToken[]> {
    const {
      getTokens: { tokens },
    } = (await this.sendPetition({
      document: gql`
        query {
          getTokens {
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
      getTokens: {
        tokens: StealthExToken[];
      };
    };

    return tokens;
  }

  async getPairTokensFromNativeCurrency(
    nativeCurrency: string
  ): Promise<string[]> {
    const {
      getPairTokensFromNativeCurrency: { pairTokens },
    } = (await this.sendPetition({
      document: gql`
        query {
          getPairTokensFromNativeCurrency(nativeCurrency: "${nativeCurrency}") {
            pairTokens
          }
        }
      `,
    })) as {
      getPairTokensFromNativeCurrency: {
        pairTokens: string[];
      };
    };

    return pairTokens;
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
      getEstimatedAmount: { estimatedAmount, minAmount },
    } = (await this.sendPetition({
      document: gql`
        {
          getEstimatedAmount(
            amount: "${amount}"
            from: "${from}"
            to: "${to}"
          ){
            estimatedAmount
            minAmount
          }
        }
      `,
    })) as {
      getEstimatedAmount: {
        estimatedAmount: string;
        minAmount: string;
      };
    };

    return {
      estimatedAmount,
      minAmount,
    };
  }

  async createSwap({
    addressTo,
    amountFrom,
    currencyFrom,
    currencyTo,
  }: {
    addressTo: string;
    amountFrom: string;
    currencyFrom: string;
    currencyTo: string;
  }) {
    const {
      createSwap: { destination, error },
    } = (await this.sendPetition({
      document: gql`
        {
          createSwap(
            addressTo: "${addressTo}"
            amountFrom: "${amountFrom}"
            currencyFrom: "${currencyFrom}"
            currencyTo: "${currencyTo}"
          ) {
            destination
            error
          }
        }
      `,
    })) as {
      createSwap: {
        destination: string;
        error: string;
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

    if (this.api instanceof ApiPromise) {
      const seed = await Extension.showKey();
      const keyring = new Keyring({ type: "sr25519" });
      const sender = keyring.addFromMnemonic(seed as string);

      const amount = new BN(amountFrom);

      const extrinsic = this.api.tx.balances.transfer(destination, amount);

      const { partialFee } = await extrinsic.paymentInfo(sender);

      fee.estimatedFee = partialFee.toString();
      fee.estimatedTotal = partialFee.add(amount).toString();
    }

    if (this.api instanceof ethers.providers.JsonRpcProvider) {
      const gasPrice = await this.api.getGasPrice();
      const gasLimit = 21000;

      fee.estimatedFee = gasPrice.mul(gasLimit).toString();
      fee.estimatedTotal = new BN(fee.estimatedFee)
        .add(new BN(amountFrom))
        .toString();
      fee.gasLimit = gasLimit.toString();
    }

    return {
      fee,
      destination,
    };
  }

  async getActiveSwaps(): Promise<ActiveSwaps[]> {
    // const { data } = (await this.sendPetition({
    //   path: "exchanges",
    //   method: "get",
    // })) as {
    //   data: {
    //     data: {
    //       exchanges: {
    //         address_from: string;
    //         address_to: string;
    //         amount_from: string;
    //         amount_to: string;
    //         currency_from: string;
    //         currency_to: string;
    //         id: string;
    //         status: string;
    //       }[];
    //     };
    //   };
    // };

    // return (
    //   data.data?.exchanges?.map((swap) => ({
    //     addressFrom: swap.address_from,
    //     addressTo: swap.address_to,
    //     amountFrom: swap.amount_from,
    //     amountTo: swap.amount_to,
    //     currencyFrom: swap.currency_from,
    //     currencyTo: swap.currency_to,
    //     iconFrom: null,
    //     iconTo: null,
    //     id: swap.id,
    //     status: swap.status,
    //   })) || []
    // );

    return [];
  }

  canChangeSetAssetToSell() {
    return false;
  }

  showRecipentAddressFormat() {
    return true;
  }

  mustConfirmTx() {
    return true;
  }
}
