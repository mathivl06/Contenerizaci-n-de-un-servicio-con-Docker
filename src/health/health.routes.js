const { Router } = require("express");
const healthRouter = Router();

healthRouter.get("/health", (req, res) => {

    res.status(200).json({
        status: "OK"
    });

});

module.exports = healthRouter;