import { Db, MongoErrorLabel, ObjectId, WithId } from "mongodb";
import { getDb } from "../utils/database.js";
import { ProductType } from "./product.js";

export interface ItemObjType {
  productId: ObjectId;
  quantity: number;
}
export interface CartItemType {
  items: ItemObjType[];
}

export interface UserType {
  id?: string;
  name: string;
  email: string;
}

class User {
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

  getCart() {
    const productIds = this.cart.items.map((item) => item.productId);

    const db = getDb();
    let storedProducts: any;
    let itemsProduct: { productId: ObjectId; quantity: number }[];

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        storedProducts = products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            })?.quantity,
          };
        });
        return storedProducts;
      })
      .then((products) => {
        itemsProduct = products.map((p: any) => ({
          productId: p._id,
          quantity: p.quantity,
        }));

        return db.collection("users").updateOne(
          { _id: this._id },
          {
            $set: {
              cart: {
                items: itemsProduct.filter((i) => i.quantity > 0),
              },
            },
          }
        );
      })
      .then(() => {
        return storedProducts;
      });
  }

  deleteItemFromCart(productId: ObjectId) {
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: this._id },
      {
        $set: {
          cart: {
            items: updatedCartItems,
          },
        },
      }
    );
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
        return db.collection("users").updateOne(
          { _id: this._id },
          {
            $set: {
              cart: {
                items: [],
              },
            },
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getOrders() {
    const db = getDb();
    return db.collection("orders").find({ "user._id": this._id }).toArray();
  }

  static findById(userId: string) {
    const db = getDb();
    return db.collection("users").findOne({ _id: new ObjectId(userId) });
  }
}

export default User;
