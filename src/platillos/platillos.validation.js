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

const postPlatillo = [
    body("nombre")
        .exists()
        .withMessage("El nombre es obligatorio")
        .bail()
        .isString()
        .withMessage("El nombre debe ser un texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("El nombre no puede estar vacío")
        .bail()
        .isLength({ max: 50 })
        .withMessage("El nombre no puede superar los 50 caracteres"),
    body("descripcion")
        .exists()
        .withMessage("La descripción es obligatoria")
        .bail()
        .isString()
        .withMessage("La descripción debe ser un texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("La descripción no puede estar vacía")
        .bail()
        .isLength({ max: 400 })
        .withMessage("La descripción no puede superar los 400 caracteres"),
    body("precio")
            .exists()
            .withMessage("El precio es obligatorio")
            .bail()
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("El precio debe tener como máximo dos decimales")
            .bail()
            .custom(value => {
                const precio = Number(value);
                
                if (precio < 0){
                    throw new Error("El precio no puede ser negativo");
                } 

                if (precio >= 10000000000) {
                    throw new Error("El precio supera el límite permitido");
                }
                return true
            })
            .toFloat(),
    body().custom((_, { req }) => {
        const validFields = ["nombre", "descripcion", "precio"];
        const received = Object.keys(req.body);

        if (received.length === 0){
            throw new Error("Debe enviar campos válidos")
        }

        const invalidFields = received.filter(key => !validFields.includes(key));

        if (invalidFields.length > 0) {
            throw new Error(`Campos no permitidos: ${invalidFields.join(", ")}`);
        }
        return true;
    })
]

module.exports = {
    getAllPlatillosValidation,
    getPlatillosByIdValidation,
    postPlatillo
};