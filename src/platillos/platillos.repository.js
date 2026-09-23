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
            `;
        values.push(limit);
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
        `;
    const {rows} = await databasePool.query(query, [id]);
    return rows[0];
}

async function createPlatillo({ nombre, descripcion, precio }){
    let query =
        `INSERT INTO Platillos (nombre, descripcion, precio)
        VALUES ($1, $2, $3)
        RETURNING *;
        `;
    let values = [nombre, descripcion, precio]
    const { rows } = await databasePool.query(query, values)
    return rows[0];
}

async function deletePlatilloById({ id }) {
    const { rowCount } = await databasePool.query(
        `DELETE FROM Platillos
        WHERE platillo_id = $1;`,[id]
    );
    return rowCount;
}

async function updatePlatilloById({ id, nombre, descripcion, precio }) {
    const fields = [];
    const values = [];

    if (nombre !== undefined) {
        values.push(nombre);
        fields.push(`nombre = $${values.length}`);
    }

    if (descripcion !== undefined) {
        values.push(descripcion);
        fields.push(`descripcion = $${values.length}`);
    }

    if (precio !== undefined) {
        values.push(precio);
        fields.push(`precio = $${values.length}`);
    }

    values.push(id);

    const query = `
        UPDATE Platillos
        SET ${fields.join(", ")}
        WHERE platillo_id = $${values.length}
        RETURNING *;
    `;

    const { rows } = await databasePool.query(
        query,
        values
    );

    return rows[0];
}

module.exports = {
    findAllPlatillos,
    findPlatilloById,
    createPlatillo,
    deletePlatilloById,
    updatePlatilloById
};