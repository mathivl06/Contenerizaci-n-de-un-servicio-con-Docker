const request = require("supertest");
const app = require("../../src/app");

test("GET /health responde correctamente", async () => {

    const response = await request(app)
        .get("/paTOSrest/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
        status: "OK"
    });

});

test("GET /platillos/id responde correctamente", async () => {

    const response = await request(app)
        .get("/paTOSrest/platillos/2");

    expect(response.status).toBe(200);

    expect(response.body.platillo_id).toBe(2);

});

test("GET /platillos responde correctamente", async () => {

    const response = await request(app)
        .get("/paTOSrest/platillos");

    expect(response.status).toBe(200);
    //console.log(response.body)
    expect(response.body[0].platillo_id).toBe(1);
});

test("POST de un platillo responde correctamente", async () => {

    const response = await request(app)
        .post("/paTOSrest/platillos")
        .send({
            nombre: "Pato Casado",
            descripcion: "Arroz, Frijoles, Maduro, Ensalada y una proteina (Bistec, Chuleta, Pollo a la plancha)",
            precio: 4500
        });

    expect(response.status).toBe(201);

    expect(response.body.nombre).toBe("Pato Casado");

});

test("DELETE /platillos/id responde correctamente", async () => {

    const response = await request(app)
        .delete("/paTOSrest/platillos/37");

    expect(response.status).toBe(204);
    //console.log(response.body)
});

test("PATCH de un platillo responde correctamente", async () => {
    const response = await request(app)
        .patch("/paTOSrest/platillos/2")
        .send({
            nombre: "Pato Pasta Blanca Actualizado"
        });

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe("Pato Pasta Blanca Actualizado");
});