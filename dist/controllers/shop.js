import { Product } from "../models/product.js";
export const getProducts = (req, res, next) => {
    const products = Product.fetchAll()
        .then(([row, fields]) => {
        res.render("shop/product-list", {
            products: row,
            pageTitle: "All Products",
            path: "/products",
        });
    })
        .catch((err) => { });
    // const products = Product.fetchAll((products: ProductType[]) => {
    //   res.render("shop/product-list", {
    //     products,
    //     pageTitle: "All Products",
    //     path: "/products",
    //   });
    // });
};
export const getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    // Product.findById(prodId, (product: ProductType) => {
    // res.render("shop/product-detail", {
    //   product,
    //   pageTitle: "Product Detail",
    //   path: "/products",
    // });
    // });
};
export const getIndex = (req, res, next) => {
    const products = Product.fetchAll()
        .then(([rows, fieldData]) => {
        res.render("shop/index", {
            pageTitle: "Shop",
            path: "/",
            products: rows,
        });
    })
        .catch();
};
export const getCart = (req, res, next) => {
    // const products = Product.fetchAll((products: ProductType[]) => {
    //   Cart.getCart(
    //     (cart) => {
    //     Product.fetchAll((products) => {
    //       const cartProducts = [];
    //       for (let product of products) {
    //         const cartProductData = cart?.products.find(
    //           (p) => p.id === product.id
    //         );
    //         if (cartProductData) {
    //           cartProducts.push({
    //             productData: product,
    //             qty: cartProductData.qty,
    //           });
    //         }
    //       }
    //       res.render("shop/cart", {
    //         pageTitle: "Your Cart",
    //         path: "/cart",
    //         products: cartProducts,
    //       });
    //     });
    //   });
    // });
};
export const postCart = (req, res, next) => {
    const prodId = req.body.productId;
    // Product.findById(prodId, (product: ProductType) => {
    //   Cart.addProduct(prodId, product.price);
    // });
    // res.redirect("/cart");
};
export const deleteCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    // Product.findById(prodId, (product: ProductType) => {
    //   Cart.deleteProduct(prodId, product.price);
    //   res.redirect("/cart");
    // });
};
export const getOrders = (req, res, next) => {
    // const products = Product.fetchAll((products: ProductType[]) => {
    //   res.render("shop/orders", {
    //     products,
    //     pageTitle: "Your Orders",
    //     path: "/orders",
    //   });
    // });
};
export const getCheckout = (req, res, next) => {
    // const products = Product.fetchAll((products: ProductType[]) => {
    //   res.render("shop/checkout", {
    //     products,
    //     pageTitle: "Checkout",
    //     path: "/checkout",
    //   });
    // });
};
//# sourceMappingURL=shop.js.map