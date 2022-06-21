import express from "express";
import bodyParser from "body-parser";
import adminRoute from "./routes/admin.js";
import shopRoute from "./routes/shop.js";
import authRoute from "./routes/auth.js";
import path from "path";
import { get404Page } from "./controllers/404.js";
import mongoose from "mongoose";
import sessions from "express-session";
import dotenv from "dotenv";
import User from "./models/user.js";
import MongoDBStore from "connect-mongodb-session";
import csrf from "csurf";
const MongoStore = MongoDBStore(sessions);
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
const store = new MongoStore({
    uri: conn_string,
    collection: "sessions",
});
const csrfProtection = csrf();
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(sessions({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
}));
app.use(csrfProtection);
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
        req.user = user;
        next();
    })
        .catch((err) => console.log(err));
});
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use("/admin", adminRoute);
app.use(shopRoute);
app.use(authRoute);
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