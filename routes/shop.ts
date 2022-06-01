import express from "express";
import path from "path";
import { products } from "./admin.js";

const router = express.Router();

const __dirname = path.resolve();

router.get("/", (req, res, next) => {
  console.log(products);
  //   res.sendFile(path.join(__dirname, "./", "views", "shop.html"));
  res.render("shop", { products, pageTitle: "Shop", path: "/" });
});

export default router;
