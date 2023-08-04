import { formatDate, makeQuerys, parseIncomingQuery } from "@src/utils/utils";

describe("utils", () => {
  it("should return formatted date", () => {
    const result = formatDate(1677852351555);

    expect(result).that.is.a("string");
    expect(result).to.have.string("Mar 3");
  });

  it("should parse query", () => {
    const result = parseIncomingQuery("?test=123&test2=321");

    expect(result).that.is.a("object");
    expect(result).to.have.property("test", "123");
    expect(result).to.have.property("test2", "321");
  });

  it("should make querys", () => {
    const result = makeQuerys({ test: "123", test2: "321" });

    expect(result).that.is.a("string");
    expect(result).to.have.string("test=123");
    expect(result).to.have.string("test2=321");
  });
});
