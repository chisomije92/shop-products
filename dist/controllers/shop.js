import { Product } from "../models/product.js";
export const getProducts = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render("shop/product-list", {
            products,
            pageTitle: "All Products",
            path: "/products",
        });
    });
};
export const getIndex = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render("shop/index", { products, pageTitle: "Shop", path: "/" });
    });
};
export const getCart = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render("shop/cart", {
            products,
            pageTitle: "Your Cart",
            path: "/cart",
        });
    });
};
export const getCheckout = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render("shop/checkout", {
            products,
            pageTitle: "Checkout",
            path: "/checkout",
        });
    });
};
//# sourceMappingURL=shop.js.map