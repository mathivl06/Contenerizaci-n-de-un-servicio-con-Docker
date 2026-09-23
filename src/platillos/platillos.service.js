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

async function deletePlatilloById(parameters) {
    const rowCount = await platillosRepository.deletePlatilloById(parameters);
    
    if (rowCount === 0){
        throw new Error("No se encontró el platillo")
    }
}

module.exports = {
    findAllPlatillos,
    findPlatilloById,
    createPlatillo,
    deletePlatilloById
};