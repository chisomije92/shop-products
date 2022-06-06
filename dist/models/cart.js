import path from "path";
import fs from "fs";
const __dirname = path.resolve();
const p = path.join(__dirname, "data", "cart.json");
export class Cart {
    // products:ProductType = [];
    // totalPrice: number = 0;
    // constructor(
    //     products: ProductType[],
    //     totalPrice: number
    // ) {
    //     this.products = products;
    //     this.totalPrice = totalPrice;
    // }
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent.toString());
            }
            const existingProductIndex = cart.products.findIndex((p) => p.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if (existingProduct) {
                updatedProduct = Object.assign({}, existingProduct);
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            }
            else {
                updatedProduct = { id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err);
            });
        });
    }
}
//# sourceMappingURL=cart.js.map