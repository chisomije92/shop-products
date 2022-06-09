import express from "express";
import bodyParser from "body-parser";
import adminRoute from "./routes/admin.js";
import shopRoute from "./routes/shop.js";
import path from "path";
import { get404Page } from "./controllers/404.js";
import sequelize from "./utils/database.js";

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

app.use(get404Page);

sequelize
  .sync()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
app.listen(3000);
