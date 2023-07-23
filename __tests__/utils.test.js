const {
  generatePassword,
  validatePassword,
} = require("../utils/passwordUtils");
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

describe("validatePassword", () => {
  it("should return a boolean value", () => {
    const testValidatePassword = validatePassword(
      "kakashi931",
      "ahbsdvas8dv7a8sd7vasdvhbas8vasfv",
      "ajsdvaisfv8asfv7as6fvasf97v6a9sf7v6"
    );

    expect(typeof testValidatePassword).toBe("boolean");
  });
  it("should return true if the given password has been generated", () => {
    const input = "kakashi931";

    const mockGeneratePwFunc = jest.fn((pw) => {
      const salt = crypto.randomBytes(32).toString("hex");
      const hash = crypto
        .pbkdf2Sync(pw, salt, 10000, 64, "sha512")
        .toString("hex");

      return { salt, hash };
    });

    const { hash, salt } = mockGeneratePwFunc(input);

    const testValidatePassword = validatePassword(input, hash, salt);

    expect(testValidatePassword).toBe(true);
  });
  it("should return false if the given password has not been generated", () => {
    const generatedInput = "kakashi931";
    const notGeneratedInput = "kakashi93";

    const mockGeneratePwFunc = jest.fn((pw) => {
      const salt = crypto.randomBytes(32).toString("hex");
      const hash = crypto
        .pbkdf2Sync(pw, salt, 10000, 64, "sha512")
        .toString("hex");

      return { salt, hash };
    });

    const { hash, salt } = mockGeneratePwFunc(generatedInput);

    const testValidatePassword = validatePassword(
      notGeneratedInput,
      hash,
      salt
    );

    expect(testValidatePassword).toBe(false);
  });
});
