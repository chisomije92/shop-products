import express from "express";
import bodyParser from "body-parser";
import adminRoute from "./routes/admin.js";
import shopRoute from "./routes/shop.js";
import path from "path";
import { get404Page } from "./controllers/404.js";
import mongoConnect from "./utils/database.js";
// import sequelize from "./utils/database.js";
// import Product from "./models/product.js";
import User from "./models/user.js";
import { ObjectId } from "mongodb";
// import Cart from "./models/cart.js";
// import CartItem from "./models/cart-item.js";
// import Order from "./models/order.js";
// import OrderItem from "./models/order-item.js";
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
mongoConnect(() => {
    app.listen(3000);
});
//# sourceMappingURL=server.js.map