import { fireEvent, render, screen } from "@testing-library/react";
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
    (window.chrome as any) = {
      runtime: {
        getURL: vi.fn(),
      },
      tabs: {
        create: () => create(),
      },
    };
  });
  it("should render", () => {
    renderComponent();
    expect(screen.getByText(en.add_account.title)).toBeTruthy();
  });

  it("should redirect to import account view", () => {
    renderComponent();
    const importBtn = screen.getByText(
      en.add_account.import_wallet
    ).parentElement;
    if (importBtn) {
      fireEvent.click(importBtn);
      expect(create).toHaveBeenCalled();
    }
  });

  it("should redirect to create account view", () => {
    renderComponent();
    const importBtn = screen.getByText(
      en.add_account.create_wallet
    ).parentElement;
    if (importBtn) {
      fireEvent.click(importBtn);
      expect(create).toHaveBeenCalled();
    }
  });
});
