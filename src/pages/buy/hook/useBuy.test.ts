import { renderHook } from "@testing-library/react";
import useBuy from "./useBuy";

const FAKE_API_KEY = "123456789";

describe("useBuy", () => {
  beforeAll(() => {
    import.meta.env.VITE_TRANSAK_API_KEY = FAKE_API_KEY;
  });

  it("should call createOrder", async () => {
    const { result } = renderHook(() => useBuy());

    const url = await result.current.createOrder(
      "ETH",
      "0x123",
      "mainnet",
      true
    );

    expect(url).contain(FAKE_API_KEY);
  });
});
