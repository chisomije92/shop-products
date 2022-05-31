import express from "express";
import path, { dirname } from "path";
import rootDir from "../utils/path.js";

const router = express.Router();

const __dirname = path.resolve();

router.get("/add-product", (req, res, next) => {
  res.sendFile(path.join(__dirname, "./", "views", "add-product.html"));
});

router.post("/add-product", (req, res, next) => {
  res.redirect("/");
});

export default router;
