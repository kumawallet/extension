import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { vi } from "vitest";
import i18n from "@src/utils/i18n";
import { AddAccount } from "./AddAccount";
import en from "@src/i18n/en.json";

const create = vi.fn();

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AddAccount />
    </I18nextProvider>
  );
};

describe("AddAccount", () => {
  beforeAll(() => {
    vi.mock("@src/utils/env", () => ({
      getWebAPI: () => ({
        tabs: {
          getCurrent: () => Promise.resolve(undefined),
          create: () => create(),
        },
        runtime: {
          getURL: vi.fn(),
        },
      }),
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));
  });
  it("should render", () => {
    renderComponent();
    expect(screen.getByText(en.add_account.title)).toBeTruthy();
  });

  it("should open new tab", async () => {
    renderComponent();
    const importBtn = screen.getByText(
      en.add_account.import_wallet
    ).parentElement;
    if (importBtn) {
      fireEvent.click(importBtn);
      await waitFor(() => expect(create).toHaveBeenCalled());
    }
  });
});
