import express from "express";

import {
  deleteCartDeleteProduct,
  getCart,
  getIndex,
  getOrders,
  getProduct,
  getProducts,
  postCart,
  postOrder,
} from "../controllers/shop.js";

const router = express.Router();

router.get("/", getIndex);
// router.get("/cart", getCart);
// router.post("/cart", postCart);
// router.post("/create-order", postOrder);
// router.post("/cart-delete-item", deleteCartDeleteProduct);
router.get("/products", getProducts);
router.get("/products/:productId", getProduct);
// router.get("/orders", getOrders);

export default router;
