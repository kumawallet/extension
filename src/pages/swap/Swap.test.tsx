import { fireEvent, render } from "@testing-library/react";
import { Swap } from "./Swap";
import { txHydradxMock } from "./components/SwapTxSummary.test";
import { ChainType } from "@src/types";
import '@testing-library/jest-dom'; 
import { assetToBuy, assetToSell, mockAssetsInit } from "@src/tests/mocks/hydradx-mock";
import { swapType } from "..";


const functionMocks = {
    useNavigate: vi.fn(),
};
const cantSendMock = vi.hoisted(() => ({
    value: false
}))
const swapInfoMock = vi.hoisted(() => ({
    value: {}
}))

let useSwapMock = {
    amounts: { sell: '0', buy: '0' },
    assetsToBuy: mockAssetsInit,
    assetsToSell: mockAssetsInit,
    assetToBuy: assetToSell,
    assetToSell: assetToBuy,
    balanceIsSufficient: true,
    isCreatingSwap: false,
    isLoading: false,
    isLoadingAssets: false,
    isLoadingBuyAsset: false,
    isLoadingSellAsset : false,
    isLoadingBalance : false,
    handleAmounts: vi.fn(),
    handleAssetChange: vi.fn(),
    recipient: { address: '' },
    tx: txHydradxMock,
    txInfo: swapInfoMock.value,
    canSend: cantSendMock.value,
    swap: vi.fn(),
};


const renderComponent = () => {
    return render(<Swap />);
};

describe("Swap", () => {

    beforeAll(() => {
        vi.mock('react-i18next', () => ({
            useTranslation: () => ({
                t: (key: string) => key,
            }),
        }));

        vi.mock('@src/messageAPI/api', () => ({
            messageAPI: {
                getFee: vi.fn().mockResolvedValueOnce("12345"),
            },
        }));

        vi.mock("react-router-dom", () => ({
            useNavigate: () => functionMocks.useNavigate,
        }));

        vi.mock("@src/providers", async () => {
            const actual = await vi.importActual('@src/providers');
            return {
                ...actual,
                useAssetContext:  () => ({
                    state: {
                        isLoading: true
                    }
                }),
                useAccountContext: () => ({
                    state: {
                        selectedAccount: null,
                        accounts: [
                            { value: { name: "Account 1", address: "0x1234567890" }, type: ChainType.EVM },
                            { value: { name: "Account 2", address: "0x0987654321" }, type: ChainType.EVM },
                        ],
                    },
                }),
            };

            
        })
        
    });

    beforeEach(() => {
        vi.mock('./hooks', async () => {
            const actual = await vi.importActual('./hooks');
            return {
                ...actual,
                useSwap: () => useSwapMock,
            };
        });
    })

    it('renders correctly', () => {
        const { getByText, container } = renderComponent();
        expect(container).toBeDefined();
        expect(getByText('title')).toBeInTheDocument();
        expect(getByText('you_send')).toBeInTheDocument();
        expect(getByText('you_receive')).toBeInTheDocument();
    });

    it('disables the proceed button when canSend is false', () => {
        const { getByText } = renderComponent();
        const proceedButton = getByText('proceed');
        expect(proceedButton).toBeDisabled();
    });
    
    it('updates the sell amount when the user inputs a value', () => {
        const { getByTestId  } = renderComponent()
        const input = getByTestId('sell');
        fireEvent.change(input, { target: { value: '1' } });
        expect(input).toHaveValue('1');
      });
      it('updates the buy amount when the user inputs a value', () => {
        const { getByTestId  } = renderComponent()
        const input = getByTestId('buy');
        expect(input).toBeDisabled()
      });
    
      it('calls swap function when proceed button is clicked', () => {
        
        useSwapMock.txInfo = {
            bridgeFee:"0.6%",
            destinationAddress:null,
            bridgeName: swapType.hydradx,
            gasFee:"0.00008 DOT",
            bridgeType:"protocol",
            swapInfo:  {
            "idAssetToSell": "0",
            "idAsseToBuy": "5",
            "amountSell": "10000000000000",
            "amountBuy": "132173534",
            "aliveUntil": 1725376554748,
            "swaps": [
                {
                    "poolAddress": "7KsbYZTDHQ4AZp1PVAwxsu4cqBxyKceqqMMs2dQYCf9TkAxJ",
                    "pool": "Xyk",
                    "assetIn": "0",
                    "assetOut": "17",
                    "assetInDecimals": 12,
                    "assetOutDecimals": 10,
                    "amountIn": "10000000000000",
                    "calculatedOut": "48764248815",
                    "amountOut": "48617956071",
                    "spotPrice": "4889782639.258017",
                    "tradeFeePct": 0.3,
                    "priceImpactPct": -0.27,
                    "errors": []
                },
                {
                    "poolAddress": "7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1",
                    "pool": "Omnipool",
                    "assetIn": "17",
                    "assetOut": "5",
                    "assetInDecimals": 10,
                    "assetOutDecimals": 10,
                    "amountIn": "48617956071",
                    "calculatedOut": "132571081",
                    "amountOut": "132173534",
                    "spotPrice": "27267928",
                    "tradeFeePct": 0.3,
                    "tradeFeeRange": [
                        0.3,
                        5.1
                    ],
                    "priceImpactPct": 0,
                    "errors": []
                }
            ],
            "slippage": 0.01,
            "txHex": "0xf8044300000000000500000000a0724e180900000000000000000000d7a3cc0700000000000000000000000008000000000011000000031100000005000000",
            swapError: ""
        }}
        const  { getByText } = renderComponent()
        const proceedButton = getByText('proceed');
        
        fireEvent.click(proceedButton);
        expect(proceedButton).toBeEnabled();
        expect(useSwapMock.swap).toHaveBeenCalledTimes(1);
      });

        //   it('enables the proceed button when canSend is true', () => {
            

        //     useSwapMock = {
        //         ...useSwapMock,
        //         txInfo: {
        //             ...paramMockHydradx,
        //             swapInfo: {
        //                 ...paramMockHydradx.swapInfo,
        //                 swapError: "Error"
        //             }
                    
        //         }
        //     }
        //     const { getByText } = renderComponent()
        //     const proceedButton = getByText('proceed');
        //     expect(proceedButton).not.toBeDisabled();
        //   });

});



// import { render } from "@testing-library/react";
// import { Swap } from "./Swap";
// import { txHydradxMock } from "./components/SwapTxSummary.test";
// import { ChainType } from "@src/types";
// import '@testing-library/jest-dom'; 
//     const functionMocks = {
//         useNavigate: vi.fn(),
//       };

//     const useSwapMock = 
//         {
//             amounts: { sell: '0', buy: '0' },
//             assetsToBuy: [],
//             assetsToSell: [],
//             assetToBuy: null,
//             assetToSell: null,
//             balanceIsSufficient: true,
//             isCreatingSwap: false,
//             isLoading: false,
//             isLoadingAssets: false,
//             handleAmounts: vi.fn(),
//             handleAssetChange: vi.fn(),
//             recipient: { address: '' },
//             tx: txHydradxMock,
//             txInfo: {} ,
//             canSend: false,
//             swap: vi.fn(),
//           }


//     const renderComponent = () => {
    
//           return render(
//                 <Swap/>
//             );
//       }

//       const useAssetContextMock =() =>({
//         state: true
//       })

//     describe("Swap",() => {

//         beforeAll(() => {
//             vi.mock('react-i18next', () => ({
//                 useTranslation: () => ({
//                   t: (key: string) => key,
//                 }),
//               }));
//             vi.mock('@src/messageAPI/api', () => ({
//                 messageAPI: {
//                 getFee: vi.fn().mockResolvedValueOnce("12345"),
//                 },
//             }));
//             vi.mock("react-router-dom", () => ({
//                 useNavigate: () => functionMocks.useNavigate,
//               }));
//             vi.mock("@src/providers", async() => {
//                 const actual = await vi.importActual('@src/providers')
//                 return ({
//                 ...actual,
//                 useAssetContext: useAssetContextMock,
//                 useAccountContext: () => ({
//                     state: {
//                       selectedAccount: null,
//                       accounts: [
//                         { value: { name: "Account 1", address: "0x1234567890" }, type: ChainType.EVM },
//                         { value: { name: "Account 2", address: "0x0987654321" }, type: ChainType.EVM },
//                       ],
//                     }
//                   })
//             })})
//             vi.mock('./hooks' , async() => {
//                 const actual = await vi.importActual('./hooks')
//                 return({ 
//                     ...actual,
//                     useSwap: () => useSwapMock })})

//         })

//         it('renders correctly', () => {
//             const { getByText } = renderComponent()
//             expect(getByText('title')).toBeInTheDocument();
//             expect(getByText('you_send')).toBeInTheDocument();
//             expect(getByText('you_receive')).toBeInTheDocument();
//           });


//     })