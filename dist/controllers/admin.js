import { Product } from "../models/product.js";
export const getAddProduct = (req, res, next) => {
    res.render("admin/add-product", {
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
        res.render("admin/products", {
            products,
            pageTitle: "Admin Products",
            path: "/admin/products",
        });
    });
};
//# sourceMappingURL=admin.js.map