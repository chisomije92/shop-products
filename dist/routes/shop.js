import express from "express";
import { deleteCartDeleteProduct, getCart, getCheckout, getIndex, getOrders, getProduct, getProducts, postCart, } from "../controllers/shop.js";
const router = express.Router();
router.get("/", getIndex);
router.get("/cart", getCart);
router.post("/cart", postCart);
router.post("/cart-delete-item", deleteCartDeleteProduct);
router.get("/products", getProducts);
router.get("/products/:productId", getProduct);
router.get("/checkout", getCheckout);
router.get("/orders", getOrders);
export default router;
//# sourceMappingURL=shop.js.map