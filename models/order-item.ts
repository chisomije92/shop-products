import sequelize from "../utils/database.js";
import Sequelize, { Instance } from "sequelize";

export interface OrderItemModelType {
  id: number;
  quantity: number;
}

type CartItemInstance = Instance<OrderItemModelType> & OrderItemModelType;
export const CartItem = sequelize.define<CartItemInstance, OrderItemModelType>(
  "orderItem",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    quantity: Sequelize.INTEGER,
  }
);

export default CartItem;
