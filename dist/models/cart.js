import sequelize from "../utils/database.js";
import Sequelize from "sequelize";
export const Cart = sequelize.define("cart", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    //   quantity: Sequelize.INTEGER,
});
export default Cart;
//# sourceMappingURL=cart.js.map