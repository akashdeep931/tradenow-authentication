const db = require("../db/connection");
const format = require("pg-format");
const { generatePassword } = require("../utils/passwordUtils");

exports.insertUser = ({ password, username, name, surname }) => {
  const saltHash = {};

  if (password) {
    const hashedPassword = generatePassword(password);

    saltHash.hash = hashedPassword.hash;
    saltHash.salt = hashedPassword.salt;
  }

  const { hash, salt } = saltHash;
  const values = [username, name, surname, salt, hash];

  const insertValues = format(
    `
        INSERT INTO users
        (username, name, surname, salt, hash)
        VALUES
        %L
        `,
    [values]
  );

  return db.query(insertValues).then(({ rows }) => rows);
};
