import express from "express";
import { deleteCartProduct, getCart, getIndex, getOrders, getProduct, getProducts, postCart, postOrder, } from "../controllers/shop.js";
import isAuth from "../middleware/is-auth.js";
const router = express.Router();
router.get("/", getIndex);
router.get("/cart", isAuth, getCart);
router.post("/cart", isAuth, postCart);
router.post("/create-order", isAuth, postOrder);
router.post("/cart-delete-item", isAuth, deleteCartProduct);
router.get("/products", getProducts);
router.get("/products/:productId", isAuth, getProduct);
router.get("/orders", isAuth, getOrders);
export default router;
//# sourceMappingURL=shop.js.map