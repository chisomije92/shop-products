import path from "path";
import fs from "fs";

const __dirname = path.resolve();

const p = path.join(__dirname, "data", "cart.json");

interface CartProdType {
  id: string;
  qty: number;
}

export interface CartType {
  products: CartProdType[];
  totalPrice: number;
}

export class Cart {
  static addProduct(id: string, productPrice: number) {
    fs.readFile(p, (err, fileContent) => {
      let cart: CartType = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent.toString());
      }
      const existingProductIndex = cart.products.findIndex((p) => p.id === id);
      const existingProduct = cart.products[existingProductIndex];

      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id: string, productPrice: number) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }
      const cart = JSON.parse(fileContent.toString());
      const updatedCart = { ...cart };
      const product = updatedCart.products.find(
        (p: CartProdType) => p.id === id
      );
      if (!product) {
        return;
      }
      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(
        (p: CartProdType) => p.id !== id
      );
      updatedCart.totalPrice =
        updatedCart.totalPrice - productPrice * productQty;
      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static getCart(cb: (cart: CartType | null) => void) {
    fs.readFile(p, (err, fileContent) => {
      let cart: CartType = { products: [], totalPrice: 0 };
      if (err) {
        cb(null);
      } else {
        cart = JSON.parse(fileContent.toString());
        cb(cart);
      }
    });
  }
}
