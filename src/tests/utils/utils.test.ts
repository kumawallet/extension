import { formatDate } from "@src/utils/utils";

describe("utils", () => {
  it("should return formatted date", () => {
    const result = formatDate(1677852351555);

    expect(result).that.is.a('string');
    expect(result).to.have.string("Mar 3");    
  });
});
