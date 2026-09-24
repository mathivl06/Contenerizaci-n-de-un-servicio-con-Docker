const { Router } = require("express");
const platillosRouter = Router();
const platillosController = require("./platillos.controller");
const platillosValidation = require("./platillos.validation");
const rolesAuthenticator = require("../middleware/auth.roles.middleware");
const authenticator = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

platillosRouter.get("/", platillosValidation.getAllPlatillosValidation, validate, platillosController.getAllPlatillos);
platillosRouter.get("/:id", platillosValidation.getPlatillosByIdValidation, validate, platillosController.getPlatilloById);
platillosRouter.post("/", authenticator.authenticate, rolesAuthenticator.requireRole("patos_admin"), platillosValidation.postPlatillo, validate, platillosController.postPlatillo);
platillosRouter.delete("/:id",authenticator.authenticate, rolesAuthenticator.requireRole("patos_admin"), platillosValidation.deletePlatilloByIdValidation, validate, platillosController.deletePlatillo);
platillosRouter.patch("/:id", authenticator.authenticate, rolesAuthenticator.requireRole("patos_admin"), platillosValidation.patchPlatilloValidation, validate, platillosController.patchPlatillo);

module.exports = platillosRouter;