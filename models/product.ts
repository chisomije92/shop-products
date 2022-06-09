import sequelize from "../utils/database.js";
import Sequelize, { Instance, Model } from "sequelize";

export interface ProductType {
  id?: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
}

type ProductInstance = Instance<ProductType> & ProductType;
// type ProductModel = Model<ProductInstance, ProductType>;

const Product = sequelize.define<ProductInstance, ProductType>("product", {
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
