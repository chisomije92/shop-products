import { ObjectId } from "mongodb";
import { getDb } from "../utils/database.js";
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
        // this._id = id;
    }
    save() {
        const db = getDb();
        return db.collection("users").insertOne(this);
    }
    static findById(userId) {
        const db = getDb();
        return db.collection("users").findOne({ _id: new ObjectId(userId) });
    }
}
export default User;
//# sourceMappingURL=user.js.map