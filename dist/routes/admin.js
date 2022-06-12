import express from "express";
import { getAddProduct, getEditProduct, getProducts, postAddProduct, postEditProduct, } from "../controllers/admin.js";
const router = express.Router();
router.get("/add-product", getAddProduct);
router.get("/products", getProducts);
router.post("/add-product", postAddProduct);
router.get("/edit-product/:productId", getEditProduct);
router.post("/edit-product", postEditProduct);
// router.post("/delete-product", postDeleteProduct);
export default router;
//# sourceMappingURL=admin.js.map