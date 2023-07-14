const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const db = require("./db/connection");

const app = express();

app.use(express.json());

require("dotenv").config();

app.use(
  session({
    secret: process.env.SECRET_STRING,
    resave: false,
    saveUninitialized: true,
    store: new pgSession({
      pool: db,
      tableName: "session",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 78,
    },
  })
);

app.get("/", (req, res, next) => {
  res.send("<h1>Hello World</h1>");
});

module.exports = app;