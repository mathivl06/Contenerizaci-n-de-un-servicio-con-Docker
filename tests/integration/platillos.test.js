const request = require("supertest");

let adminToken;
let clientToken;

const API_URL = process.env.APP_URL;
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;

beforeAll(async () => {
    const response = await request(KEYCLOAK_URL)
    .post("/realms/paTOS/protocol/openid-connect/token")
    .type("form")
    .send({
        grant_type: "password",
        client_id: "patos-rest-api",
        username: "paTOSadmin",
        password: "paTOS"
    });
    expect(response.status).toBe(200);
    adminToken = response.body.access_token;
    expect(adminToken).toBeDefined();
    const clientResponse = await request(KEYCLOAK_URL)
        .post("/realms/paTOS/protocol/openid-connect/token")
        .type("form")
        .send({
            grant_type: "password",
            client_id: "patos-rest-api",
            username: "paTOclient",
            password: "paTOS"
        });
    expect(clientResponse.status).toBe(200);
    clientToken = clientResponse.body.access_token;
});

test("GET /health responde correctamente", async () => {

    const response = await request(API_URL)
        .get("/paTOSrest/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
        status: "OK"
    });

});

test("GET /platillos/id responde correctamente", async () => {

    const response = await request(API_URL)
        .get("/paTOSrest/platillos/2");

    expect(response.status).toBe(200);

    expect(response.body.platillo_id).toBe(2);

});

test("GET /platillos responde correctamente", async () => {

    const response = await request(API_URL)
        .get("/paTOSrest/platillos");

    expect(response.status).toBe(200);
    expect(response.body[0].platillo_id).toBe(1);
});

test("POST sin token responde 401", async () => {
    const response = await request(API_URL)
        .post("/paTOSrest/platillos")
        .send({
            nombre: "Pato Platillo Prueba",
            descripcion: "Pato Platillo Prueba",
            precio: 1000
        });
    expect(response.status).toBe(401);
});

test("POST con token sin rol responde 403", async () => {
    const response = await request(API_URL)
        .post("/paTOSrest/platillos")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({
            nombre: "Pato Platillo Prueba",
            descripcion: "Pato Platillo Prueba",
            precio: 1000
        });
    expect(response.status).toBe(403);
});


test("POST de un platillo responde correctamente", async () => {

    const response = await request(API_URL)
        .post("/paTOSrest/platillos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            nombre: "Pato Casado",
            descripcion: "Arroz, Frijoles, Maduro, Ensalada y una proteina (Bistec, Chuleta, Pollo a la plancha)",
            precio: 4500
        });

    expect(response.status).toBe(201);

    expect(response.body.nombre).toBe("Pato Casado");

});

test("DELETE de un platillo sin token responde 401", async () => {

    const response = await request(API_URL)
        .delete("/paTOSrest/platillos/3");

    expect(response.status).toBe(401);

});

test("DELETE de un platillo con token sin rol responde 403", async () => {

    const response = await request(API_URL)
    .delete("/paTOSrest/platillos/3")
    .set("Authorization", `Bearer ${clientToken}`);

    expect(response.status).toBe(403);

});

test("DELETE de un platillo responde correctamente", async () => {

    const response = await request(API_URL)
    .delete("/paTOSrest/platillos/3")
    .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(204);

});

test("PATCH de un platillo sin token responde 401", async () => {
    const response = await request(API_URL)
        .patch("/paTOSrest/platillos/2")
        .send({
            nombre: "Pato Pasta Blanca Actualizado"
        });

    expect(response.status).toBe(401);
});

test("PATCH de un platillo con token sin rol responde 403", async () => {
    const response = await request(API_URL)
        .patch("/paTOSrest/platillos/2")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({
            nombre: "Pato Pasta Blanca Actualizado"
        });

    expect(response.status).toBe(403);
});

test("PATCH de un platillo responde correctamente", async () => {
    const response = await request(API_URL)
        .patch("/paTOSrest/platillos/2")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            nombre: "Pato Pasta Blanca Actualizado"
        });

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe("Pato Pasta Blanca Actualizado");
});