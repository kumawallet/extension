import { EVM_CHAINS, SUBSTRATE_CHAINS } from "@src/constants/chainsData";
import { Transaction, Tx } from "./Transaction";
import { ApiPromise } from "@polkadot/api";
import { ChainType } from "@src/types";
import { BigNumber, providers } from "ethers";
import { OlProvider } from "@src/services/ol/OlProvider";
import { OL_CHAINS } from "@src/constants/chainsData/ol";

const POLKADOT_EXTRINSIC = {
  paymentInfo: () => ({
    partialFee: "1000000000",
  }),
};

const functionMocks = {
  reserveTransferAssets: vi.fn().mockReturnValue(POLKADOT_EXTRINSIC),
  transferAllowDeath: vi.fn().mockReturnValue(POLKADOT_EXTRINSIC),
  transfer: vi.fn().mockReturnValue(POLKADOT_EXTRINSIC),
  populateTransfer: vi.fn().mockReturnValue({}),
  getOlFee: vi.fn().mockReturnValue("1000000000"),
};

const POLKADOT_PROVIDER = {
  query: {
    polkadotXcm: {
      palletVersion: async () => "1",
    },
  },
  tx: {
    xcmPallet: {
      reserveTransferAssets: functionMocks.reserveTransferAssets,
    },
    balances: {
      transferAllowDeath: functionMocks.transferAllowDeath,
    },
    assets: {
      transfer: functionMocks.transfer,
    },
  },
};

const POLKADOT_CHAIN = SUBSTRATE_CHAINS[0];
const ASTAR_CHAIN = SUBSTRATE_CHAINS[2];

const WASM_TX_XCM: Tx = {
  amount: "1000000000000",
  senderAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
  destinationAddress: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
  provider: {
    provider: POLKADOT_PROVIDER as unknown as ApiPromise,
    type: ChainType.WASM,
  },
  originNetwork: POLKADOT_CHAIN,
  targetNetwork: ASTAR_CHAIN,
  asset: {
    id: "-1",
    balance: "0",
    decimals: 12,
    symbol: POLKADOT_CHAIN.symbol,
  },
  signer: null,
};

const WASM_TX_NATIVE: Tx = {
  amount: "1000000000000",
  senderAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
  destinationAddress: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
  provider: {
    provider: POLKADOT_PROVIDER as unknown as ApiPromise,
    type: ChainType.WASM,
  },
  originNetwork: POLKADOT_CHAIN,
  targetNetwork: POLKADOT_CHAIN,
  asset: {
    id: "-1",
    balance: "0",
    decimals: 12,
    symbol: POLKADOT_CHAIN.symbol,
  },
  signer: null,
};

const WASM_TX_NON_NATIVE: Tx = {
  amount: "1000000",
  senderAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
  destinationAddress: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
  provider: {
    provider: POLKADOT_PROVIDER as unknown as ApiPromise,
    type: ChainType.WASM,
  },
  originNetwork: ASTAR_CHAIN,
  targetNetwork: ASTAR_CHAIN,
  asset: {
    id: "4294969280",
    balance: "0",
    decimals: 6,
    symbol: "USDT",
  },
  signer: null,
};

const ETHEREUM_CHAIN = EVM_CHAINS[0];

const ETHERS_PROVIDER = {
  getFeeData: vi.fn().mockReturnValue({
    maxFeePerGas: BigNumber.from("100000000000"),
    maxPriorityFeePerGas: BigNumber.from("1000000000"),
  }),
  estimateGas: vi.fn().mockReturnValue(BigNumber.from("21000")),
};

const EVM_TX_NATIVE: Tx = {
  amount: "1000000000000000000",
  asset: {
    balance: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 18,
    id: "-1",
    symbol: "ETH",
  },
  provider: {
    provider: ETHERS_PROVIDER as unknown as providers.JsonRpcProvider,
    type: ChainType.EVM,
  },
  originNetwork: ETHEREUM_CHAIN,
  targetNetwork: ETHEREUM_CHAIN,
  senderAddress: "0x401Ca548e4a48bB354410af12A5e145dcb60E3Db",
  destinationAddress: "0x55423C073C5e5Ce2D30Ec466a6cDEF0803EC32Cc",
  signer: null,
};

const EVM_TX_ERC20: Tx = {
  amount: "1000000",
  asset: {
    balance: "1000000",
    decimals: 6,
    id: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    address: "0x55423C073C5e5Ce2D30Ec466a6cDEF0803EC32Cc",
  },
  provider: {
    provider: ETHERS_PROVIDER as unknown as providers.JsonRpcProvider,
    type: ChainType.EVM,
  },
  originNetwork: ETHEREUM_CHAIN,
  targetNetwork: ETHEREUM_CHAIN,
  senderAddress: "0x401Ca548e4a48bB354410af12A5e145dcb60E3Db",
  destinationAddress: "0x55423C073C5e5Ce2D30Ec466a6cDEF0803EC32Cc",
  signer: null,
};

const MOONBEAM = EVM_CHAINS[3];

const EVM_TX_XCM = {
  amount: "1000000000000000000",
  asset: {
    balance: "1000000000000000000",
    decimals: 18,
    id: "-1",
    symbol: "GLMR",
  },
  provider: {
    provider: ETHERS_PROVIDER as unknown as providers.JsonRpcProvider,
    type: ChainType.EVM,
  },
  originNetwork: MOONBEAM,
  targetNetwork: POLKADOT_CHAIN,
  senderAddress: "0x401Ca548e4a48bB354410af12A5e145dcb60E3Db",
  destinationAddress: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
  signer: null,
};

const OLProvider = {
  getFees: functionMocks.getOlFee,
};

const OL_TX: Tx = {
  amount: "1000000",
  asset: {
    balance: "1000000",
    decimals: 6,
    id: "-1",
    symbol: "OL",
  },
  provider: {
    provider: OLProvider as unknown as OlProvider,
    type: ChainType.OL,
  },
  originNetwork: OL_CHAINS[0],
  targetNetwork: OL_CHAINS[0],
  senderAddress:
    "FDC2EF2FB05959371332B5C136CC0ED0C674F9837051D02CA1A359ED59953160",
  destinationAddress:
    "FDC2EF2FB05959371332B5C136CC0ED0C674F9837051D02CA1A359ED59953160",
  signer: null,
};

describe("Transaction", () => {
  beforeAll(() => {
    vi.mock("@polkadot/util-crypto", async () => {
      const actual = await import("@polkadot/util-crypto");
      return {
        ...actual,
        decodeAddress: (address: string) => address,
      };
    });

    vi.mock("ethers", async () => {
      const actual = await import("ethers");
      return {
        ...actual,

        Contract: class {
          estimateGas = {
            transfer: () => ETHERS_PROVIDER.estimateGas(),
          };

          populateTransaction = {
            transfer: functionMocks.populateTransfer,
          };
        },
      };
    });
  });

  describe("polkadot transactions", () => {
    it("should handle XCM transaction", async () => {
      const tx = new Transaction();
      tx.updateTx(WASM_TX_XCM);
      const fee = await tx.getFee();

      expect(functionMocks.reserveTransferAssets).toHaveBeenCalled();
      expect(fee).toEqual("1000000000");
    });

    it("should handle native transaction", async () => {
      const tx = new Transaction();
      tx.updateTx(WASM_TX_NATIVE);
      const fee = await tx.getFee();

      expect(functionMocks.transferAllowDeath).toHaveBeenCalled();
      expect(fee).toEqual("1000000000");
    });

    it("should handle non-native transaction", async () => {
      const tx = new Transaction();
      tx.updateTx(WASM_TX_NON_NATIVE);
      const fee = await tx.getFee();

      expect(functionMocks.transfer).toHaveBeenCalled();
      expect(fee).toEqual("1000000000");
    });
  });

  describe("evm transactions", () => {
    it("should handle native transaction", async () => {
      const tx = new Transaction();
      tx.updateTx(EVM_TX_NATIVE);
      const fee = await tx.getFee();

      expect(ETHERS_PROVIDER.estimateGas).toHaveBeenCalled();
      expect(fee).toBe("2100001000000000");
    });

    it("should handle ERC20 transaction", async () => {
      const tx = new Transaction();
      tx.updateTx(EVM_TX_ERC20);
      const fee = await tx.getFee();

      expect(functionMocks.populateTransfer).toHaveBeenCalled();
      expect(fee).toBe("2100001000000000");
    });

    it("should handle XCM transaction", async () => {
      const tx = new Transaction();
      tx.updateTx(EVM_TX_XCM);
      const fee = await tx.getFee();

      expect(functionMocks.populateTransfer).toHaveBeenCalled();
      expect(fee).toBe("2100001000000000");
    });
  });

  describe("ol provider", () => {
    it("should get fees", async () => {
      const tx = new Transaction();
      tx.updateTx(OL_TX);
      const fee = await tx.getFee();

      expect(functionMocks.getOlFee).toHaveBeenCalled();
      expect(fee).toBe("1000000000");
    });
  });

  it("clear", () => {
    const tx = new Transaction();
    tx.updateTx(OL_TX);
    tx.clear();
    expect(tx.tx.getValue()).toEqual({
      amount: "",
      destinationAddress: "",
      senderAddress: "",
      provider: null,
      originNetwork: null,
      targetNetwork: null,
      asset: null,
      signer: null,
    });
  });
});
