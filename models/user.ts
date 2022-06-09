import Sequelize, { Instance } from "sequelize";
import sequelize from "../utils/database.js";

export interface UserType {
  id?: string;
  name: string;
  email: string;
}
type UserInstance = Instance<UserType> & UserType;
const User = sequelize.define<UserInstance, UserType>("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
});

export default User;
