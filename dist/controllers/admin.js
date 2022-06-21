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
        userId: req.user,
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
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    Product.findById(prodId)
        .then((product) => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        product.imageUrl = updatedImageUrl;
        return product.save();
    })
        .then(() => {
        res.redirect("/admin/products");
    });
};
export const getProducts = (req, res, next) => {
    Product.find()
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
        console.log(err);
    });
};
export const postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId)
        .then(() => {
        res.redirect("/admin/products");
    })
        .catch((err) => {
        console.log(err);
    });
};
//# sourceMappingURL=admin.js.map