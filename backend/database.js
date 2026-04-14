const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL;
const shouldUseSsl = connectionString || process.env.DB_SSL !== "false";
const pool = new Pool(connectionString
    ? {
        connectionString,
        max: Number(process.env.DB_CONNECTION_LIMIT || 10),
        ssl: shouldUseSsl
            ? {
                rejectUnauthorized: false,
            }
            : false,
    }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_DATABASE,
        max: Number(process.env.DB_CONNECTION_LIMIT || 10),
        ssl: shouldUseSsl
            ? {
                rejectUnauthorized: false,
            }
            : false,
    });
if (process.env.LOG_SQL === "true") {
    const oldQuery = pool.query.bind(pool);
    pool.query = function (...args) {
        const [sql, params] = args;
        console.log("\nEXECUTING QUERY |", sql, params);
        return oldQuery(...args);
    };
}
const query = pool.query.bind(pool);
const connect = pool.connect.bind(pool);
const end = pool.end.bind(pool);
module.exports = pool;
module.exports.query = query;
module.exports.connect = connect;
module.exports.end = end;

