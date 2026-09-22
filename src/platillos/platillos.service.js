const { DatabaseError } = require("pg");
const platillosRepository = require("./platillos.repository");

async function findAllPlatillos(filters) {
    const existingPlatillos = await platillosRepository.findAllPlatillos(filters);

    if (!existingPlatillos.length){
        throw new Error("No hay platillos disponibles");
    }
    return existingPlatillos;
}

async function findPlatilloById(parameters) {
    const existingPlatillo = await platillosRepository.findPlatilloById(parameters);

    if (!existingPlatillo.length){
        throw new Error("No hay platillos disponibles");
    }
    return existingPlatillo;
}

async function createPlatillo(parameters) {
    try{
        return await platillosRepository.createPlatillo(parameters);
    } catch(error){
        throw new DatabaseError("No fue posible crear el platillo", error);
    }
}

module.exports = {
    findAllPlatillos,
    findPlatilloById,
    createPlatillo
};