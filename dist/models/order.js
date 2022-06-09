import sequelize from "../utils/database.js";
import Sequelize from "sequelize";
export const Order = sequelize.define("order", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
});
export default Order;
//# sourceMappingURL=order.js.map