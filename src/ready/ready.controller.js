const readyService = require("./ready.service");

async function getReady(req, res){
    try {
        await readyService.checkReadiness();
        res.status(200).json({status: "Ready"});
    } catch{
        res.status(503).json({status: "Not Ready"});
    }
}

module.exports = {
    getReady
}