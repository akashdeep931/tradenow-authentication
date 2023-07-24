const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const authRouter = require("./routes/authentication-routes");
const apiRouter = require("./routes/api-routes");
const { handlePsqlErrors } = require("./errors/errorHandlers");
const { incorrectPath } = require("./controllers/incorrectPath.controllers");

const app = express();

app.use(express.json());

require("dotenv").config({
  path: `${__dirname}/.env.production`,
});

const sessionStore = MongoStore.create({
  mongoUrl: process.env.CONNECTION_STRING,
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

app.use(
  session({
    secret: process.env.SECRET_STRING,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 78,
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
