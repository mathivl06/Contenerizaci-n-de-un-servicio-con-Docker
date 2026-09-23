
const express = require("express");
const platillosRouter = require("./platillos/platillos.routes");
const healthRouter = require("./health/health.routes");
const errorHandler = require("./handlers/error-handlers");
const routeHandler = require("./handlers/route-handler");

const app = express();

app.use(express.json());

app.use("/paTOSrest", healthRouter);
app.use("/paTOSrest/platillos", platillosRouter);





app.use(routeHandler);
app.use(errorHandler);

module.exports = app;