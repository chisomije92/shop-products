import sequelize from "../utils/database.js";
import Sequelize from "sequelize";

export interface ProductType {
  id?: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
}

const Product = sequelize.define("product", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export default Product;
