import { useCallback } from "react";
import { ASSETS_TRANSAK } from "../../../constants/assets-transak";
import { transformAddress } from "@src/utils/account-utils";

const CHAINS = ASSETS_TRANSAK;

const useBuy = () => {
  const createOrder = useCallback(
    (symbol: string, address: string, network: string) => {
      return new Promise<string>((resolve) => {
        const prefix = CHAINS.find(
          (chain) => chain.symbol === symbol && chain.network === network
        )?.prefix;
        const params = {
          apiKey: import.meta.env.VITE_TRANSAK_API_KEY,
          defaultCryptoCurrency: symbol,
          networks: network,
          cryptoCurrencyList: symbol,
          walletAddress: transformAddress(address, prefix),
        };
        const query = new URLSearchParams(params).toString();
        resolve(`${import.meta.env.VITE_TRANSAK_URL}?${query}`);
      });
    },
    []
  );


  return { chains: CHAINS, createOrder };
};

export default useBuy;
