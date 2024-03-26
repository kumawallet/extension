import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { vi } from "vitest";

// // extends Vitest's expect method with methods from react-testing-library

beforeEach(() => {
  (globalThis as unknown as Record<string, boolean>).IS_REACT_ACT_ENVIRONMENT =
    true;
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Stub the global ResizeObserver
vi.stubGlobal("ResizeObserver", ResizeObserverMock);
