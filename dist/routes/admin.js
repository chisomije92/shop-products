import express from "express";
const router = express.Router();
router.get("/add-product", (req, res) => {
    res.send('<body><form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form></body>');
});
router.post("/product", (req, res, next) => {
    console.log(req.body);
    res.redirect("/");
});
export default router;
//# sourceMappingURL=admin.js.map