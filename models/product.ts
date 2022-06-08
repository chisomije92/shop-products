// import fs from "fs";
// import path from "path";
import { Cart } from "./cart.js";
import db from "../utils/database.js";
// const __dirname = path.resolve();
export interface ProductType {
  id?: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
}

// const p = path.join(__dirname, "data", "products.json");

// const getProductsFromFile = (cb: (products: ProductType[]) => void) => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb([]);
//     }
//     if (fileContent) {
//       cb(JSON.parse(fileContent.toString()));
//     }
//   });
// };

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
    // getProductsFromFile((products) => {
    //   if (this.id) {
    //     const existingProductIndex = products.findIndex(
    //       (prod) => prod.id === this.id
    //     );
    //     const updatedProducts = [...products];
    //     updatedProducts[existingProductIndex] = this;
    //     fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
    //       console.log(err);
    //     });
    //   } else {
    //     this.id = Math.random().toString();
    //     products.push(this);
    //     fs.writeFile(p, JSON.stringify(products), (err) => {
    //       console.log(err);
    //     });
    //     console.log("No product id provided");
    //   }
    // });
  }

  static deleteById(id: string) {
    // getProductsFromFile((products) => {
    //   const product = products.find((p) => p.id === id);
    //   const updatedProducts = products.filter((p) => p.id !== id);
    //   fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
    //     if (!err) {
    //       Cart.deleteProduct(id, product!.price);
    //     }
    //   });
    // });
  }

  static fetchAll() {
    // getProductsFromFile(cb);
    return db.execute("SELECT * FROM products");
  }

  static findById(id: string) {
    // getProductsFromFile((products) => {
    //   const product = products.find((p) => p.id === id);
    //   if (product) {
    //     cb(product);
    //   }
    // });
  }
}
