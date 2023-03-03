import { ApiPromise } from "@polkadot/api";
import { CHAINS } from "@src/constants/chains";
import { ethers } from "ethers";

export const selectedWASMChainMock = CHAINS[0].chains[0];
export const selectedEVMChainMock = CHAINS[0].chains[2];
export const selectedMultiSupportChain = CHAINS[1].chains[0];
export const rpcMock = "wss://test";
export const ethApiMock = {} as ethers.providers.JsonRpcProvider;
export const wasmApiMock = {} as ApiPromise;
