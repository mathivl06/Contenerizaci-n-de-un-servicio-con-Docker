const { Pool } = require("pg");
const { appEnvConfig } = require("./app-env-config");

const databasePool = new Pool({
    host: appEnvConfig.database.host,
    port: appEnvConfig.database.port,
    database: appEnvConfig.database.databaseName,
    user: appEnvConfig.database.user,
    password: appEnvConfig.database.password
});

module.exports = databasePool;