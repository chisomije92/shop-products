import { Cart } from "./cart.js";
import { RowDataPacket } from "mysql2";
import db from "../utils/database.js";

export interface ProductType {
  id?: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
}

export class Product {
  id?: string;
  title: string;
  imageUrl: string;
  description: string;
  price: number;
  constructor(
    title: string,
    imageUrl: string,
    description: string,
    price: number,
    id?: string
  ) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return db.execute(
      "INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)",
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  static deleteById(id: string) {}

  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(id: string) {
    return db.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE products.id = ?",
      [id]
    );
  }
}
