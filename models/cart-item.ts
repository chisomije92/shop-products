import sequelize from "../utils/database.js";
import Sequelize, { Instance } from "sequelize";

interface CartItemModelType {
  id: number;
  //   quantity: number;
}

type CartItemInstance = Instance<CartItemModelType> & CartItemModelType;
export const CartItem = sequelize.define<CartItemInstance, CartItemModelType>(
  "cartItem",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    // quantity: Sequelize.INTEGER,
  }
);

export default CartItem;
