import fs from "fs";
import path from "path";
const __dirname = path.resolve();
const p = path.join(__dirname, "data", "products.json");
const getProductsFromFile = (cb) => {
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
    constructor(title, imageUrl, description, price, id) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }
    save() {
        getProductsFromFile((products) => {
            if (this.id) {
                const existingProductIndex = products.findIndex((prod) => prod.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                    console.log(err);
                });
            }
            else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log(err);
                });
                console.log("No product id provided");
            }
        });
    }
    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
    static findById(id, cb) {
        getProductsFromFile((products) => {
            const product = products.find((p) => p.id === id);
            if (product) {
                cb(product);
            }
        });
    }
}
//# sourceMappingURL=product.js.map