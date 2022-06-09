import Sequelize from "sequelize";

const sequelize = new Sequelize("node-complete", "root", "jerry", {
  dialect: "mysql",
  host: "localhost",
});

export default sequelize;
