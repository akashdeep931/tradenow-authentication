const crypto = require("crypto");

function generatePassword(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return { salt, hash };
}

function validatePassword(password, hash, salt) {
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return hash === hashedPassword;
}

module.exports = { generatePassword, validatePassword };
