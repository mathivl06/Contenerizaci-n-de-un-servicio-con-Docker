const { verifyAccessToken } =  require("../config/keycloak-config.js");

async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
            error: "Falta el token"
            });
        }
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
            error: "Formato de token inválido"
            });
        }
        const token = authHeader.split(' ')[1];
        req.user = await verifyAccessToken(token);
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Token inválido"
        });
    }
}

module.exports = {
    authenticate
}