import mysql2 from "mysql2";
const pool = mysql2.createPool({
    host: "localhost",
    user: "root",
    database: "node-complete",
    password: "jerry",
});
export default pool.promise();
//# sourceMappingURL=database.js.map