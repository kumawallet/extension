import { SwapTxSummary } from "./SwapTxSummary";
import { Tx } from "../hooks";
import { fireEvent, render } from "@testing-library/react";


const renderComponent = (tx:Tx) => {
    return render( 
        <SwapTxSummary 
            tx={tx}
            onBack={onBackMock}
            onConfirm={onConfirm}
             />
    );
  };

export const txHydradxMock = {
    swapId: "0xf804430005420f0005000000",
    addressBridge: "Q99VSKewEEDF5hBnJmLS2b6",
    addressFrom: "Q99VSKewEEDF5hBnJmLS2b6",
    addressTo: "Q99VSKewEEDF5hBnJmLS2b6",
    amountFrom: "10",
    amountTo: "132217416",
    amountBridge: "10000000000000",
    chainFrom: {
        "name": "HydraDX",
        "image": "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png"
    },
    chainTo: {
        "name": "HydraDX",
        "image": "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png"
    },
    assetFrom: {
        "symbol": "HDX",
        "image": "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
        "decimals": 12
    },
    assetTo: {
        "symbol": "DOT",
        "image": "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
        "isAproximate": true
    },
    fee: {
        "estimatedFee": "0.00008 DOT",
        "estimatedTotal": "0.00008 DOT"
    },
    aliveUntil: 1725455595516
}
const onBackMock = vi.fn()
const onConfirm = vi.fn()



describe("SwapTxSummary", () => {
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
    })

    it('should render the component correctly', () => {
       const { getByText } = renderComponent(txHydradxMock) 
    
        expect(getByText('sender')).to.exist;
        expect(getByText('to')).to.exist;
        expect(getByText('network')).to.exist;
        expect(getByText('amount')).to.exist;
        expect(getByText('estimated_fee')).to.exist;
        expect(getByText('tx_confirm_info')).to.exist;
      });

      it('should call onBack when back button is clicked', () => {
        const { getByTestId } = renderComponent(txHydradxMock)
    
        const backButtonArrow = getByTestId("onBack-arrow")
        const backButtonText = getByTestId("onBack-text")
        fireEvent.click(backButtonArrow);
        fireEvent.click(backButtonText);

        expect(onBackMock).toHaveBeenCalled();
        expect(onBackMock).toHaveBeenCalled();
      });
      it("should show data tx", () => {
        const { getByText, getAllByText } = renderComponent(txHydradxMock) 
        
        const address = getAllByText('Q99VSKewEEDF...F5hBnJmLS2b6')
        expect(address).toHaveLength(2);
        expect(getByText('10 HDX')).to.exist;
      })
})