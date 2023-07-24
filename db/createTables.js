const db = require("./connection");

const createTables = () => {
  return db.query(`DROP TABLE IF EXISTS users;`).then(() => {
    return db.query(`CREATE TABLE users (
        user_id BIGSERIAL PRIMARY KEY NOT NULL,
        username VARCHAR(50) NOT NULL,
        name VARCHAR(10) NOT NULL,
        surname VARCHAR(10) NOT NULL,
        salt VARCHAR(200) NOT NULL,
        hash VARCHAR(200) NOT NULL,
        UNIQUE (username));`);
  });
};

module.exports = createTables;
