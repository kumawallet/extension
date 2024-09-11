import { render, renderHook } from "@testing-library/react";
import { SendTxForm } from "../Send";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { ErrorMessage } from "./ErrorMessage";

type MOCK_WATCH_TYPE = keyof Partial<SendTxForm>;


const _WATCH_NATIVE_MOCK: Partial<SendTxForm> = {
  amount: "1",
  asset: {
    symbol: "DOT",
    decimals: 10,
    balance: "3000000000000000000000000000000", 
  } as SendTxForm["asset"],
  fee: "100000000",
  originNetwork: {
    symbol: "DOT",
  } as SendTxForm["originNetwork"],
  isTipEnabled: true,
  tip: "100000000", 
  senderAddress: "EEgxDFmLS2",
};


const WATCH_NATIVE_MOCK: Partial<SendTxForm> = {
  amount: "2",
  asset: {
    symbol: "DOT",
    decimals: 10,
    balance: "1",
  } as SendTxForm["asset"],
  fee: "100000000",
  originNetwork: {
    symbol: "DOT",
  } as SendTxForm["originNetwork"],
  isTipEnabled: true,
  tip: "100000000",
};

const _WATCH_XCM_MOCK: Partial<SendTxForm> = {
  amount: "1",
  asset: {
    symbol: "DOT",
    decimals: 12,
    balance: "1453828887000000000",
  } as SendTxForm["asset"],
  fee: "1000000",
  originNetwork: {
    symbol: "HDX",
    id: "hydradx"
  } as SendTxForm["originNetwork"],
  isTipEnabled: false,
  senderAddress: "EEgxDFmLS2"
};

const WATCH_XCM_MOCK: Partial<SendTxForm> = {
  amount: "2",
  asset: {
    symbol: "DOT",
    decimals: 12,
    balance: "14538288870",
  } as SendTxForm["asset"],
  fee: "100000000",
  originNetwork: {
    symbol: "DOT",
  } as SendTxForm["originNetwork"],
  isTipEnabled: true,
  tip: "100000000",
  senderAddress: "EEgxDFmLS2"
};

const useFormContextMock = vi.hoisted(() => ({
  watch: (key: MOCK_WATCH_TYPE) => WATCH_NATIVE_MOCK[key],
}));

const mockSetvalue = vi.fn()

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ErrorMessage />
    </I18nextProvider>
  );
};


describe("ErrorMessage", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        setValue:  mockSetvalue,
        watch: useFormContextMock.watch,
      }),


    
    }));
    

    vi.mock('@src/providers', () => ({
      useAssetContext: vi.fn().mockReturnValue({
        state: {
          assets: {
            'IMPORTED_WASM-EEgxDFmLS2': {

              "hydradx":{
                      subs: [], 
                      assets: [{
                        amount: "1.84",
                        balance:"328554350420982",
                        decimals : 12,
                        id:"-1",
                        price:"0.005599788084222464",
                        symbol:"HDX",
                        transferable:"328554350420982",
                        }, 
                      {
                        amount: "3.57",
                        balance: "8305963427",
                        decimals:10,
                        id:"5",
                        name:"DOT",
                        price:"4.296932721713714",
                        symbol:"DOT",
                        transferable:"8305963427"
                      }]
              },
              "polkadot": {
                      subs: [],
                      assets: [
                        {
                          amount:"6.26",
                          balance:"14538288870",
                          decimals:10,
                          id:"-1",
                          price:"4.309026724663414",
                          symbol:"DOT",
                          transferable:"14538288870"
                        }
                      ]
              }

              
              },
            'IMPORTED_WASM-EEgxDFm1tS2': {

                "hydradx":{
                        subs: [], 
                        assets: [{
                          amount: "1",
                          balance:"3285543504209",
                          decimals : 12,
                          id:"-1",
                          price:"0.0055997880842224",
                          symbol:"HDX",
                          transferable:"3285543504202",
                          }, 
                        {
                          amount: "3",
                          balance: "830596342",
                          decimals:10,
                          id:"5",
                          name:"DOT",
                          price:"4.2969327217137",
                          symbol:"DOT",
                          transferable:"83059634"
                        }]
                },
                "polkadot": {
                        subs: [],
                        assets: [
                          {
                            amount:"6",
                            balance:"145382888",
                            decimals:10,
                            id:"-1",
                            price:"4.3090267246634",
                            symbol:"DOT",
                            transferable:"145382888"
                          }
                        ]
                }
  
                
                }
          }
        }
      })
    })
  );
});
  describe("render", () => {
    it("should render with native asset", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });

    it("should render with xcm asset", () => {
      useFormContextMock.watch = (key: MOCK_WATCH_TYPE) => WATCH_XCM_MOCK[key];
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });

  
describe("ErrorMessage Component", () => {
  it("should correctly calculate haveSufficientBalance when native asset is present and fee is covered", () => {
    useFormContextMock.watch = (key: MOCK_WATCH_TYPE) => _WATCH_NATIVE_MOCK[key];
    
    renderHook(() => ErrorMessage({ containerClassname: "" }));
    
    expect(mockSetvalue).toHaveBeenCalledWith("haveSufficientBalance", true);
  });

  it("should return false when there is not enough native asset to cover the fee", () => {
    const insufficientBalanceMock: Partial<SendTxForm> = {
      ...WATCH_NATIVE_MOCK,
      fee: "1500000000", 
    };
    
    useFormContextMock.watch = (key: MOCK_WATCH_TYPE) => insufficientBalanceMock[key];

    renderHook(() => ErrorMessage({ containerClassname: "" }));

    expect(mockSetvalue).toHaveBeenCalledWith("haveSufficientBalance", false);
  });
  it("should correctly calculate haveSufficientBalance when no native asset is balance and fee is covered", () => {
    useFormContextMock.watch = (key: MOCK_WATCH_TYPE) => _WATCH_XCM_MOCK[key];
    
    renderHook(() => ErrorMessage({ containerClassname: "" }));
    
    expect(mockSetvalue).toHaveBeenCalledWith("haveSufficientBalance", true);
  });

  it("should return false when asset is no native and balance and fee not coverage ", () => {
    const  _WATCH_XCM_MOCK_WITH_TIP: Partial<SendTxForm> = {
      ..._WATCH_XCM_MOCK,
      amount: "1000000000",
      isTipEnabled: true,
      tip: "100000000", 
    };
    
    useFormContextMock.watch = (key: MOCK_WATCH_TYPE) => _WATCH_XCM_MOCK_WITH_TIP[key];

    renderHook(() => ErrorMessage({ containerClassname: "" }));

    expect(mockSetvalue).toHaveBeenCalledWith("haveSufficientBalance", false);
  });
});
});
