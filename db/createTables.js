const db = require("./connection");

const createTables = () => {
  return db
    .query(`DROP TABLE IF EXISTS session;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`CREATE TABLE session (
            sid varchar NOT NULL COLLATE "default",
            sess json NOT NULL,
            expire timestamp(6) NOT NULL
          )
          WITH (OIDS=FALSE);
          
          ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
          
          CREATE INDEX IDX_session_expire ON session (expire);`);
    })
    .then(() => {
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
