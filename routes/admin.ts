import express from "express";
import {
  getAddProduct,
  getEditProduct,
  getProducts,
  postAddProduct,
  deleteProduct,
  postEditProduct,
} from "../controllers/admin.js";
import isAuth from "../middleware/is-auth.js";
import { body } from "express-validator";

const router = express.Router();

router.get("/add-product", isAuth, getAddProduct);
router.get("/products", isAuth, getProducts);

router.post(
  "/add-product",
  [
    body("title", "Set a valid title value")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Set a valid price value").isFloat(),
    body("description", "Set a valid desc value").isLength({ min: 5 }).trim(),
  ],
  isAuth,
  postAddProduct
);
router.get("/edit-product/:productId", isAuth, getEditProduct);
router.post(
  "/edit-product",
  [
    body("title", "Set a valid title value")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "Set a valid price value").isFloat(),
    body("description", "Set a valid desc value").isLength({ min: 5 }).trim(),
  ],
  isAuth,
  postEditProduct
);
router.delete("/product/:productId", isAuth, deleteProduct);
export default router;
