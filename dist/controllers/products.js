export const products = [];
export const getAddProduct = (req, res, next) => {
    res.render("add-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
    });
};
export const postAddProduct = (req, res, next) => {
    products.push({ title: req.body.title });
    res.redirect("/");
};
export const getProducts = (req, res, next) => {
    console.log(products);
    res.render("shop", { products, pageTitle: "Shop", path: "/" });
};
//# sourceMappingURL=products.js.map