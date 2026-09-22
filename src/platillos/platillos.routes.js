const { Router } = require("express");
const platillosRouter = Router();
const platillosController = require("./platillos.controller");
const platillosValidation = require("./platillos.validation");
const { validate } = require("../middleware/validation.middleware");

platillosRouter.get("/", platillosValidation.getAllPlatillosValidation, validate, platillosController.getAllPlatillos);
platillosRouter.get("/:id", platillosValidation.getPlatillosByIdValidation, validate, platillosController.getPlatilloById);

module.exports = platillosRouter;