import Product from "../models/product.js";
export const getProducts = (req, res, next) => {
    Product.findAll()
        .then((products) => {
        res.render("shop/product-list", {
            products: products,
            pageTitle: "All Products",
            path: "/products",
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
export const getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    // Product.findAll({ where: { id: prodId } })
    //   .then((products) => {
    //     res.render("shop/product-detail", {
    //       product: products[0],
    //       pageTitle: products[0]?.title,
    //       path: "/products",
    //     });
    //   })
    //   .catch((err: Error) => {
    //     console.log(err);
    //   });
    Product.findByPk(prodId)
        .then((product) => {
        res.render("shop/product-detail", {
            product: product,
            pageTitle: product === null || product === void 0 ? void 0 : product.title,
            path: "/products",
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
export const getIndex = (req, res, next) => {
    Product.findAll()
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