import express from "express";
import path from "path";
const router = express.Router();
const __dirname = path.resolve();
router.get("/add-product", (req, res, next) => {
    res.sendFile(path.join(__dirname, "./", "views", "add-product.html"));
});
router.post("/add-product", (req, res, next) => {
    console.log(req.body);
    res.redirect("/");
});
export default router;
//# sourceMappingURL=admin.js.map