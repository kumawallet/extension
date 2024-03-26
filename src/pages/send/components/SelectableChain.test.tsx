import { SelectableChain } from "./SelectableChain";
import { render } from "@testing-library/react";
import { SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { Chain } from "@src/types";

const OPTION_CHAINS_MOCKS: Chain[] = SUBTRATE_CHAINS;

describe("SelectableChain", () => {
  beforeAll(() => {
    vi.mock("react-hook-form", () => ({
      useFormContext: () => ({
        setValue: vi.fn(),
      }),
    }));
  });

  it("should render", () => {
    const { getByText } = render(
      <SelectableChain
        canSelectChain={true}
        selectedChain={SUBTRATE_CHAINS[0]}
        optionChains={OPTION_CHAINS_MOCKS}
      />
    );

    expect(getByText(SUBTRATE_CHAINS[0].name)).toBeDefined();
  });

  it("should render null", () => {
    const { baseElement } = render(
      <SelectableChain
        canSelectChain={true}
        selectedChain={{} as Chain}
        optionChains={OPTION_CHAINS_MOCKS}
      />
    );

    expect(baseElement.children[0].children.length).toBe(0);
  });
});
