// import mysql2 from "mysql2";
import Sequelize from "sequelize";
// const pool = mysql2.createPool({
//   host: "localhost",
//   user: "root",
//   database: "node-complete",
//   password: "jerry",
// });
// export default pool.promise();
const sequelize = new Sequelize("node-complete", "root", "jerry", {
    dialect: "mysql",
    host: "localhost",
});
export default sequelize;
//# sourceMappingURL=database.js.map