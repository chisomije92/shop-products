import sequelize from "../utils/database.js";
import Sequelize, { Instance } from "sequelize";

export interface CartModelType {
  id: number;
}

export type CartInstance = Instance<CartModelType> & CartModelType;
export const Cart = sequelize.define<CartInstance, CartModelType>("cart", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
});

export default Cart;
