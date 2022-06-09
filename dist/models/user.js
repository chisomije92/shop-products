import Sequelize from "sequelize";
import sequelize from "../utils/database.js";
const User = sequelize.define("user", {
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
//# sourceMappingURL=user.js.map