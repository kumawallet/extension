import { act, renderHook } from "@testing-library/react";
import { useLoading } from "./useLoading";

describe("useLoading", () => {
  it("should set isLoading to true", () => {
    const { result } = renderHook(() => useLoading());

    act(() => {
      result.current.starLoading();
    });
    expect(result.current.isLoading).toBe(true);
  });

  it("should set isLoading to false", () => {
    const { result } = renderHook(() => useLoading(true));

    act(() => {
      result.current.endLoading();
    });
    expect(result.current.isLoading).toBe(false);
  });
});
