var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from "path";
import PDFDocument from "pdfkit";
import fs from "fs";
import Product from "../models/product.js";
import Order from "../models/order.js";
import fetch from "node-fetch";
import { CustomError } from "../utils/custom-err.js";
const ITEMS_PER_PAGE = 2;
export const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let queryPage;
    if (req.query && req.query.page) {
        queryPage = +req.query.page;
    }
    const page = queryPage || 1;
    try {
        const totalDocuments = yield Product.find().countDocuments();
        const products = yield Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        res.render("shop/product-list", {
            products: products,
            pageTitle: "Products",
            path: "/products",
            totalItems: totalDocuments,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalDocuments,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalDocuments / ITEMS_PER_PAGE),
            numProducts: totalDocuments,
        });
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const getProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const prodId = req.params.productId;
    try {
        const product = yield Product.findById(prodId);
        res.render("shop/product-detail", {
            product: product,
            pageTitle: product === null || product === void 0 ? void 0 : product.title,
            path: "/products",
            isAuthenticated: req.session.isLoggedIn,
        });
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const getIndex = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let queryPage;
    if (req.query && req.query.page) {
        queryPage = +req.query.page;
    }
    const page = queryPage || 1;
    try {
        const totalDocuments = yield Product.find().countDocuments();
        const products = yield Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        res.render("shop/index", {
            products: products,
            pageTitle: "Shop",
            path: "/",
            totalItems: totalDocuments,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalDocuments,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalDocuments / ITEMS_PER_PAGE),
            numProducts: totalDocuments,
        });
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const getCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const products = yield ((_a = req.user) === null || _a === void 0 ? void 0 : _a.populate("cart.items.productId"));
        res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products.cart.items,
        });
        console.log(products);
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const postCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const prodId = req.body.productId;
    const product = yield Product.findById(prodId);
    yield ((_b = req.user) === null || _b === void 0 ? void 0 : _b.addToCart(product));
    res.redirect("/cart");
});
export const deleteCartProduct = (req, res, next) => {
    var _a;
    const prodId = req.body.productId;
    try {
        (_a = req.user) === null || _a === void 0 ? void 0 : _a.removeFromCart(prodId);
        res.redirect("/cart");
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
};
export const getOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const orders = yield Order.find({ "user.userId": (_c = req.user) === null || _c === void 0 ? void 0 : _c._id });
        res.render("shop/orders", {
            orders: orders,
            pageTitle: "Your Orders",
            path: "/orders",
        });
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const getCheckout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const user = yield ((_d = req.user) === null || _d === void 0 ? void 0 : _d.populate("cart.items.productId"));
        const products = user.cart.items;
        let totalPrice = 0;
        products.forEach((product) => {
            totalPrice += product.quantity * product.productId.price;
        });
        res.render("shop/checkout", {
            path: "/checkout",
            pageTitle: "Checkout",
            products: products,
            totalPrice: totalPrice,
            userEmail: user.email,
        });
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const verifyOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g, _h;
    const reference = req.query.reference;
    try {
        const user = yield ((_e = req.user) === null || _e === void 0 ? void 0 : _e.populate("cart.items.productId"));
        const products = user === null || user === void 0 ? void 0 : user.cart.items.map((i) => {
            return {
                quantity: i.quantity,
                product: Object.assign({}, i.productId._doc),
            };
        });
        const order = new Order({
            user: {
                email: (_f = req.user) === null || _f === void 0 ? void 0 : _f.email,
                userId: (_g = req.user) === null || _g === void 0 ? void 0 : _g._id,
            },
            products: products,
        });
        yield order.save();
        (_h = req.user) === null || _h === void 0 ? void 0 : _h.clearCart();
        const response = yield fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                authorization: `bearer ${process.env.PAYSTACK_KEY}`,
            },
        });
        const data = yield response.json();
        res.status(200).json(data);
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const getInvoice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    try {
        const orderId = req.params.orderId;
        const order = yield Order.findById(orderId);
        if (!order) {
            return next(new Error("No order found."));
        }
        if (order.user.userId.toString() !== ((_j = req.user) === null || _j === void 0 ? void 0 : _j._id.toString())) {
            return next(new Error("Unauthorized"));
        }
        const invoiceName = "invoice-" + orderId + ".pdf";
        const invoicePath = path.join("data", "invoices", invoiceName);
        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(26).text("Invoice", { underline: true });
        pdfDoc.text("--------------------");
        let totalPrice = 0;
        order.products.forEach((product) => {
            totalPrice += product.quantity * product.product.price;
            pdfDoc
                .fontSize(16)
                .text(product.product.title +
                " - " +
                product.quantity +
                " x " +
                product.product.price);
        });
        pdfDoc.text("--------------------");
        pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
        pdfDoc.end();
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
//# sourceMappingURL=shop.js.map