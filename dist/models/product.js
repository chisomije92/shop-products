import { getDb } from "../utils/database.js";
import { ObjectId } from "mongodb";
class Product {
    constructor(title, price, description, imageUrl, userId, id) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.userId = new ObjectId(userId);
        this._id = id ? new ObjectId(id) : undefined;
    }
    save() {
        const db = getDb();
        let dbOp;
        if (this._id) {
            dbOp = db
                .collection("products")
                .updateOne({ _id: this._id }, { $set: this });
        }
        else {
            dbOp = db.collection("products").insertOne(this);
        }
        return dbOp
            .then((result) => {
            console.log(result);
        })
            .catch((err) => {
            console.log(err);
        });
    }
    static fetchAll() {
        const db = getDb();
        return db
            .collection("products")
            .find()
            .toArray()
            .then((products) => {
            return products;
        })
            .catch((err) => {
            console.log(err);
        });
    }
    static findById(prodId) {
        const db = getDb();
        return db
            .collection("products")
            .find({ _id: new ObjectId(prodId) })
            .next()
            .then((product) => {
            console.log(product);
            return product;
        })
            .catch((err) => {
            console.log(err);
        });
    }
    static deleteById(prodId) {
        const db = getDb();
        return (db
            .collection("products")
            .deleteOne({ _id: new ObjectId(prodId) })
            // .then(() => {
            //   return db.collection("users").updateOne(
            //     { _id: new ObjectId(prodId) },
            //     {
            //       $pull: { items: { productId: new ObjectId(prodId) } },
            //     }
            //   );
            // }).then((product) => {
            //   console.log(product);
            // })
            .catch((err) => {
            console.log(err);
        }));
    }
}
export default Product;
//# sourceMappingURL=product.js.map