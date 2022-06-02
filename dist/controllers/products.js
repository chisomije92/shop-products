import { Product } from "../models/product.js";
export const getAddProduct = (req, res, next) => {
    res.render("add-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
    });
};
export const postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect("/");
};
export const getProducts = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render("shop", { products, pageTitle: "Shop", path: "/" });
    });
};
//# sourceMappingURL=products.js.map