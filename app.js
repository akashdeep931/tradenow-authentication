const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
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
app.use(
  cors({
    origin: "https://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
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
    },
  })
);

app.use(cookieParser(process.env.SECRET_STRING));

require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(apiRouter);
app.use(authRouter);
app.all("/*", incorrectPath);
app.use(handlePsqlErrors);

module.exports = app;
