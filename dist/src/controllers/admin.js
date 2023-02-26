var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Product from "../models/product.js";
import { validationResult } from "express-validator";
import { deleteFile } from "../utils/file.js";
import { CustomError } from "../utils/custom-err.js";
export const getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};
export const postAddProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if (!image) {
        return res.status(400).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
            },
            errorMessage: "Invalid image file",
            validationErrors: [],
        });
    }
    const imageUrl = image.path;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    try {
        const product = new Product({
            title: title,
            price: price,
            description: description,
            imageUrl: imageUrl,
            userId: req.user,
        });
        yield product.save();
        res.redirect("/admin/products");
    }
    catch (err) {
        next(new CustomError(err.message));
    }
});
export const getEditProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    try {
        const product = yield Product.findById(prodId);
        if (!product) {
            return res.redirect("/");
        }
        res.render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: editMode,
            hasError: false,
            errorMessage: null,
            product: product,
            validationErrors: [],
        });
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const postEditProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImage = req.file;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    const product = yield Product.findById(prodId);
    if ((product === null || product === void 0 ? void 0 : product.userId.toString()) !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id.toString())) {
        return res.redirect("/");
    }
    else {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        if (updatedImage) {
            deleteFile(product.imageUrl);
            product.imageUrl = updatedImage.path;
        }
        yield product.save();
        res.redirect("/admin/products");
    }
});
export const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const products = yield Product.find({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
        });
        res.render("admin/products", {
            products: products,
            pageTitle: "Admin Products",
            path: "/admin/products",
            isAuthenticated: req.session.isLoggedIn,
        });
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const prodId = req.params.productId;
    try {
        const product = yield Product.findById(prodId);
        if (!product) {
            return next(new Error("Product not found"));
        }
        deleteFile(product.imageUrl);
        yield product.deleteOne({
            _id: prodId,
            userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
        });
        res.status(200).json({
            message: "Success!",
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Deleting product failed",
        });
    }
});
//# sourceMappingURL=admin.js.map