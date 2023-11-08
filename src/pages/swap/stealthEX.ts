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
import { BigNumber, ethers } from "ethers";
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
  public protocol: string = "stealthex";
  public bridgeFee: string = "0.4%";

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
          } as SwapAsset)
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
      } as SwapAsset;
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
    currencyDecimals,
  }: {
    addressTo: string;
    amountFrom: string;
    currencyFrom: string;
    currencyTo: string;
    currencyDecimals: number;
  }) {
    const {
      createSwap: { destination, error, id },
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

    if (this.api instanceof ApiPromise) {
      const seed = await Extension.showKey();
      const keyring = new Keyring({ type: "sr25519" });
      const sender = keyring.addFromMnemonic(seed as string);

      const amount = transformAmountStringToBN(amountFrom, currencyDecimals);

      const extrinsic = this.api.tx.balances.transferKeepAlive(
        destination,
        amount
      );

      const { partialFee } = await extrinsic.paymentInfo(sender);

      fee.estimatedFee = formatBN(partialFee.toString(), currencyDecimals, 10);
      fee.estimatedTotal = formatBN(
        partialFee.add(amount).toString(),
        currencyDecimals,
        10
      );
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
    let txHash = "";
    let type = "";

    const isNativeAsset = assetToTransfer?.id === "-1";

    if (this.api instanceof ApiPromise) {
      const seed = await Extension.showKey();
      const keyring = new Keyring({ type: "sr25519" });
      const sender = keyring.addFromMnemonic(seed as string);

      type = AccountType.WASM;

      const bnAmount = transformAmountStringToBN(
        amount,
        assetToTransfer.decimals
      );

      if (isNativeAsset) {
        const extrinsic = this.api.tx.balances.transferKeepAlive(
          destinationAccount,
          bnAmount
        );

        txHash = (await extrinsic.signAsync(sender)).toHex();
      } else {
        const extrinsic = this.api.tx.assets.transfer(
          assetToTransfer.id,
          destinationAccount,
          bnAmount
        );

        txHash = (await extrinsic.signAsync(sender)).toHex();
      }
    } else if (this.api instanceof ethers.providers.JsonRpcProvider) {
      const pk = await Extension.showKey();
      const wallet = new ethers.Wallet(pk as string, this.api);

      type = AccountType.EVM;

      const tx = {
        from: wallet.address,
        to: destinationAccount,
        value: transformAmountStringToBN(
          amount,
          assetToTransfer.decimals
        ).toString(),
      };

      if (isNativeAsset) {
        const [feeData, gasLimit] = await Promise.all([
          this.api.getFeeData(),
          this.api.estimateGas(tx),
        ]);

        const transaction = await wallet.sendTransaction({
          ...tx,
          gasLimit,
          maxFeePerGas: feeData.maxFeePerGas as BigNumber,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas as BigNumber,
        });

        txHash = transaction.hash;
      } else {
        const contract = new ethers.Contract(
          assetToTransfer.address,
          [
            "function transfer(address to, uint256 value) public returns (bool)",
          ],
          wallet
        );
        const feeData = await this.api.getFeeData();
        const gasLimit = await contract.estimateGas
          .transfer(destinationAccount, tx.value)
          .catch(() => BigNumber.from("21000"));

        const transaction = await contract.transfer(
          destinationAccount,
          transformAmountStringToBN(amount, assetToTransfer.decimals),
          {
            gasLimit,
            maxFeePerGas: feeData.maxFeePerGas as BigNumber,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas as BigNumber,
          }
        );

        txHash = transaction.hash;
      }
    }

    return {
      txHash,
      type,
    };
  }

  async getActiveSwaps(): Promise<ActiveSwaps[]> {
    const swapsInStorage = await Extension.getSwapsByProtocol("stealthex");

    const swapsIds = swapsInStorage
      .filter((swap) => swap.id)
      .map((swap) => swap.id);

    const { getActiveSwaps } = (await this.sendPetition({
      document: gql`
        {
          getActiveSwaps(swapsIds: ["${swapsIds.join('","')}"]) {
            id
            addressFrom
            addressTo
            amountFrom
            amountTo
            currencyFrom
            currencyTo
            iconFrom
            iconTo
            status
          }
        } 
      `,
    })) as {
      getActiveSwaps: ActiveSwaps[];
    };

    return getActiveSwaps.reverse();
  }

  async saveSwapInStorage(swapId: string) {
    await Extension.addSwap(this.protocol, { id: swapId });
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
