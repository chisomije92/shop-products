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
    constructor(title) {
        this.title = title;
    }
    save() {
        getProductsFromFile((products) => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err);
            });
        });
    }
    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
}
//# sourceMappingURL=product.js.map