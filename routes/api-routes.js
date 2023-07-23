const { getAllAPIs } = require("../controllers/get.controllers");

const apiRouter = require("express").Router();

apiRouter.get("/api", getAllAPIs);

module.exports = apiRouter;
