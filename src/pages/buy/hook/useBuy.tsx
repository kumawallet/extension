import { chain } from '../types.d';
import { useState, useCallback } from 'react';
import { ASSETS_TRANSAK } from "../../../constants/assets-transak";
import { transformAddress } from "@src/utils/account-utils";



const useBuy = () => {
    const [chains, setChains] = useState<chain[]>(ASSETS_TRANSAK);

    const createOrder = useCallback((symbol: string, address: string, network: string, isSupportSell: boolean) => {
        return new Promise<string>((resolve) => {
          const prefix = chains.find(
            (chain) => chain.symbol === symbol && chain.network === network
          )?.prefix;
          const params = {
            apiKey: import.meta.env.VITE_TRANSAK_API_KEY,
            defaultCryptoCurrency: symbol,
            networks: network,
            cryptoCurrencyList: symbol,
            walletAddress: transformAddress(address, prefix),
            productsAvailed: isSupportSell ? "BUY,SELL" : "BUY",
            disableWalletAddressForm: "true"
          };
          const query = new URLSearchParams(params).toString();
          resolve(`${import.meta.env.VITE_TRANSAK_URL}?${query}`);
        });
      },[]);
      return {chains, createOrder}
}

export default useBuy