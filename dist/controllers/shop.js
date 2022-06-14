import { ObjectId } from "mongodb";
import Product from "../models/product.js";
export const getProducts = (req, res, next) => {
    Product.find()
        .then((products) => {
        res.render("shop/product-list", {
            products: products,
            pageTitle: "All Products",
            path: "/products",
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
export const getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
        res.render("shop/product-detail", {
            product: product,
            pageTitle: product === null || product === void 0 ? void 0 : product.title,
            path: "/products",
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
export const getIndex = (req, res, next) => {
    Product.find()
        .then((products) => {
        res.render("shop/index", {
            products: products,
            pageTitle: "Shop",
            path: "/",
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
export const getCart = (req, res, next) => {
    var _a;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.getCart().then((products) => {
        res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
        });
    }).catch((err) => {
        console.log(err);
    });
};
export const postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then((product) => {
        var _a;
        return (_a = req.user) === null || _a === void 0 ? void 0 : _a.addToCart(product);
    })
        .then(() => {
        res.redirect("/cart");
    });
};
export const deleteCartProduct = (req, res, next) => {
    var _a;
    const prodId = req.body.productId;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.deleteItemFromCart(new ObjectId(prodId)).then(() => {
        res.redirect("/cart");
    }).catch((err) => {
        console.log(err);
    });
};
export const getOrders = (req, res, next) => {
    var _a;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.getOrders().then((orders) => {
        res.render("shop/orders", {
            orders: orders,
            pageTitle: "Your Orders",
            path: "/orders",
        });
    }).catch((err) => {
        console.log(err);
    });
};
export const postOrder = (req, res, next) => {
    var _a;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.addOrder().then(() => {
        res.redirect("/orders");
    });
};
//# sourceMappingURL=shop.js.map