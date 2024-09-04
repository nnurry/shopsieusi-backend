const postgres = require("postgres");
const config = require("../configs/configs");
class Database {
    constructor() {
        if (!Database.instance) {
            // local db config -> hardcode for testing
            const dbConfig = config.db.connStr ? config.db.connStr : config.db;
            this.sql = postgres(dbConfig);
            Database.instance = this;
        }
        return Database.instance;
    }

    getConnection() {
        return this.sql;
    }
}

module.exports = Database;