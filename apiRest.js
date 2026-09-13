

const express = requiere("express")
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "booksdb", // TODO: Cambiar por los datos de nuestra DB
    user: "postgres",
    password: "1234"
});

app.get("/health", (req, res) => {

    res.status(200).json({
        status: "OK"
    });

});

// TODO: Modificar con los datos q  ue vayamos a usar

app.get("/books", async (req, res) => {

    const result = await pool.query(
        "SELECT * FROM books"
    );

    res.status(200).json(result.rows);

});

app.post("/books", async (req, res) => {

    const { title, author } = req.body;

    const result = await pool.query(
        "INSERT INTO books (title, author) VALUES ($1, $2) RETURNING *",
        [title, author]
    );

    res.status(201).json(result.rows[0]);
});

app.listen(3000, () => {
    console.log("Server running");
});