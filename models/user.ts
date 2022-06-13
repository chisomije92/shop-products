import { ObjectId } from "mongodb";
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
    // const cartItemIndex = this.cart.items.findIndex(
    //   (item: any) => item._id.toString() === product._id?.toString()
    // );
    let updatedCartItems: CartItemType = {
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

  static findById(userId: string) {
    const db = getDb();
    return db.collection("users").findOne({ _id: new ObjectId(userId) });
  }
}

export default User;
