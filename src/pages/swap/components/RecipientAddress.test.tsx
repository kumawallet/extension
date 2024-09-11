import i18n from "@src/utils/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { RecipientAddress,RecipientAddressProps } from "./RecipientAddress";
import '@testing-library/jest-dom'; 

const onChangeAddress = vi.fn()

const onTogleRecipientMock = vi.fn()



const paramsMock: RecipientAddressProps = {
    address: "",
    isNotOwnAddress: false,
    isValidAddress: true,
    onAddressChange: onChangeAddress,
    onTogleRecipient: onTogleRecipientMock
}

const renderComponent = ({ address,isNotOwnAddress,isValidAddress,onAddressChange,onTogleRecipient} : RecipientAddressProps) => {
    return render(
        <I18nextProvider i18n={i18n}>
          <RecipientAddress
                address={address}
                isNotOwnAddress={isNotOwnAddress}
                isValidAddress={isValidAddress}
                onAddressChange={onAddressChange}
                onTogleRecipient={onTogleRecipient}
               />
        </I18nextProvider>
      );
}

describe("RecipientAddress", () => {
    it("should render component", () => {
        const { getAllByText } = renderComponent(paramsMock);
        const elements = getAllByText('Recipent address')
        expect(elements[0]).to.exist;
    })

    it('should call onTogleRecipient when Switch is toggled', () => {
       const { getByRole } = renderComponent(paramsMock)
        
        const toggle = getByRole('switch');
        fireEvent.click(toggle);
    
        expect(paramsMock.onTogleRecipient).toHaveBeenCalled();
      });

      it('should call onAddressChange when address is changed', () => {
        const newParamsMock = {
            ...paramsMock,
            isNotOwnAddress: true
        }

        const { getByRole } = renderComponent(newParamsMock)
    
        const input = getByRole('textbox');
        fireEvent.change(input, { target: { value: '0x123' } });
    
        expect(newParamsMock.onAddressChange).toHaveBeenCalledWith('0x123');
      })

      it('should disable input if isOptional is true and isNotOwnAddress is false', () => {
        const newParamsMock = {
            ...paramsMock,
            isOptional: true
        }

        const { getByRole } = renderComponent(newParamsMock)
    
        const input = getByRole('textbox');
        expect(input).toHaveAttribute('disabled');
      });

      it('should show invalid address message if isValidAddress is false', () => {
        const newParamsMock = {
            ...paramsMock,
            isValidAddress: false
        }

        const { getByText } = renderComponent(newParamsMock)
    
        expect(getByText('invalid_address')).toBeInTheDocument();
      });
      it('should not render Switch if isOptional is false', () => {
        const newParamsMock = {
            ...paramsMock,
            isOptional: false
        }

        const { queryByRole } = renderComponent(newParamsMock)
    
        expect(queryByRole('Switch')).not.toBeInTheDocument();
      });

})