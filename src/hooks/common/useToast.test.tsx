import { renderHook } from "@testing-library/react";
import { useToast } from "./useToast";
import { vi } from "vitest";

const errorMock = vi.fn();
const successMock = vi.fn();

vi.mock("react-toastify", () => ({
  toast: {
    error: () => errorMock(),
    success: () => successMock(),
    POSITION: {
      TOP_CENTER: "",
    },
  },
}));

describe("useToast", () => {
  it("showErrorToast", () => {
    const {
      result: { current },
    } = renderHook(() => useToast());

    current.showErrorToast("Error message");
    expect(errorMock).toHaveBeenCalled();
  });

  it("showSuccessToast", () => {
    const {
      result: { current },
    } = renderHook(() => useToast());

    current.showSuccessToast("Error message");
    expect(successMock).toHaveBeenCalled();
  });
});
