import Register from "./Register";

describe("Register", () => {
  it("should create register", () => {
    const register = new Register("test", 0);
    expect(register).toEqual({
      address: "test",
      timestamp: 0,
    });
  });
});
