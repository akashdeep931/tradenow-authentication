const { Pool } = require("pg");

require("dotenv").config();

if (!process.env.PGDATABASE) {
  throw Error("PGDATABASE not set");
}

module.exports = new Pool();
