-- Script de inicialización de la base de datos para el servicio RestaurantePatos

CREATE TABLE IF NOT EXISTS PatoPlatillos (
    platillo_id INT GENERATED ALWAYS AS IDENTITY,
    nombre VARCHAR(20),
    descripcion VARCHAR(20),
    disponible BOOLEAN NOT NULL DEFAULT TRUE

)
