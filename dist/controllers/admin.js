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
    Product.create({
        title,
        price,
        imageUrl,
        description,
    })
        .then((product) => {
        //   console.log(product);
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
    Product.findById(prodId
    //      (product: ProductType) => {
    //     if (!product) {
    //       return res.redirect("/");
    //     }
    //     res.render("admin/edit-product", {
    //       pageTitle: "Edit Product",
    //       path: "/admin/edit-product",
    //       editing: editMode,
    //       product,
    //     });
    //   }
    );
};
export const postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    //   const updatedProduct = new Product(
    //     updatedTitle,
    //     updatedImageUrl,
    //     updatedDescription,
    //     updatedPrice,
    //     prodId
    //   );
    //   updatedProduct
    //     .save()
    //     .then(() => {
    //       res.redirect("/admin/products");
    //     })
    //     .catch((err: any) => {});
};
export const getProducts = (req, res, next) => {
    Product.findAll()
        .then((products) => {
        res.render("admin/products", {
            products,
            pageTitle: "Admin Products",
            path: "/admin/products",
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
export const postDeleteProduct = (req, res, next) => {
    //   const prodId: string = req.body.productId;
    //   Product.deleteById(prodId);
    //   res.redirect("/admin/products");
};
//# sourceMappingURL=admin.js.map