import express from "express";

import {
  deleteCartProduct,
  getCart,
  getCheckout,
  getIndex,
  getInvoice,
  getOrders,
  getProduct,
  getProducts,
  postCart,
  verifyOrder,
} from "../controllers/shop.js";
import isAuth from "../middleware/is-auth.js";

const router = express.Router();

router.get("/", getIndex);
router.get("/cart", isAuth, getCart);
router.post("/cart", isAuth, postCart);
router.get("/verify-order", isAuth, verifyOrder);
router.post("/cart-delete-item", isAuth, deleteCartProduct);
router.get("/checkout", isAuth, getCheckout);
router.get("/products", getProducts);
router.get("/products/:productId", isAuth, getProduct);
router.get("/orders", isAuth, getOrders);
router.get("/orders/:orderId", isAuth, getInvoice);

export default router;
