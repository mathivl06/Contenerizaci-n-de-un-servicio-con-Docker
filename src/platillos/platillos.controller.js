const platillosService = require("./platillos.service");

async function getAllPlatillos(req, res, next){
    try{
        const { sort, limit } = req.query;
        const existingPlatillos = await platillosService.findAllPlatillos({ sort, limit });
        res.status(200).json(existingPlatillos);
    } catch(error){
        next(error);
    }
}

module.exports = {
    getAllPlatillos
};