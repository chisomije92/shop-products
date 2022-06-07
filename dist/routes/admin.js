import express from "express";
import { getAddProduct, getEditProduct, getProducts, postAddProduct, } from "../controllers/admin.js";
const router = express.Router();
router.get("/add-product", getAddProduct);
router.get("/products", getProducts);
router.post("/add-product", postAddProduct);
router.get("/edit-product/:productId", getEditProduct);
export default router;
//# sourceMappingURL=admin.js.map