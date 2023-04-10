import { selectedEVMChainMock } from "@src/tests/mocks/chain-mocks";
import { SelectableChain } from "./SelectableChain";
import { render } from "@testing-library/react";
import { Chain } from "@src/storage/entities/Chains";

describe("SelectableChain", () => {
  it("should render", () => {
    const { getByText } = render(
      <SelectableChain selectedChain={selectedEVMChainMock} />
    );

    expect(getByText(selectedEVMChainMock.name)).toBeDefined();
  });

  it("should render null", () => {
    const { baseElement } = render(
      <SelectableChain selectedChain={{} as Chain} />
    );

    expect(baseElement.children[0].children.length).toBe(0);
  });
});
