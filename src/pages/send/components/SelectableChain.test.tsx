import { selectedEVMChainMock } from "@src/tests/mocks/chain-mocks";
import { SelectableChain } from "./SelectableChain";
import { render } from "@testing-library/react";
import { Chain } from "@src/storage/entities/Chains";
import { POLKADOT } from "@src/constants/chains";

const OPTION_CHAINS_MOCKS: Chain[] = [POLKADOT];

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
        selectedChain={selectedEVMChainMock}
        optionChains={OPTION_CHAINS_MOCKS}
      />
    );

    expect(getByText(selectedEVMChainMock.name)).toBeDefined();
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
