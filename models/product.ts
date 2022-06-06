import fs from "fs";
import path from "path";

const __dirname = path.resolve();
export interface ProductType {
  title: string;
}

const p = path.join(__dirname, "data", "products.json");

const getProductsFromFile = (cb: (products: ProductType[]) => void) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    }
    if (fileContent) {
      cb(JSON.parse(fileContent.toString()));
    }
  });
};

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
    price: number
  ) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    this.id = Math.random().toString();
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb: (products: ProductType[]) => void) {
    getProductsFromFile(cb);
  }
}
