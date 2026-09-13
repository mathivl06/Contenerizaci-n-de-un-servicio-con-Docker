-- Script de inicialización de la base de datos para el servicio RestaurantePatos

CREATE TABLE IF NOT EXISTS Platillos (
    platillo_id INT GENERATED ALWAYS AS IDENTITY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(400) NOT NULL,
    precio NUMERIC(12,2) NOT NULL

)
