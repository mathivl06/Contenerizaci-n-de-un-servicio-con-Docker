const readyRepository = require("./ready.repository");

async function checkReadiness() {
    await readyRepository.checkDatabaseConnection();
}

module.exports = {
    checkReadiness
};