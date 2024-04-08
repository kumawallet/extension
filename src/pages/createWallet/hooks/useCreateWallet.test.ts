import { renderHook } from "@testing-library/react";
import { useCreateWallet } from "./useCreateWallet";

const navigate = vi.fn();

describe("useCreateWallet", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => navigate,
    }));
  });

  it("should call goToWelcome", () => {
    const {
      result: { current },
    } = renderHook(() => useCreateWallet());

    current.goToWelcome();
    expect(navigate).toHaveBeenCalled();
  });
});
