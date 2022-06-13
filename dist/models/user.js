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
        const cartProductIndex = this.cart.items.findIndex((item) => {
            return item.productId.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];
        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }
        else {
            updatedCartItems.push({
                productId: product._id,
                quantity: newQuantity,
            });
        }
        let updatedItems = {
            items: updatedCartItems,
        };
        const db = getDb();
        return db
            .collection("users")
            .updateOne({ _id: this._id }, { $set: { cart: updatedItems } });
    }
    static findById(userId) {
        const db = getDb();
        return db.collection("users").findOne({ _id: new ObjectId(userId) });
    }
}
export default User;
//# sourceMappingURL=user.js.map