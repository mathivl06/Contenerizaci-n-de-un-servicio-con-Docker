
const express = require("express");
const platillosRouter = require("./platillos/platillos.routes");
const errorHandler = require("./handlers/error-handlers");
const routeHandler = require("./handlers/route-handler");

const app = express();

app.use(express.json());

app.use("/paTOSrest/platillos", platillosRouter);


app.get("/health", (req, res) => {

    res.status(200).json({
        status: "OK"
    });

});


app.use(routeHandler);
app.use(errorHandler);

module.exports = app;