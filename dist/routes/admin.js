import express from "express";
import path from "path";
const router = express.Router();
export const products = [];
const __dirname = path.resolve();
router.get("/add-product", (req, res, next) => {
    res.sendFile(path.join(__dirname, "./", "views", "add-product.html"));
});
router.post("/add-product", (req, res, next) => {
    products.push({ title: req.body.title });
    res.redirect("/");
});
export default router;
//# sourceMappingURL=admin.js.map