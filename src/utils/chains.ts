import { messageAPI } from "@src/messageAPI/api";
import { Chain, OldChain } from "@src/types";

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
          type: "wasm",
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
          type: "evm",
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
