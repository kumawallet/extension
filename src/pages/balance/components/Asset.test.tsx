import { POLKADOT_ACCOUNT_MOCK } from "@src/tests/mocks/account-mocks";
import {  Asset as IAsset } from "@src/types";
import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Asset } from "./Asset";

const functionMocks = {
  navigate: vi.fn(),
}



const dataMocks = {
  asset: {
    balance: "1",
    symbol: "DOT",
    amount: "1",
    decimals: 10,
    usdPrice: 0,
    accounts: {
      [POLKADOT_ACCOUNT_MOCK.value?.address as string]: {
        balance: 1,
        amount: 1,
        symbol: "DOT",
        decimals: 10,
        id: "-1",
      }
    },
    id: "-1",

  } as IAsset
}

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Asset
        asset={dataMocks.asset}
      />
    </I18nextProvider>
  );
};



describe("Asset", () => {

  vi.mock("react-router-dom", () => ({
    useNavigate: () => functionMocks.navigate
  }))

  vi.mock("@src/providers", async() => {
    const actual = await vi.importActual('@src/providers');
  return ({
        ...actual,
        useNetworkContext: () => ({state: {
          chains: [
          {
              "title": "wasm_based",
              "chains": [
                  {
                      "id": "polkadot",
                      "name": "Polkadot",
                      "rpcs": [
                          "wss://apps-rpc.polkadot.io",
                          "wss://polkadot-rpc.dwellir.com",
                          "wss://polkadot-rpc-tn.dwellir.com",
                          "wss://rpc.ibp.network/polkadot",
                          "wss://rpc.dotters.network/polkadot",
                          "wss://1rpc.io/dot",
                          "wss://rpc-polkadot.luckyfriday.io",
                          "wss://polkadot.public.curie.radiumblock.co/ws",
                          "wss://dot-rpc.stakeworld.io"
                      ],
                      "prefix": 0,
                      "symbol": "DOT",
                      "decimals": 10,
                      "explorer": "https://polkadot.subscan.io",
                      "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
                      "isTestnet": false,
                      "isCustom": false,
                      "type": "wasm"
                  },
                  {
                      "id": "acala",
                      "name": "Acala",
                      "rpcs": [
                          "wss://acala-rpc.dwellir.com",
                          "wss://acala-rpc-0.aca-api.network",
                          "wss://acala-rpc-1.aca-api.network",
                          "wss://acala-rpc-3.aca-api.network/ws"
                      ],
                      "prefix": 10,
                      "symbol": "ACA",
                      "decimals": 12,
                      "explorer": "https://acala.subscan.io",
                      "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/6756.png",
                      "isTestnet": false,
                      "isCustom": false,
                      "type": "wasm"
                  },
                  {
                      "id": "astar",
                      "name": "Astar",
                      "rpcs": [
                          "wss://astar-rpc.dwellir.com",
                          "wss://1rpc.io/astr",
                          "wss://rpc.astar.network",
                          "wss://astar.public.curie.radiumblock.co/ws"
                      ],
                      "prefix": 5,
                      "symbol": "ASTR",
                      "decimals": 18,
                      "explorer": "https://astar.subscan.io",
                      "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/12885.png",
                      "isTestnet": false,
                      "isCustom": false,
                      "type": "wasm"
                  },
                  {
                      "id": "kusama",
                      "name": "Kusama",
                      "rpcs": [
                          "wss://kusama-rpc.dwellir.com",
                          "wss://kusama-rpc.polkadot.io",
                          "wss://kusama-rpc-tn.dwellir.com",
                          "wss://rpc.ibp.network/kusama",
                          "wss://rpc.dotters.network/kusama",
                          "wss://1rpc.io/ksm",
                          "wss://rpc-kusama.luckyfriday.io",
                          "wss://kusama.public.curie.radiumblock.co/ws",
                          "wss://ksm-rpc.stakeworld.io"
                      ],
                      "prefix": 2,
                      "symbol": "KSM",
                      "decimals": 12,
                      "explorer": "https://kusama.subscan.io",
                      "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/5034.png",
                      "isTestnet": false,
                      "isCustom": false,
                      "type": "wasm"
                  }
  
              ]
          },
          {
              "title": "evm_based",
              "chains": [
                  {
                      "id": "ethereum",
                      "name": "Ethereum",
                      "rpcs": [
                          "https://rpc.ankr.com/eth",
                          "https://eth.api.onfinality.io/public",
                          "https://eth.llamarpc.com"
                      ],
                      "symbol": "ETH",
                      "decimals": 18,
                      "explorer": "https://etherscan.io",
                      "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                      "isTestnet": false,
                      "isCustom": false,
                      "type": "evm"
                  },
                  {
                      "id": "acala-evm",
                      "name": "Acala EVM",
                      "rpcs": [
                          "https://eth-rpc-acala.aca-api.network",
                          "https://rpc.evm.acala.network"
                      ],
                      "symbol": "ACA",
                      "decimals": 18,
                      "explorer": "https://blockscout.acala.network",
                      "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/6756.png",
                      "isTestnet": false,
                      "isCustom": false,
                      "type": "evm"
                  },
                  
              ]
          },
          
        ]}
  })})})

  it("should render the component", () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });

  it("should go to se multiple accounts", async () => {
    const { getByTestId } = renderComponent();
    const asset = getByTestId("asset");

    fireEvent.click(asset)
    await waitFor(() => {

      expect(functionMocks.navigate).toHaveBeenCalled();
    })
  })

  it("should go to send", async () => {
    const { getByTestId } = renderComponent();
    const sendButton = getByTestId("send");

    fireEvent.click(sendButton)
    await waitFor(() => {
      expect(functionMocks.navigate).toHaveBeenCalled();
    })
  })

})
