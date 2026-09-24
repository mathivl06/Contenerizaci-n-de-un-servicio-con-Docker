

function requiredEnv(key) {
    const value = process.env[key];
    if (!value){
        throw new Error(`Missing the required environment variable ${key}`)
    }
    return value;
}

const appEnvConfig = {
    app: {
        port: Number(requiredEnv("APP_PORT")),
    },
    database: {
        host: requiredEnv("APP_DB_HOST"),
        port: Number(requiredEnv("APP_DB_PORT")),
        databaseName: requiredEnv("APP_DB"),
        user: requiredEnv("APP_DB_USER"),
        password: requiredEnv("APP_DB_PASSWORD")
    }
};

module.exports = {
    requiredEnv,
    appEnvConfig
};
