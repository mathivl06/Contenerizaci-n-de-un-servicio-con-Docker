

const express = require("express");
const app = express();
app.use(express.json());



app.get("/health", (req, res) => {

    res.status(200).json({
        status: "OK"
    });

});

// TODO: Modificar con los datos que vayamos a usar

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



module.exports = app;