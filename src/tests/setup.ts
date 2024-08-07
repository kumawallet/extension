import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { vi } from "vitest";

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
vi.stubGlobal("chrome", {
  tabs: {
    getCurrent: () =>
      Promise.resolve({
        id: "1",
      }),
    create: vi.fn(),
  },
  runtime: {
    getURL: vi.fn(),
    connect: vi.fn().mockReturnValue({
      onMessage: {
        addListener: vi.fn(),
      },
      onDisconnect: {
        addListener: vi.fn(),
      },
    }),
  },
});
