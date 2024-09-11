import i18n from "@src/utils/i18n";
import { I18nextProvider } from "react-i18next";
import { AssetNetwork } from "./AssetNetwork";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn().mockReturnValue(vi.fn),
  useLocation: () => ({
    state: {
      asset: {
        symbol: "HDX",
        balance: 328.554,
        amount: "0",
        decimals: 12,
        accounts: {
          "IMPORTED_WASM-RQ99VSKew": {
            balance: 328554350420982,
            amount: 0,
            symbol: "HDX",
            decimals: 12,
            id: "-1",
            assets: [
              {
                id: "-1",
                symbol: "HDX",
                decimals: 12,
                balance: 0,
                transferable: "0",
                price: "0",
                amount: 0,
                accountKey: "IMPORTED_WASM-RQ99VSKew",
                network: "hydradx-rococo"
              },
              {
                id: "-1",
                symbol: "HDX",
                decimals: 12,
                balance: 328554350420982,
                transferable: "328554350420982",
                price: "0",
                amount: 0,
                accountKey: "IMPORTED_WASM-RQ99VSKew",
                network: "hydradx"
              }
            ]
          }
        },
        id: "-1",
        assetNumber: 2
      }
    }
  })
}));
vi.mock("@src/providers", async() => {
  const actual = await vi.importActual('@src/providers');
  return {
    ...actual,
    useNetworkContext: vi.fn().mockReturnValue({
        state: {
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
                        "id": "hydradx",
                        "name": "HydraDX",
                        "rpcs": [
                            "wss://rpc.hydradx.cloud"
                        ],
                        "prefix": 63,
                        "symbol": "HDX",
                        "decimals": 12,
                        "explorer": "https://hydration.subscan.io/",
                        "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
                        "isTestnet": false,
                        "isCustom": false,
                        "type": "wasm"
                    }
                ]
            },
            {
                "title": "wasm_based_testnets",
                "chains": [
                    {
                        "id": "rococo",
                        "name": "Rococo",
                        "rpcs": [
                            "wss://rococo-rpc.polkadot.io"
                        ],
                        "prefix": 42,
                        "symbol": "ROC",
                        "decimals": 12,
                        "explorer": "https://rococo.subscan.io",
                        "logo": "/images/rococo.png",
                        "isTestnet": true,
                        "isCustom": false,
                        "type": "wasm"
                    },
                    {
                        "id": "hydradx-rococo",
                        "name": "HydraDX (Rococo)",
                        "rpcs": [
                            "wss://hydradx-rococo-rpc.play.hydration.cloud"
                        ],
                        "prefix": 63,
                        "symbol": "HDX",
                        "decimals": 12,
                        "explorer": "https://hydra-poc-3.subscan.io/",
                        "logo": "hydradx",
                        "isTestnet": true,
                        "isCustom": false,
                        "type": "wasm"
                    }
                ]
            },
        ],
        },
      }),
    useAssetContext: () => ({
      state: {
        assets: {
          "IMPORTED_WASM-RQ99VSKew": {
            "hydradx-rococo": {
              subs: [null, null, null, null, null],
              assets: [
                {
                  id: "-1",
                  symbol: "HDX",
                  decimals: 12,
                  balance: "0",
                  transferable: "0",
                  price: "0",
                  amount: "0"
                },
                {
                  id: "5",
                  decimals: 10,
                  symbol: "DOT",
                  balance: "0",
                  transferable: "0",
                  price: "0",
                  amount: "0"
                }
              ]
            },
            "hydradx": {
              subs: [null, null, null, null, null, null, null, null, null],
              assets: [
                {
                  id: "-1",
                  symbol: "HDX",
                  decimals: 12,
                  balance: "328554350420982",
                  transferable: "328554350420982",
                  price: "0",
                  amount: "0"
                },
                {
                  id: "5",
                  decimals: 10,
                  symbol: "DOT",
                  name: "DOT",
                  balance: "8305963427",
                  transferable: "8305963427",
                  price: "0",
                  amount: "0"
                },
                {
                  id: "9",
                  decimals: 18,
                  symbol: "ASTR",
                  name: "Astar",
                  balance: "63878953027448605729",
                  transferable: "63878953027448605729",
                  price: "0",
                  amount: "0"
                },
                {
                  id: "16",
                  decimals: 18,
                  symbol: "GLMR",
                  name: "Moonbeam",
                  balance: "5974301623797462944",
                  transferable: "5974301623797462944",
                  price: "0",
                  amount: "0"
                }
              ]
            }
          }
        },
        isLoadingAssets: false
      }
    })
  };
});

describe("AssetNetwork", () => {
  const renderComponent = () => {
    return render(
      <I18nextProvider i18n={i18n}>
        <AssetNetwork />
      </I18nextProvider>
    );
  };

  it("should render Asset from Network", () => {
    renderComponent();
    const elements = screen.getAllByText("HDX")
    expect(elements).toHaveLength(2);
  });
});
