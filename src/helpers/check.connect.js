const pbDatabase = require("../db/db.singleton");
const os = require("os");

const sql = pbDatabase.getConnection();

const getNumOfConns = async () => {
    try {
        // https://www.postgresql.org/docs/current/runtime-config-replication.html#GUC-MAX-WAL-SENDERS
        // https://stackoverflow.com/a/56805954
        // this includes all these, just overestimate for safety (walwriter actually counts up to max connections):
        // - autovacuum launcher
        // - logical replication launcher
        // - client backend
        // - background writer
        // - checkpointer
        // - walwriter
        const result = await sql`SELECT count(*) FROM pg_stat_activity;`;
        return result[0].count;
    }
    catch (err) {
        if (err.code == "ECONNREFUSED") {
            return -1;
        }
        console.log("error encountered:", err);
        return -2;
    }
}

const checkResourceOverload = () => {
    // check interval
    const checkInterval = Number(process.env.CHECK_CONN_OVERLOAD_INTERVAL) || 5000;
    // cpu-related check parameters
    const maxConnPerCore = Number(process.env.MAX_CONN_PER_CORE) || 3;
    const connThreshold = os.cpus() * maxConnPerCore;
    const allowedConnThreshold = Math.round(connThreshold * 0.9);
    // memory-related check parameters (no memory restriction currently)
    setInterval(async () => {
        const numOfConns = await getNumOfConns();
        const memoryUsage = process.memoryUsage().rss >> 20; // bytes >> 2^10 = KBS >> 2^10 = MBs
        console.log(`Memory usage = ${memoryUsage} MB`);
        if (numOfConns >= 0) {
            console.log(`Active connections = ${numOfConns}`);
            if (numOfConns >= connThreshold * 0.9) {
                // reach 90% of allowed connections
                // notify of this occurrence
                // currently console.log is sufficient
                console.error(`reaching connection limit: ${numOfConns} >= 90% * ${connThreshold} = ${allowedConnThreshold}`);
            }
        } else {
            // just short notification - further may be inquired via [GET] /conn
            console.error("currently can't reach database, please check");
        }
    }, checkInterval)

}

module.exports = { getNumOfConns, checkResourceOverload }