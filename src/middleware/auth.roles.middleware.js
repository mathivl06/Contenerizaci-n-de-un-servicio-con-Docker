function requireRole(role) {
    return (req, res, next) => {
        const roles =
        req.user?.realm_access?.roles || [];
        if (!roles.includes(role)) {
            return res.status(403).json({
            error: 'Acceso denegado'
            });
        }
        next();
    };
}

module.exports = {
    requireRole
};