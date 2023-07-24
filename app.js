const express = require("express");
const session = require("express-session");
const FirebaseStore = require("connect-session-firebase")(session);
const firebase = require("firebase-admin");
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

const ref = firebase.initializeApp({
  credential: firebase.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

app.use(
  session({
    secret: process.env.SECRET_STRING,
    resave: false,
    saveUninitialized: true,
    store: new FirebaseStore({
      database: ref.database()
    }),
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
