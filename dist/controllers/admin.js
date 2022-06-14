import Product from "../models/product.js";
export const getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
    });
};
export const postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
    });
    product
        .save()
        .then(() => {
        res.redirect("/admin/products");
    })
        .catch((err) => {
        console.log(err);
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
            product,
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
export const postEditProduct = (req, res, next) => {
    var _a;
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const product = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, (_a = req.user) === null || _a === void 0 ? void 0 : _a._id, prodId);
    product.save().then((product) => {
        res.redirect("/admin/products");
    });
    //     product
    //       .update({
    //         title: updatedTitle,
    //         price: updatedPrice,
    //         imageUrl: updatedImageUrl,
    //         description: updatedDescription,
    //       })
    //       .then((result) => {
    //         res.redirect("/admin/products");
    //       });
    //   })
    //   .catch((err: Error) => {
    //     console.log(err);
    //   });
};
export const getProducts = (req, res, next) => {
    Product.fetchAll()
        .then((products) => {
        res.render("admin/products", {
            products: products,
            pageTitle: "Admin Products",
            path: "/admin/products",
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
export const postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    //   Product.destroy({
    //     where: {
    //       id: prodId,
    //     },
    //   }).then(() => {
    //     res.redirect("/admin/products");
    //   });
    Product.deleteById(prodId)
        .then(() => {
        res.redirect("/admin/products");
    })
        .catch((err) => {
        console.log(err);
    });
};
//# sourceMappingURL=admin.js.map