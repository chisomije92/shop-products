import express from "express";
import bodyParser from "body-parser";
import adminRoute from "./routes/admin.js";
import shopRoute from "./routes/shop.js";
import path from "path";
const __dirname = path.resolve();
const app = express();
// app.set("view engine", "pug");
// app.set("views", "views");
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", adminRoute);
app.use(shopRoute);
app.use((req, res, next) => {
    //   res.status(404).send("<h1>Page not found</h1>");
    res.status(404).render("404", { pageTitle: "Page not found" });
});
app.listen(3000);
//# sourceMappingURL=server.js.map