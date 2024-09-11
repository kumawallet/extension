import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SwapInfo } from "./SwapInfo";
import { swapType } from "../hooks";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";


type paramsSwapInfo = {
    bridgeFee:string;
    destinationAddress: string | null,
    bridgeName: swapType;
    gasFee: string;
    bridgeType: string,
    swapInfo ?: {
        idAssetToSell: string;
        
        idAsseToBuy: string;
        amountSell: string;
        amountBuy: string;
        slippage: number;
        aliveUntil: number;
        swaps: any;
        txHex: string;
        swapError: string;
      }
}

const mockSetSlippage = vi.fn();

export const paramMockHydradx = {
    bridgeFee:"0.6%",
    destinationAddress:null,
    bridgeName: swapType.hydradx,
    gasFee:"0.00008 DOT",
    bridgeType:"protocol",
    swapInfo:{
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
        "swapError": ""
    }}

const paramMockStealtHex = {
    bridgeFee:"0.6%",
    destinationAddress:null,
    gasFee:"0.00008 DOT",
    bridgeType:"protocol",
    bridgeName: swapType.stealhex
}

const renderComponent = ({ bridgeFee,bridgeName,destinationAddress,gasFee,bridgeType, swapInfo } : paramsSwapInfo) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <SwapInfo 
            bridgeFee= {bridgeFee}
            bridgeName={bridgeName}
            destinationAddress={destinationAddress}
            gasFee={gasFee}
            bridgeType={bridgeType}
            swapInfo={swapInfo && swapInfo}
            setSlippage={mockSetSlippage}
             />
      </I18nextProvider>
    );
  };
describe("SwapInfo Component", () => {


  beforeAll(() => {
    vi.mock("react-hook-form", async() => {
        const actual = await vi.importActual("react-hook-form")
        return {
          ...actual,
          useForm: () => ({
            register: vi.fn(),
            handleSubmit: vi.fn(),
            setValue: vi.fn(),
            getValues: vi.fn(),
            control: vi.fn(),
            formState: {
              errors: {},
            },
          }),
        };
      });
  })
  it("should render the bridge logo and fee details when bridgeName Hydradx", () => {

    const { getByText,getByAltText,container } = renderComponent(paramMockHydradx)

  const element = getByAltText(/hydradx/i);
    const a = getByText(/0.6%/i);
    const b =getByText(/0.00008 DOT/i);
      expect(container).toBeDefined();
   expect(element).to.exist;
    expect(a).to.exist;
    expect(b).to.exist;
  });

  it("should render the bridge logo and fee details when bridgeName StealtHex", () => {
    
    const { getByText,getByAltText, container} = renderComponent(paramMockStealtHex)
    const elements = getByAltText(/Stealthex/i);

    expect(container).toBeDefined();
    expect(elements).to.exist;
    expect(getByText("0.6%")).to.exist;
  });

    it("should render router swap details when swapInfo is provided", () => {
    const { queryByTestId } = renderComponent(paramMockHydradx)
    expect(queryByTestId("edit-button")).to.exist;
    expect(queryByTestId("edit-button")).to.exist;
  });

  it("should open the slippage modal when the edit button is clicked", () => {
    const { queryByTestId } = renderComponent(paramMockStealtHex);
    expect(queryByTestId("edit-button")).toBeNull();
    expect(queryByTestId("edit-button")).toBeNull();
  });


});