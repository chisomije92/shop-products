import express from "express";
import path, { dirname } from "path";
import { getAddProduct, postAddProduct } from "../controllers/products.js";

const router = express.Router();

const __dirname = path.resolve();

router.get("/add-product", getAddProduct);

router.post("/add-product", postAddProduct);

export default router;
