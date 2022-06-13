import { ObjectId } from "mongodb";
import { getDb } from "../utils/database.js";
class User {
    constructor(name, email, id, cart) {
        this.name = name;
        this.email = email;
        this._id = id;
        this.cart = cart;
    }
    save() {
        const db = getDb();
        return db.collection("users").insertOne(this);
    }
    addToCart(product) {
        // const cartItemIndex = this.cart.items.findIndex(
        //   (item: any) => item._id.toString() === product._id?.toString()
        // );
        let updatedCartItems = {
            items: [
                {
                    productId: new ObjectId(product._id),
                    quantity: 1,
                },
            ],
        };
        const db = getDb();
        return db
            .collection("users")
            .updateOne({ _id: this._id }, { $set: { cart: updatedCartItems } });
    }
    static findById(userId) {
        const db = getDb();
        return db.collection("users").findOne({ _id: new ObjectId(userId) });
    }
}
export default User;
//# sourceMappingURL=user.js.map