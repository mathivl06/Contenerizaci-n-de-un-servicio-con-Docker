const { createRemoteJWKSet, jwtVerify } = require("jose");


const JWKS = createRemoteJWKSet(new URL("http://keycloak:8080/realms/paTOS/protocol/openid-connect/certs"));

async function verifyAccessToken(token) {
    const { payload } = await jwtVerify(token, JWKS, {
    issuer: "http://keycloak:8080/realms/paTOS",
    });

    return payload;
}

module.exports = {
    verifyAccessToken
}