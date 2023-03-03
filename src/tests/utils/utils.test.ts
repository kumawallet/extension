import { formatDate } from "@src/utils/utils";

describe("utils", () => {
  it("should return formatted date", () => {
    const result = formatDate(1677852351555);

    expect(result).toEqual("Mar 3 - 10:05");
  });
});
