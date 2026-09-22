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
        .withMessage("El límite debe estar entre 1 y 50"),
    query().custom((_, { req }) => {
        const validQuerys = ["sort", "limit"];
        const received = Object.keys(req.query);

        if (received.length === 0){
            throw new Error("Debe enviar al menos un parámetro de consulta")
        }

        const invalidQuerys = received.filter(key => !validQuerys.includes(key));

        if (invalidQuerys.length > 0) {
            throw new Error(`Querys no permitidos: ${invalidQuerys.join(", ")}`);
        }
        return true;
    })
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