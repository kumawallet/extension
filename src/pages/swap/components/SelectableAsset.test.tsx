import { render} from '@testing-library/react';
import { SelectableAsset } from './SelectableAsset'; // Ajusta la ruta según sea necesario
import { SwapAsset } from '../base';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { swapType } from '../hooks';
import { I18nextProvider } from 'react-i18next';
import i18n from '@src/utils/i18n';
import '@testing-library/jest-dom'; 

const mockOnChange = vi.fn();

const options: SwapAsset[] = 
    [
        {
            "id": "20",
            "symbol": "WETH",
            "label": "WETH",
            "image": "https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png",
            "balance": "0",
            "decimals": 18,
            "network": "hydradx",
            "name": "Ethereum (Moonbeam Wormhole)",
            "chainId": "20",
            "type": swapType.hydradx
        },
        {
            "id": "101",
            "symbol": "2-Pool",
            "label": "2-Pool",
            "image": "https://chain-list-assets.subwallet.app/assets/chain-assets/hydradx_main-local-2pool.png",
            "balance": "0",
            "decimals": 18,
            "network": "hydradx",
            "name": "iBTC, WBTC",
            "chainId": "101",
            "type": swapType.hydradx
        },
        {
            "id": "1000099",
            "symbol": "ACA",
            "label": "ACA",
            "image": "https://s2.coinmarketcap.com/static/img/coins/64x64/6756.png",
            "balance": "0",
            "decimals": 12,
            "network": "hydradx",
            "name": "Acala",
            "chainId": "1000099",
            "type": swapType.hydradx
        },
        {
            "name": "KSM",
            "symbol": "KSM",
            "label": "KSM",
            "image": "https://images.stealthex.io/coins-color/6299eafcde5ae50018e778ea-ksm_c.svg",
            "id": "KSM",
            "balance": "0",
            "decimals": 0,
            "network": "kusama",
            "chainId": "kusama",
            "type": swapType.stealhex
        },
        {
            "name": "SDN",
            "symbol": "SDN",
            "label": "SDN",
            "image": "https://images.stealthex.io/coins-color/62a87c39de5ae50018e789e4-sdn_c.svg",
            "id": "SDN",
            "balance": "0",
            "decimals": 0,
            "network": "shiden",
            "chainId": "shiden",
            "type": swapType.stealhex
        }
    ];

const defaultValue: SwapAsset = {
    "id": "20",
    "symbol": "WETH",
    "label": "WETH",
    "image": "https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png",
    "balance": "0",
    "decimals": 18,
    "network": "hydradx",
    "name": "Ethereum (Moonbeam Wormhole)",
    "chainId": "20",
    "type": swapType.hydradx
}

type paramsSelectableAsset = {
    defaulValue: SwapAsset;
    onChange: () => void;
    options: SwapAsset[];
    value: SwapAsset;
    isReadOnly: boolean;
    type:"sell"| "buy";
    isLoading ?: boolean
    label: string;
}

const onChangeMock = vi.fn()


const paramsMock: paramsSelectableAsset = {
    defaulValue: defaultValue,
    onChange: onChangeMock,
    options: options,
    value: defaultValue,
    isReadOnly: true,
    type: "sell",
    label: 'Asset'
    
}

const renderComponent = ({defaulValue,onChange,options,value, isReadOnly, type, isLoading=false,label} : paramsSelectableAsset) => {
    return render(
        <I18nextProvider i18n={i18n}>
          <SelectableAsset
            defaulValue={defaulValue}
            isLoading={isLoading}
            isReadOnly={isReadOnly}
            onChange={onChange}
            options={options}
            position='left'
            value={value}
            type={type}
            label={label}
               />
        </I18nextProvider>
      );
}

describe('SelectableAsset', () => {

  beforeEach(() => {
    mockOnChange.mockClear();
    vi.mock("@src/components/common", () => ({
      Loading: () => <div data-testid="loading-icon" />,
    }));
    
    vi.mock("react-icons/bs", () => ({
      BsCoin: () => <div data-testid="coin-icon" />,
    }));
  });

  it('should render correctly', () => {
    
    const { getByDisplayValue, getByTestId } = renderComponent(paramsMock)

    const imgElement = getByTestId("default-20-hydradx");
    expect(imgElement).to.exist;
    expect(getByDisplayValue(/WETH/i)).to.exist;
  });

  

  // it('shouls show options', () => {
  //   const { getByRole, getByTestId} = renderComponent(paramsMock)
  //   const button = getByTestId('button');
  //   fireEvent.click(button);

  //   options.forEach(option => {
  //     expect(getByTestId(option.id)).toBeInTheDocument()
  //   });
  // });



});
