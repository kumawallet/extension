import Contact from "./Contact";

describe("Contact", () => {
  it("should create contact", () => {
    const contact = new Contact("test", "test");
    expect(contact).toEqual({
      address: "test",
      name: "test",
    });
  });
});
