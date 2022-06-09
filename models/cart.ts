import sequelize from "../utils/database.js";
import Sequelize, { Instance } from "sequelize";

export interface CartModelType {
  id: number;
  //   quantity: number;
}

// export interface CartType {
//   products: CartProdType[];
//   totalPrice: number;
// }

type CartInstance = Instance<CartModelType> & CartModelType;
export const Cart = sequelize.define<CartInstance, CartModelType>("cart", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  //   quantity: Sequelize.INTEGER,
});

export default Cart;
