const authRouter = require("express").Router();
const passport = require("passport");
const { createUsers } = require("../controllers/post.controllers");
const {
  getAuthConfirmation,
  getLogOutConfirmation,
  getAuthFailure,
} = require("../controllers/get.controllers");
const {
  isAuth,
  isLogged,
  checkAuthForFailedEndpoint,
} = require("../controllers/auth.controllers");

authRouter.post("/register", createUsers);
authRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/authenticated",
    failureRedirect: "/failed-authentication",
    failureMessage: true,
  })
);
authRouter.get("/authenticated", isAuth, getAuthConfirmation);
authRouter.get(
  "/failed-authentication",
  checkAuthForFailedEndpoint,
  getAuthFailure
);
authRouter.get("/logout", isLogged, getLogOutConfirmation);

module.exports = authRouter;
