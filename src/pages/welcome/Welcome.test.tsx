import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { Welcome } from "./Welcome";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import en from "@src/i18n/en.json";

const useNavigateMock = vi.fn();
const create = vi.fn();

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Welcome />
    </I18nextProvider>
  );
};

describe("Welcome", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => () => useNavigateMock(),
    }));

    vi.mock("@src/utils/env", () => ({
      version: "1.0.0",
      getWebAPI: () => ({
        tabs: {
          getCurrent: () => Promise.resolve(undefined),
          create: () => create(),
        },
        runtime: {
          getURL: vi.fn(),
          connect: vi.fn().mockReturnValue({
            onMessage: {
              addListener: vi.fn(),
            },
          }),
        },
      }),
    }))

    vi.mock("@src/storage/entities/BaseEntity", () => ({
      default: class {
        constructor() { }
      }
    }))
  });

  it("should render", () => {
    renderComponent();
    expect(screen.getByText(en.welcome.welcome_message)).toBeTruthy();
  });

  it("should open new tab", async () => {
    renderComponent();
    const importBtn = screen.getByText(
      en.welcome.import_wallet
    ).parentElement;
    if (importBtn) {
      fireEvent.click(importBtn);
      await waitFor(() => expect(create).toHaveBeenCalled());
    }
  });
});
