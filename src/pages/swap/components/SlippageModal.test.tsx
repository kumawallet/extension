import { render, fireEvent } from "@testing-library/react";
import { SlippageModal, SlippageForm } from "./SlippageModal";
import { useForm, FormProvider } from "react-hook-form";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import '@testing-library/jest-dom'; 

// Helper component to wrap the modal with react-hook-form context
const Wrapper = ({ children }) => {
  const methods = useForm<SlippageForm>({
    defaultValues: { slippage: "" },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

const mockOnClose = vi.fn();
const mockSetSlippage = vi.fn();
const slippageProps: SlippageProps = {
  isOpen: true,
  onClose: mockOnClose,
  setSlippage: mockSetSlippage,
  slippage: "0.01",
};

type SlippageProps = {
  isOpen: boolean;
  onClose: () => void;
  setSlippage: (val: number) => void;
  slippage: string;
};

const renderComponent = ({
  isOpen,
  onClose,
  setSlippage,
  slippage,
}: SlippageProps) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Wrapper>
        <SlippageModal
          isOpen={isOpen}
          onClose={onClose}
          setSlippage={setSlippage}
          slippag={slippage}
        />
      </Wrapper>
    </I18nextProvider>
  );
};

describe("SlippageModal", () => {
  it("should render the modal with the correct default values", () => {
    const { getByText } = renderComponent(slippageProps);

    
    expect( getByText((content, element) => content.includes("Slippage") && content.includes("1%"))).toBeInTheDocument();
  });

  it("should call onClose when clicking the close button", () => {
    const { getByRole } = renderComponent(slippageProps);

    const closeButton = getByRole("button", { name: /cancel/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
