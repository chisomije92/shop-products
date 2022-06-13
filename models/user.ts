import { ObjectId, WithId } from "mongodb";
import { getDb } from "../utils/database.js";
import { ProductType } from "./product.js";

export interface ItemObjType {
  productId: ObjectId;
  quantity: number;
}
export interface CartItemType {
  items: ItemObjType[];
}
// export interface CartType {
//   cart: CartItemType[]
// }
export interface UserType {
  id?: string;
  name: string;
  email: string;
}

class User {
  // _id?: ObjectId;
  name: string;
  email: string;
  _id: ObjectId;
  cart: CartItemType;

  constructor(name: string, email: string, id: ObjectId, cart: CartItemType) {
    this.name = name;
    this.email = email;
    this._id = id;
    this.cart = cart;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product: any) {
    const cartProductIndex = this.cart.items.findIndex((item) => {
      return item.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;

    const updatedCartItems: ItemObjType[] = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity,
      });
    }
    let updatedItems: CartItemType = {
      items: updatedCartItems,
    };

    const db = getDb();
    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedItems } });
  }

  static findById(userId: string) {
    const db = getDb();
    return db.collection("users").findOne({ _id: new ObjectId(userId) });
  }
}

export default User;
