import express from "express";
import bodyParser from "body-parser";
import adminRoute from "./routes/admin.js";
import path from "path";
import mongoConnect from "./utils/database.js";
// import sequelize from "./utils/database.js";
// import Product from "./models/product.js";
// import User from "./models/user.js";
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
    // User.findByPk(1).then((user) => {
    //   req.user = user;
    next();
    // });
});
app.use("/admin", adminRoute);
// app.use(shopRoute);
// app.use(get404Page);
mongoConnect(() => {
    app.listen(3000);
});
//# sourceMappingURL=server.js.map