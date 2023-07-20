const { generatePassword } = require("../utils/passwordUtils");
const crypto = require("crypto");

describe("generatePassword", () => {
  it("should return an object", () => {
    const testGeneratePassword = generatePassword("kakashi931");

    expect(typeof testGeneratePassword).toBe("object");
  });
  it("should have only salt and hash properties in the returned object", () => {
    const testGeneratePassword = generatePassword("kakashi931");
    const allKeys = Object.keys(testGeneratePassword);

    expect(allKeys).toHaveLength(2);
    expect(testGeneratePassword).toHaveProperty("salt", expect.any(String));
    expect(testGeneratePassword).toHaveProperty("hash", expect.any(String));
  });
  it("should return an object with the password correctly hashed", () => {
    const input = "kakashi931";
    const testGeneratePassword = generatePassword(input);
    const { salt, hash } = testGeneratePassword;
    
    const result = crypto
      .pbkdf2Sync(input, salt, 10000, 64, "sha512")
      .toString("hex");

    expect(hash).toBe(result);
  });
});
