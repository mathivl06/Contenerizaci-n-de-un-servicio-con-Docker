const { validationResult } = require("express-validator");
const { postPlatillo } = require("../../src/platillos/platillos.validation");

test("rechaza un platillo vacío", async () => {

    const req = {
        body: {
            nombre: "",
            descripcion: "",
            precio: ""
        }
    };

    const res = {};
    const next = jest.fn();

    for (const validator of postPlatillo) {
        await validator.run(req);
    }

    const errors = validationResult(req);

    expect(errors.isEmpty()).toBe(false);
});

test("rechaza ID incorrecto (un no digito)", async () => {

    const req = {
        param: {
            id: "a"
        }
    };

    for (const validator of postPlatillo) {
        await validator.run(req);
    }

    const errors = validationResult(req);

    expect(errors.isEmpty()).toBe(false);
});

test("rechaza ID incorrecto (un digito negativo)", async () => {

    const req = {
        param: {
            id: "-25"
        }
    };

    for (const validator of postPlatillo) {
        await validator.run(req);
    }

    const errors = validationResult(req);

    expect(errors.isEmpty()).toBe(false);
});

test("rechaza ID incorrecto (un digito = 0)", async () => {

    const req = {
        param: {
            id: "0"
        }
    };

    for (const validator of postPlatillo) {
        await validator.run(req);
    }

    const errors = validationResult(req);

    expect(errors.isEmpty()).toBe(false);
});