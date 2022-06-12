import { getDb } from "../utils/database.js";
class Product {
    constructor(title, price, description, imageUrl) {
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
//# sourceMappingURL=product.js.map