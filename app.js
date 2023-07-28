const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const db = require("./db/connection");
const passport = require("passport");
const authRouter = require("./routes/authentication-routes");
const apiRouter = require("./routes/api-routes");
const { handlePsqlErrors } = require("./errors/errorHandlers");
const { incorrectPath } = require("./controllers/incorrectPath.controllers");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "https://tdnow.netlify.app",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  })
);

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
      domain: "tdnow.netlify.app",
    },
  })
);

require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use(apiRouter);
app.use(authRouter);
app.all("/*", incorrectPath);
app.use(handlePsqlErrors);

module.exports = app;
