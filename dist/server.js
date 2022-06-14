import express from "express";
import bodyParser from "body-parser";
import adminRoute from "./routes/admin.js";
import shopRoute from "./routes/shop.js";
import path from "path";
import { get404Page } from "./controllers/404.js";
import mongoose from "mongoose";
import User from "./models/user.js";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
let conn_string;
if (process.env.MONGO_CONN_STRING) {
    conn_string = process.env.MONGO_CONN_STRING;
}
else {
    throw new Error("MONGO_CONN_STRING is not set");
}
const __dirname = path.resolve();
const app = express();
// app.set("view engine", "pug");
// app.set("views", "views");
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
    User.findById("62a61389040805c6c5c61f32")
        .then((user) => {
        // const userId = new ObjectId(user?._id);
        req.user = new User(user === null || user === void 0 ? void 0 : user.name, user === null || user === void 0 ? void 0 : user.email, new ObjectId(user === null || user === void 0 ? void 0 : user._id), user === null || user === void 0 ? void 0 : user.cart);
        next();
    })
        .catch((err) => {
        console.log(err);
    });
});
app.use("/admin", adminRoute);
app.use(shopRoute);
app.use(get404Page);
mongoose
    .connect(conn_string)
    .then(() => {
    app.listen(3000);
})
    .catch((err) => {
    console.log(err);
});
//# sourceMappingURL=server.js.map