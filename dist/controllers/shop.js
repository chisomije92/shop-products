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
        console.log(product);
    });
    res.redirect("/");
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