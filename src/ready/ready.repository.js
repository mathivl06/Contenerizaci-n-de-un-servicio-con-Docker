const { databasePool } = require("../config/database-pool-config");

async function checkDatabaseConnection() {
    await databasePool.query("SELECT 1");
}

module.exports = {
    checkDatabaseConnection
};
