const { createRemoteJWKSet, jwtVerify } = require("jose");

const keycloakInternalUrl = process.env.KEYCLOAK_INTERNAL_URL || "http://keycloak:8080";
const keycloakIssuer = process.env.KEYCLOAK_ISSUER || "http://localhost:8080";
const realm = "paTOS";

const JWKS = createRemoteJWKSet(new URL(`${keycloakInternalUrl}/realms/${realm}/protocol/openid-connect/certs`));

async function verifyAccessToken(token) {
    const { payload } = await jwtVerify(token, JWKS, {
    issuer: `${keycloakIssuer}/realms/${realm}`,
    });

    return payload;
}

module.exports = {
    verifyAccessToken
}