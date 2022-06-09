import sequelize from "../utils/database.js";
import Sequelize, { Instance } from "sequelize";

export interface OrderModelType {
  id: number;
}

type CartInstance = Instance<OrderModelType> & OrderModelType;
export const Order = sequelize.define<CartInstance, OrderModelType>("order", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
});

export default Order;
