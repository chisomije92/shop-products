import mongoose from "mongoose";
const { Schema, model } = mongoose;
const productSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
});
export default model("Product", productSchema);
// import { getDb } from "../utils/database.js";
// import { ObjectId } from "mongodb";
// export interface ProductType {
//   _id?: ObjectId;
//   title: string;
//   price: number;
//   description: string;
//   imageUrl: string;
// }
// class Product {
//   _id?: ObjectId;
//   userId: ObjectId;
//   title: string;
//   price: number;
//   description: string;
//   imageUrl: string;
//   constructor(
//     title: string,
//     price: number,
//     description: string,
//     imageUrl: string,
//     userId: string,
//     id?: string
//   ) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this.userId = new ObjectId(userId);
//     this._id = id ? new ObjectId(id) : undefined;
//   }
//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection("products").insertOne(this);
//     }
//     return dbOp
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         return products;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   static findById(prodId: string) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new ObjectId(prodId) })
//       .next()
//       .then((product) => {
//         console.log(product);
//         return product;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   static deleteById(prodId: string) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new ObjectId(prodId) })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }
// export default Product;
//# sourceMappingURL=product.js.map