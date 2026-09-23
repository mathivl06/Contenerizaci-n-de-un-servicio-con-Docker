const { Router } = require("express");
const readyRouter = Router();
const readyController = require("./ready.controller");

readyRouter.get("/", readyController.getReady);

module.exports = readyRouter;