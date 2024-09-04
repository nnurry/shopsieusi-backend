const dbFactory = require("./db");

const instance = new dbFactory();
module.exports = instance;