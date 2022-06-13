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
    getCart() {
        const productIds = this.cart.items.map((item) => item.productId);
        const db = getDb();
        return db
            .collection("products")
            .find({ _id: { $in: productIds } })
            .toArray()
            .then((products) => {
            return products.map((p) => {
                var _a;
                return Object.assign(Object.assign({}, p), { quantity: (_a = this.cart.items.find((i) => {
                        return i.productId.toString() === p._id.toString();
                    })) === null || _a === void 0 ? void 0 : _a.quantity });
            });
        });
    }
    deleteItemFromCart(productId) {
        const updatedCartItems = this.cart.items.filter((item) => item.productId.toString() !== productId.toString());
        const db = getDb();
        return db.collection("users").updateOne({ _id: this._id }, {
            $set: {
                cart: {
                    items: updatedCartItems,
                },
            },
        });
    }
    addOrder() {
        const db = getDb();
        return this.getCart()
            .then((products) => {
            const order = {
                items: products,
                user: {
                    _id: this._id,
                    name: this.name,
                },
            };
            return db.collection("orders").insertOne(order);
        })
            .then((result) => {
            this.cart = { items: [] };
            return db.collection("users").updateOne({ _id: this._id }, {
                $set: {
                    cart: {
                        items: [],
                    },
                },
            });
        })
            .catch((err) => {
            console.log(err);
        });
    }
    getOrders() { }
    static findById(userId) {
        const db = getDb();
        return db.collection("users").findOne({ _id: new ObjectId(userId) });
    }
}
export default User;
//# sourceMappingURL=user.js.map