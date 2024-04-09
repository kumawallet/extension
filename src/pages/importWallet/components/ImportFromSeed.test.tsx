import { I18nextProvider } from "react-i18next";
import { render } from "@testing-library/react";
import i18n from "@src/utils/i18n";
import { ImportFromSeed } from "./ImportFromSeed";

const renderComponent = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ImportFromSeed />
    </I18nextProvider>
  );
};

describe("ImportFromSeed", () => {

  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        formState: { errors: {} },
        register: () => ({ ref: () => { } }),
        setValue: vi.fn(),
        watch: vi.fn(),
        getValues: vi.fn(),
      }),
    }));

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


  describe("render", () => {
    it("should render the component", () => {
      const { container } = renderComponent();
      expect(container).toBeDefined();
    });
  });
});
