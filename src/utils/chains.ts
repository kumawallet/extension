import { ApiPromise, WsProvider } from "@polkadot/api";
import { messageAPI } from "@src/messageAPI/api";
import { OlProvider } from "@src/services/ol/OlProvider";
import { Chain, ChainType, OldChain } from "@src/types";
import { JsonRpcProvider } from "ethers";

export const migrateOldCustomChains = async (chains: Chain[]) => {
  const newChains: Chain[] = [];
  try {
    const chainNames = chains.map((chain) => chain.name);

    chains.forEach((oldChain: unknown) => {
      const _oldChain = oldChain as OldChain;

      if (_oldChain.supportedAccounts.includes("WASM")) {
        newChains.push({
          id: `custom-${_oldChain.name.toLowerCase()}-was,`,
          name: `${_oldChain.name}-wasm`,
          rpcs: [_oldChain.rpc.wasm as string],
          prefix: _oldChain.addressPrefix,
          symbol: _oldChain.nativeCurrency.symbol,
          decimals: _oldChain.nativeCurrency.decimals,
          logo: "",
          explorer: _oldChain.explorer.wasm?.url || "",
          isTestnet: false,
          isCustom: true,
          type: ChainType.WASM,
        });
      }

      if (_oldChain.supportedAccounts.includes("EVM")) {
        newChains.push({
          id: `custom-${_oldChain.name.toLowerCase()}-evm`,
          name: `${_oldChain.name}-evm`,
          rpcs: [_oldChain.rpc.evm as string],
          symbol: _oldChain.nativeCurrency.symbol,
          decimals: _oldChain.nativeCurrency.decimals,
          logo: "",
          explorer: _oldChain.explorer.evm?.url || "",
          isTestnet: false,
          isCustom: true,
          type: ChainType.EVM,
        });
      }
    });

    await Promise.all(
      chainNames.map((name) =>
        messageAPI.removeCustomChain({
          chainName: name,
        })
      )
    );

    for (const newChain of newChains) {
      await messageAPI.saveCustomChain({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chain: newChain as any,
      });
    }
  } catch (error) {
    console.error("Error migrating old chains", error);
  }

  return {
    newChains,
  };
};

export const getProvider = (rpc: string, type: string) => {
  if (type?.toLowerCase() === ChainType.EVM)
    return new JsonRpcProvider(rpc as string);

  if (type?.toLowerCase() === ChainType.WASM)
    return ApiPromise.create({ provider: new WsProvider(rpc as string) });

  if (type?.toLowerCase() === ChainType.OL) return new OlProvider(rpc);
};
