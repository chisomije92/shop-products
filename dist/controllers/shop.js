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
export const getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId, (product) => {
        res.render("shop/product-detail", {
            product,
            pageTitle: "Product Detail",
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
export const postCart = (req, res, next) => {
    const prodId = req.body.productId;
    console.log(prodId);
    res.redirect("/cart");
};
export const getOrders = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render("shop/orders", {
            products,
            pageTitle: "Your Orders",
            path: "/orders",
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