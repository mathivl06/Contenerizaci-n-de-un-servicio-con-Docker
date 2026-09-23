
// Error global
function errorHandler (error, req, res, next) {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error){
        return res.status(400).json({error: "JSON inválido"});
    }
    res.status(error.status || 500).json({
        error: error.message || "Internal Server Error"
    });
}

module.exports = errorHandler;