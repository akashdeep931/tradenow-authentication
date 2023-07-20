const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const db = require("./db/connection");
const passport = require("passport");
const crypto = require("crypto");
const authRouter = require("./routes/authentication-routes");
const { handlePsqlErrors } = require("./errors/errorHandlers");

const app = express();

app.use(express.json());

require("dotenv").config({
  path: `${__dirname}/.env.production`,
});

const sessionStorage = new pgSession({
  pool: db,
  tableName: "session",
});

app.use(
  session({
    secret: process.env.SECRET_STRING,
    resave: false,
    saveUninitialized: true,
    store: sessionStorage,
    cookie: {
      maxAge: 1000 * 60 * 60 * 78,
    },
  })
);

app.use(authRouter);
app.use(handlePsqlErrors);

module.exports = app;
