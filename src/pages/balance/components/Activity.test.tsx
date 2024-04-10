import i18n from "@src/utils/i18n";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Activity } from "./Activity";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { Transaction } from "@src/types";
import { ACTIVITY_DETAIL } from "@src/routes/paths";

const functionMocks = {
  navigate: vi.fn(),
};

const dataMocks = {
  activity: [
    {
      id: "1",
      amount: "1",
      asset: "DOT",
      blockNumber: 1,
      fee: "0.01",
      hash: "0x1234567890",
      originNetwork: "BNB",
      targetNetwork: "BNB",
      recipient: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
      sender: "0x55423C073C5e5Ce2D30Ec466a6cDEF0803EC32Cc",
      status: "success",
      tip: "0.1",
      timestamp: 1,
      type: "transfer",
      isSwap: false,
    },
    {
      id: "2",
      amount: "2",
      asset: "DOT",
      blockNumber: 2,
      fee: "0.0000001",
      hash: "0x1234567891",
      originNetwork: "BNB",
      targetNetwork: "BNB",
      recipient: "0x55423C073C5e5Ce2D30Ec466a6cDEF0803EC32Cc",
      sender: "0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
      status: "success",
      tip: "0.1",
      timestamp: 1,
      type: "transfer",
      isSwap: false,
    },
  ],
};

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Activity />
    </I18nextProvider>
  );
};

describe("Actvity", () => {
  beforeAll(() => {
    vi.mock("react-router-dom", () => ({
      useNavigate: () => functionMocks.navigate,
    }));

    vi.mock("@src/providers", () => ({
      useNetworkContext: vi.fn(() => ({
        state: {
          chains: [
            {
              title: "wasm_based",
              chains: SUBTRATE_CHAINS.filter((chain) => !chain.isTestnet),
            },
            {
              title: "evm_based",
              chains: EVM_CHAINS.filter((chain) => !chain.isTestnet),
            },
          ],
          selectedChain: SUBTRATE_CHAINS[0],
        },
      })),
      useAccountContext: vi.fn(() => ({
        state: {
          selectedAccount: {
            key: "0x1234567890",
            value: {
              address: "0x55423C073C5e5Ce2D30Ec466a6cDEF0803EC32Cc",
            },
          },
        },
      })),
      useTxContext: vi.fn(() => ({
        loadMoreActivity: vi.fn(),
        state: {
          activity: dataMocks.activity,
          hasNextPage: false,
          isLoading: false,
        },
      })),
    }));

    vi.mock("@src/messageAPI/api", () => ({
      messageAPI: {
        getRegistryAddresses: vi.fn(() => ({
          contacts: [
            {
              name: "Contact 1",
              address: "0x1234567890",
            },
          ],
          ownAccounts: [
            {
              name: "Account 1",
              address: "0x1234567890",
            },
          ],
        })),
      },
    }));
  });

  describe("render", () => {
    it("should render", async () => {
      const { container } = renderComponent();

      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });
  });

  describe("select activity", async () => {
    it("shoudl select activity", async () => {
      const { getByTestId } = renderComponent();

      await waitFor(() => {
        expect(getByTestId("activity-container")).toBeDefined();
      });

      const activityContainer = getByTestId("activity-container");

      const firstActivity = activityContainer.children[0];

      fireEvent.click(firstActivity);

      const {
        hash,
        status,
        originNetwork,
        targetNetwork,
        sender,
        recipient,
        fee,
        type,
        amount,
        asset,
        tip,
      } = dataMocks.activity[0];

      expect(functionMocks.navigate).toBeCalledWith(ACTIVITY_DETAIL, {
        state: {
          hash,
          status,
          originNetwork,
          targetNetwork,
          sender,
          recipient,
          fee,
          type,
          amount,
          asset,
          tip,
        },
      });
    });
  });
});
