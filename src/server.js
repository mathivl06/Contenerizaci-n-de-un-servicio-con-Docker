const app = require("./app") ;
const { appEnvConfig } = require("./config/app-env-config");

app.listen(appEnvConfig.app.port,"0.0.0.0", () => {
    console.log(`Server running, listening on port ${appEnvConfig.app.port}`);
});
