import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@src/utils/i18n";
import { SignMessage } from "./SignMessage";
import { stringToU8a } from "@polkadot/util";
import { AccountType } from "@src/accounts/types";
import { selectedEVMAccountMock } from "@src/tests/mocks/account-mocks";
import { en } from "@src/i18n";
import { parseIncomingQuery } from "@src/utils/utils";

const sendMessage = vi.fn();

const renderComponent = () => {
  const query = `?params={${btoa(
    JSON.stringify({
      message: "message",
      origin: "http://vitest.local",
    })
  )}}`;

  const { params, ...metadata } = parseIncomingQuery(query);

  return render(
    <I18nextProvider i18n={i18n}>
      <SignMessage
        params={params as unknown as { message: string }}
        metadata={metadata}
        onClose={vi.fn()}
      />
    </I18nextProvider>
  );
};

describe("SignMessage", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useThemeContext: () => ({
        color: "red",
      }),
    }));


    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getTrustedSites: vi.fn().mockReturnValue(["http://vitest.local"]),
        showKey: () => "test key",
        addTrustedSite: vi.fn(),
        isAuthorized: vi.fn().mockReturnValue(true),
      },

    }))

    vi.mock("@polkadot/keyring", () => {
      return {
        Keyring: class {
          addFromMnemonic = vi.fn().mockReturnValue({
            sign: vi.fn().mockReturnValue(stringToU8a("test signature")),
          });
        },
      };
    });

    vi.mock("ethers");

    vi.mock("@src/utils/env", () => ({
      version: "1.0.0",
      getWebAPI: () => ({
        windows: {
          getCurrent: () => ({
            id: 1,
          }),
        },
        runtime: {
          sendMessage: () => sendMessage(),
          connect: () => null,
          onMessage: {
            addListener: () => null,
            removeListener: () => null,
          },
        },
      }),
    }));

    vi.mock("react-router-dom", () => ({
      useNavigate: () => () => vi.fn(),
    }));
  });

  it("should sign evm message", async () => {
    const providers = (await import("@src/providers")) as Record<string, any>;

    providers.useNetworkContext = vi.fn().mockReturnValue({
      state: {
        api: {},
        type: AccountType.EVM,
      },
    });

    providers.useAccountContext = vi.fn().mockReturnValue({
      state: {
        selectedAccount: selectedEVMAccountMock,
      },
    });

    const { getByText } = renderComponent();

    await waitFor(() => {
      const signButton = getByText(en.sign_message.sign);
      expect(signButton).toBeDefined();
    });

    const signButton = getByText(en.sign_message.sign);

    act(() => {
      fireEvent.click(signButton);
    });

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });
  });

  it("should sign wasm message", async () => {
    const providers = (await import("@src/providers")) as Record<string, any>;

    providers.useNetworkContext = vi.fn().mockReturnValue({
      state: {
        api: {},
        type: AccountType.WASM,
      },
    });

    const { getByText } = renderComponent();

    await waitFor(() => {
      const signButton = getByText(en.sign_message.sign);
      expect(signButton).toBeDefined();
    });

    const signButton = getByText(en.sign_message.sign);

    act(() => {
      fireEvent.click(signButton);
    });

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });
  });
});
