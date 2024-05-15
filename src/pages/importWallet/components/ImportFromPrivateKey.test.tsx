import { I18nextProvider } from "react-i18next";
import { ImportFromPrivateKey } from "./ImportFromPrivateKey";
import { render } from "@testing-library/react";
import i18n from "@src/utils/i18n";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ImportFromPrivateKey />
    </I18nextProvider>
  );
};

describe("ImportFromPrivateKey", () => {

  beforeAll(() => {
    vi.mock("@src/utils/env", () => ({
      version: "1.0.0",
      getWebAPI: () => ({
        tabs: {
          getCurrent: () => Promise.resolve(undefined),
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
      }),
    }))
  })

  vi.mock("react-hook-form", () => ({
    useFormContext: () => ({
      formState: { errors: {} },
      register: () => ({ ref: () => { } }),
      setValue: vi.fn(),
    }),
  }));

  describe("render", () => {
    it("should render the component", () => {
      const { getByTestId } = renderComponent();
      expect(getByTestId("privateKey")).toBeDefined();
    });
  });
});
