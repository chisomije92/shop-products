import express from "express";
import path, { dirname } from "path";

interface ProductType {
  title: string;
}

const router = express.Router();

export const products: ProductType[] = [];
const __dirname = path.resolve();

router.get("/add-product", (req, res, next) => {
  //   res.sendFile(path.join(__dirname, "./", "views", "add-product.html"));
  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
  });
});

router.post("/add-product", (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect("/");
});

export default router;
