import express from "express";
import { getAddProduct, getEditProduct, getProducts, postAddProduct, postDeleteProduct, postEditProduct, } from "../controllers/admin.js";
import isAuth from "../middleware/is-auth.js";
const router = express.Router();
router.get("/add-product", isAuth, getAddProduct);
router.get("/products", isAuth, getProducts);
router.post("/add-product", isAuth, postAddProduct);
router.get("/edit-product/:productId", isAuth, getEditProduct);
router.post("/edit-product", isAuth, postEditProduct);
router.post("/delete-product", isAuth, postDeleteProduct);
export default router;
//# sourceMappingURL=admin.js.map