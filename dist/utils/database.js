// import mysql2 from 'mysql2'
const mysql2 = require("mysql2");
const pool = mysql2.createPool({
    hostname: "localhost",
    user: "root",
    database: "node-complete",
    password: "jerry",
});
// module.exports = pool.promise();
export default pool.promise();
//# sourceMappingURL=database.js.map