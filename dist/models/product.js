import db from "../utils/database.js";
export class Product {
    constructor(title, imageUrl, description, price, id) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }
    save() {
        return db.execute("INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)", [this.title, this.price, this.imageUrl, this.description]);
    }
    static deleteById(id) { }
    static fetchAll() {
        return db.execute("SELECT * FROM products");
    }
    static findById(id) {
        return db.query("SELECT * FROM products WHERE products.id = ?", [id]);
    }
}
//# sourceMappingURL=product.js.map