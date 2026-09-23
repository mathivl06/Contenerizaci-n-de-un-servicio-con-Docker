
const { NotFoundError } = require("../errors/NotFoundError");
const platillosRepository = require("./platillos.repository");

async function findAllPlatillos(filters) {
    const existingPlatillos = await platillosRepository.findAllPlatillos(filters);

    if (!existingPlatillos.length){
        throw new NotFoundError("No hay platillos disponibles");
    }
    return existingPlatillos;
}

async function findPlatilloById(parameters) {
    const existingPlatillo = await platillosRepository.findPlatilloById(parameters);

    if (!existingPlatillo){
        throw new NotFoundError("Platillo no encontrado")
    }
    return existingPlatillo;
}

async function createPlatillo(parameters) {
    return await platillosRepository.createPlatillo(parameters);
}

async function deletePlatilloById(parameters) {
    const rowCount = await platillosRepository.deletePlatilloById(parameters);
    
    if (rowCount === 0){
        throw new NotFoundError("Platillo no encontrado")
    }
}

async function updatePlatilloById(parameters) {
    const updatedPlatillo = await platillosRepository.updatePlatilloById(parameters);

    if (!updatedPlatillo) {
        throw new NotFoundError("Platillo no encontrado");
    }
    return updatedPlatillo;
}

module.exports = {
    findAllPlatillos,
    findPlatilloById,
    createPlatillo,
    deletePlatilloById,
    updatePlatilloById
};