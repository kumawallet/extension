import i18n from "@src/utils/i18n";
import { I18nextProvider } from "react-i18next";
import { AssetAmountInput, AssetAmountInputProps } from "./AssetAmountInput";
import { fireEvent, render } from "@testing-library/react";
import '@testing-library/jest-dom'; 

const maxAmountMock = vi.fn()
const onChangeMock = vi.fn()
const mockSelectableAsset = <div data-testid="mock-selectable-asset">Mock Asset</div>;
const paramsMock : AssetAmountInputProps = {
  amount: "0",
  balance: "301.5543",
  hasMaxOption: true,
  isDisabled: false,
  isLoading:false,
  isReadOnly: false,
  label: "You Send",
  onMax: maxAmountMock,
  onValueChange: onChangeMock,
  isLoadingBalance: false,
  type: "sell",
  isPairValid: true,
  showBalance: true,
  selectableAsset: mockSelectableAsset

}

const renderComponent = ({ amount,balance,label,onValueChange,selectableAsset,type,
  isDisabled,isLoading, isLoadingBalance,isPairValid, hasMaxOption,isReadOnly,minSellAmount,onMax,showBalance} : AssetAmountInputProps) => {

    return render(
        <I18nextProvider i18n={i18n}>
          <AssetAmountInput
            amount={amount}
            balance={balance}
            label={label}
            onValueChange={onValueChange}
            selectableAsset={selectableAsset}
            type={type}
            hasMaxOption={hasMaxOption}
            isDisabled={isDisabled}
            isLoading={isLoading}
            isLoadingBalance={isLoadingBalance}
            isPairValid={isPairValid}
            isReadOnly={isReadOnly}
            onMax={onMax}
            minSellAmount={minSellAmount}
            showBalance={showBalance}

                
               />
        </I18nextProvider>
      );
}

describe("AssetAmountInput", () => {
  beforeAll(
    () => {
      vi.mock("@src/components/common", () => ({
        Loading: () => <div data-testid="loading" />,
      }));
    }
  )
  it("renders correctly with given props", () => {
    const { getByText, getByDisplayValue } = renderComponent(paramsMock);

    expect(getByText("You Send")).toBeInTheDocument();
    expect(getByText("balance: 301.5543")).toBeInTheDocument();
    expect(getByDisplayValue("0")).toBeInTheDocument();
  });
  it("disables input if 'isDisabled' is true", () => {
    const newParamsMock = {
      ...paramsMock,
      isDisabled: true
    }
    const { getByDisplayValue } = renderComponent(newParamsMock);

    const input = getByDisplayValue("0");
    expect(input).toBeDisabled();
  });
  it("renders 'Loading' when 'isLoading' is true", () => {
    const newParamsMock = {
      ...paramsMock,
      isLoading: true
    }
    const { getByTestId } = renderComponent(newParamsMock);

    expect(getByTestId("loading")).toBeInTheDocument();
  });

  it("calls 'onValueChange' when the input value changes", () => {
    const { getByDisplayValue } = renderComponent(paramsMock)

    const input = getByDisplayValue("0");
    fireEvent.change(input, { target: { value: "150" } });

    expect(paramsMock.onValueChange).toHaveBeenCalledWith("150");
  });

  it("displays minSellAmount when it is provided and the pair is valid", () => {
    const newParamsMock = {
      ...paramsMock,
      minSellAmount: "50",
      isPairValid:true
    }
    const { getByText } = renderComponent(newParamsMock);

    expect(getByText("Min amount to transfer: 50")).toBeInTheDocument();
  });

  it("shows the max button if 'hasMaxOption' is true and calls 'onMax' when clicked", () => {
    const newParamsMock = {
      ...paramsMock,
      hasMaxOption: true
    }
    const { getByText } = renderComponent(newParamsMock)

    const maxButton = getByText("max");
    fireEvent.click(maxButton);
    expect(maxAmountMock).toHaveBeenCalled();
  });

  it("displays loading spinner when 'isLoadingBalance' is true", () => {
    const newParamsMock = {
      ...paramsMock,
      isLoadingBalance: true
    }
    const { getByTestId } = renderComponent(newParamsMock)

    expect(getByTestId("loading")).toBeInTheDocument();
  });
})