import Product from "../models/product.js";
import { validationResult } from "express-validator";
import { deleteFile } from "../utils/file.js";
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
export const postAddProduct = (req, res, next) => {
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
            // csrfToken: req.csrfToken(),
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user,
    });
    product
        .save()
        .then(() => {
        res.redirect("/admin/products");
    })
        .catch((err) => {
        const error = new Error(err);
        //@ts-ignore
        error.httpStatusCode = 500;
        return next(error);
    });
};
export const getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
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
    })
        .catch((err) => {
        const error = new Error(err);
        //@ts-ignore
        error.httpStatusCode = 500;
        return next(error);
    });
};
export const postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImage = req.file;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("admin/edit-product", {
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
    Product.findById(prodId).then((product) => {
        var _a;
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
            return product.save().then(() => {
                res.redirect("/admin/products");
            });
        }
    });
};
export const getProducts = (req, res, next) => {
    var _a;
    Product.find({
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
    })
        // .select("title price -_id") // this is to select data to be returned. N.B. -_id is to exclude the id from the data
        // .populate("userId") // this is to populate the userId field with the user details
        .then((products) => {
        res.render("admin/products", {
            products: products,
            pageTitle: "Admin Products",
            path: "/admin/products",
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
export const deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
        var _a;
        if (!product) {
            return next(new Error("Product not found"));
        }
        deleteFile(product.imageUrl);
        return product.deleteOne({
            _id: prodId,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        });
    })
        .then(() => {
        res.status(200).json({
            message: "Success!",
        });
    })
        .catch((err) => {
        res.status(500).json({
            message: "Deleting product failed",
        });
    });
};
//# sourceMappingURL=admin.js.map