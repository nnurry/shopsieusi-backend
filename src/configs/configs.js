const deployEnv = require("../constants/env.constants");

const supportedEnv = Object.values(deployEnv);

const configObj = {
    dev: require("./dev.config"),
    prod: require("./prod.config"),
}

if (supportedEnv.find(val => val == process.env.NODE_ENV) === undefined) {
    // config is of development
    module.exports = configObj.dev;
} else {
    module.exports = configObj[process.env.NODE_ENV];
}
