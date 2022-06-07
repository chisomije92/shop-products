import { Product } from "../models/product.js";
export const getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
    });
};
export const postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(title, imageUrl, description, price);
    product.save();
    res.redirect("/");
};
export const getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
    });
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