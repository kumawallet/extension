import { act, fireEvent, renderHook, waitFor } from "@testing-library/react";
import { useLoading } from "./useLoading";

describe("useLoading", () => {
  it("should set isLoading to true", () => {
    const {
      result: { current },
    } = renderHook(() => useLoading());

    act(() => {
      current.starLoading();
    });
    waitFor(() => expect(current.isLoading).toBe(true));
  });

  it("should set isLoading to false", () => {
    const {
      result: { current },
    } = renderHook(() => useLoading(true));

    act(() => {
      current.endLoading();
    });
    waitFor(() => expect(current.isLoading).toBe(false));
  });
});
