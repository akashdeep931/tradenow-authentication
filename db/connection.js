const { Pool } = require("pg");

const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

const config =
  ENV === "production"
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 3,
      }
    : {};

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw Error("PGDATABASE not set");
}

module.exports = new Pool(config);
