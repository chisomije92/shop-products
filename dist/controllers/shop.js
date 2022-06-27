import path from "path";
import fs from "fs";
import Product from "../models/product.js";
import Order from "../models/order.js";
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
        const error = new Error(err);
        //@ts-ignore
        error.httpStatusCode = 500;
        return next(error);
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
            isAuthenticated: req.session.isLoggedIn,
        });
    })
        .catch((err) => {
        const error = new Error(err);
        //@ts-ignore
        error.httpStatusCode = 500;
        return next(error);
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
    // User.findById(req.session.user?._id)
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.populate("cart.items.productId").then((user) => {
        const products = user.cart.items;
        res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
        });
    }).catch((err) => console.log(err));
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
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.deleteItemFromCart(prodId).then(() => {
        res.redirect("/cart");
    }).catch((err) => {
        {
            const error = new Error(err);
            //@ts-ignore
            error.httpStatusCode = 500;
            return next(error);
        }
    });
};
export const getOrders = (req, res, next) => {
    var _a;
    Order.find({ "user.userId": (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
        .then((orders) => {
        res.render("shop/orders", {
            orders: orders,
            pageTitle: "Your Orders",
            path: "/orders",
        });
    })
        .catch((err) => {
        const error = new Error(err);
        //@ts-ignore
        error.httpStatusCode = 500;
        return next(error);
    });
};
export const postOrder = (req, res, next) => {
    var _a;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.populate("cart.items.productId").then((user) => {
        var _a, _b;
        const products = user === null || user === void 0 ? void 0 : user.cart.items.map((i) => {
            return {
                quantity: i.quantity,
                product: Object.assign({}, i.productId._doc),
            };
        });
        const order = new Order({
            user: {
                email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email,
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            },
            products: products,
        });
        return order.save();
    }).then(() => {
        var _a;
        (_a = req.user) === null || _a === void 0 ? void 0 : _a.clearCart();
    }).then(() => {
        res.redirect("/orders");
    }).catch((err) => {
        const error = new Error(err);
        //@ts-ignore
        error.httpStatusCode = 500;
        return next(error);
    });
};
export const getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId).then((order) => {
        var _a;
        if (!order) {
            return next(new Error("No order found."));
        }
        if (order.user.userId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            return next(new Error("Unauthorized"));
        }
        const invoiceName = "invoice-" + orderId + ".pdf";
        const invoicePath = path.join("data", "invoices", invoiceName);
        fs.readFile(invoicePath, (err, data) => {
            if (err) {
                return next(err);
            }
            res.contentType("application/pdf");
            res.setHeader("Content-Disposition", "inline; filename=" + invoiceName + "");
            res.send(data);
        });
    });
};
//# sourceMappingURL=shop.js.map