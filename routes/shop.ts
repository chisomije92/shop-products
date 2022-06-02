import express from "express";
import path from "path";
import { getProducts } from "../controllers/products.js";

const router = express.Router();

const __dirname = path.resolve();

router.get("/", getProducts);

export default router;
