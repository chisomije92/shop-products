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
    // req.user
    //   ?.createProduct({
    //     title,
    //     price,
    //     imageUrl,
    //     description,
    //   })
    const product = new Product(title, price, description, imageUrl);
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
    // const prodId = req.params.productId;
    // Product.findByPk(prodId)
    //   .then((product) => {
    //     if (!product) {
    //       return res.redirect("/");
    //     }
    //     res.render("admin/edit-product", {
    //       pageTitle: "Edit Product",
    //       path: "/admin/edit-product",
    //       editing: editMode,
    //       product,
    //     });
    //   })
    //   .catch((err: Error) => {
    //     console.log(err);
    //   });
};
export const postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    // Product.findByPk(prodId)
    //   .then((product) => {
    //     if (!product) {
    //       return res.redirect("/");
    //     }
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
    // req.user
    //   ?.getProducts()
    //   .then((products: ProductType) => {
    //     res.render("admin/products", {
    //       products: [],
    //       pageTitle: "Admin Products",
    //       path: "/admin/products",
    //     });
    //   })
    //   .catch((err: Error) => {
    //     console.log(err);
    //   });
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
    // Product.findByPk(prodId)
    //   .then((product) => {
    //     return product?.destroy();
    //   })
    //   .then(() => {
    //     res.redirect("/admin/products");
    //   })
    //   .catch((err: Error) => {
    //     console.log(err);
    //   });
};
//# sourceMappingURL=admin.js.map