import express from "express";

import {
  getCart,
  getCheckout,
  getIndex,
  getProducts,
} from "../controllers/shop.js";

const router = express.Router();

router.get("/", getIndex);
router.get("/cart", getCart);
router.get("/products", getProducts);
router.get("/checkout", getCheckout);

export default router;
