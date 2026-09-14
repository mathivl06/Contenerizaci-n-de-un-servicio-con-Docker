const platillosRepository = require("./platillos.repository");

async function findAllPlatillos(filters) {
    const existingPlatillos = await platillosRepository.findAllPlatillos(filters);

    if (!existingPlatillos.length){
        throw new Error("No hay platillos disponibles");
    }
    return existingPlatillos;
}

module.exports = {
    findAllPlatillos
};