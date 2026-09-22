const { databasePool } = require("../config/database-pool-config");

const SORT_FIELDS = {
    precio: "precio"
}

async function findAllPlatillos({sort, limit}) {
    let values = [];
    let baseQuery = 
        `SELECT
            platillo_id, 
            nombre,
            descripcion,
            precio
        FROM Platillos`;
    if (sort && SORT_FIELDS[sort]){
        baseQuery += `
        ORDER BY ${SORT_FIELDS[sort]}`;
    }
    if (limit){
        baseQuery +=
            `
            LIMIT $1
            `
        values.push(limit)
    }
    const { rows } = await databasePool.query(baseQuery, values);
    return rows;
}

async function findPlatilloById({id}){
    let query = 
        `SELECT
            platillo_id,
            nombre,
            descripcion,
            precio
        FROM Platillos
        WHERE platillo_id = $1
        `
    const {rows} = await databasePool.query(query, [id]);
    return rows
}

module.exports = {
    findAllPlatillos,
    findPlatilloById
};