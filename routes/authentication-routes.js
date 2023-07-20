const authRouter = require("express").Router();
const { createUsers } = require("../controllers/post.controllers");

authRouter.post("/register", createUsers);

module.exports = authRouter;
