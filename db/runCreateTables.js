const createTables = require("./createTables");
const db = require("./connection");

const runCreateTables = () => {
  createTables().then(() => db.end());
};

runCreateTables();
