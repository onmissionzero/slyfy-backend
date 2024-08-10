const Pool = require('pg').Pool;
const connectionString = process.env.DB_CONNSTR;

const pool = new Pool({
    connectionString,
});

module.exports = pool;