import sequelize from "../utils/database.js";
import Sequelize from "sequelize";
export const CartItem = sequelize.define("cartItem", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    // quantity: Sequelize.INTEGER,
});
export default CartItem;
//# sourceMappingURL=cart-item.js.map