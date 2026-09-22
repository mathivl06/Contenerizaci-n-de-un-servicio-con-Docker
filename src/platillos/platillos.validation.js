const { body, param, query } = require("express-validator");

// GET /platillos?sort=precio&order=desc&limit=2
const getAllPlatillosValidation = [
    query("sort")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(["precio"])
        .withMessage("Criterio de ordenamiento inválido"),
    query("limit")
        .optional()
        .trim()
        .isInt({ min: 1, max: 50 })
        .toInt()
        .withMessage("El límite debe estar entre 1 y 50")
];

const getPlatillosByIdValidation = [
    param("id")
        .trim()
        .isInt({ min: 1 })
        .toInt()
];

module.exports = {
    getAllPlatillosValidation,
    getPlatillosByIdValidation
};