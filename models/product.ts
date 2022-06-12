import mongoConnect, { getDb } from "../utils/database.js";

export interface ProductType {
  id?: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
}

class Product {
  id?: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;

  constructor(
    title: string,
    price: number,
    description: string,
    imageUrl: string
  ) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  save() {
    const db = getDb();
    return db
      .collection("products")
      .insertOne(this)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

export default Product;
