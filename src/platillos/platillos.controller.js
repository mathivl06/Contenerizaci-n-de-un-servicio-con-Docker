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

async function getPlatilloById(req, res, next){
    try{
        const { id } = req.params;
        const existingPlatillo = await platillosService.findPlatilloById({ id });
        res.status(200).json(existingPlatillo);
    } catch(error){
        next(error);
    }
}

async function postPlatillo(req, res, next){
    try{
        const body = req.body;
        const result = await platillosService.createPlatillo(body);
        res.status(201).json(result);
    } catch(error){
        next(error);
    }

}

async function deletePlatillo(req, res, next) {
    try{
        const { id } = req.params;
        await platillosService.deletePlatilloById({ id });
        res.sendStatus(204)
    } catch(error){
        next(error);
    }
}


module.exports = {
    getAllPlatillos,
    getPlatilloById,
    postPlatillo,
    deletePlatillo
};