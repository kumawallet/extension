import { selectedEVMAccountMock } from "@src/tests/mocks/account-mocks";
import { fireEvent, render } from "@testing-library/react";
import { Receive } from "./Receive";

const copyToClipboard = vi.fn();

describe("Receive", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));

    vi.mock("@src/providers", () => ({
      useAccountContext: () => ({
        state: {
          selectedAccount: selectedEVMAccountMock,
        },
      }),
    }));

    // mock useCopyToClipboard
    vi.mock("@src/hooks", () => ({
      useCopyToClipboard: () => ({
        Icon: () => null,
        copyToClipboard: () => copyToClipboard(),
      }),
    }));
  });

  it("should render", () => {
    const { getByTestId } = render(<Receive />);
    expect(getByTestId("account-button")).toBeDefined();
  });

  it("should copy to clipboard", () => {
    const { getByTestId } = render(<Receive />);
    const accountButton = getByTestId("account-button");

    fireEvent.click(accountButton);

    expect(copyToClipboard).toHaveBeenCalled();
  });
});
