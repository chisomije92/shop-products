import { ObjectId } from "mongodb";
import { getDb } from "../utils/database.js";

export interface UserType {
  id?: string;
  name: string;
  email: string;
}

class User {
  // _id?: ObjectId;
  name: string;
  email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
    // this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  static findById(userId: string) {
    const db = getDb();
    return db.collection("users").findOne({ _id: new ObjectId(userId) });
  }
}

export default User;
