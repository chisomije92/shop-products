import Product from "../models/product.js";
export const getProducts = (req, res, next) => {
    Product.fetchAll()
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
    // Product.findByPk(prodId)
    //   .then((product) => {
    //     res.render("shop/product-detail", {
    //       product: product,
    //       pageTitle: product?.title,
    //       path: "/products",
    //     });
    //   })
    //   .catch((err: Error) => {
    //     console.log(err);
    //   });
};
export const getIndex = (req, res, next) => {
    Product.fetchAll()
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
    var _a;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.getCart().then((cart) => {
        return cart
            .getProducts()
            .then((products) => {
            res.render("shop/cart", {
                path: "/cart",
                pageTitle: "Your Cart",
                products: products,
            });
        })
            .catch((err) => { });
    }).catch((err) => {
        console.log(err);
    });
};
export const postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    // req.user
    //   ?.getCart()
    //   .then((cart: any) => {
    //     fetchedCart = cart;
    //     return cart.getProducts({ where: { id: prodId } });
    //   })
    //   .then((products: ProductType[]) => {
    //     let product: any;
    //     if (products.length > 0) {
    //       product = products[0];
    //     }
    //     if (product) {
    //       newQuantity = product.cartItem.quantity + 1;
    //       return product;
    //     }
    //     return Product.findByPk(prodId);
    //   })
    //   .then((product: any) => {
    //     return fetchedCart.addProduct(product, {
    //       through: { quantity: newQuantity },
    //     });
    //   })
    //   .then(() => {
    //     res.redirect("/cart");
    //   })
    //   .catch((err: Error) => {
    //     console.log(err);
    //   });
};
export const deleteCartDeleteProduct = (req, res, next) => {
    var _a;
    const prodId = req.body.productId;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.getCart().then((cart) => {
        return cart.getProducts({ where: { id: prodId } });
    }).then((products) => {
        let product;
        product = products[0];
        return product.cartItem.destroy();
    }).then(() => {
        res.redirect("/cart");
    }).catch((err) => { });
};
export const getOrders = (req, res, next) => {
    var _a;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.getOrders({ include: ["products"] }).then((orders) => {
        res.render("shop/orders", {
            orders: orders,
            pageTitle: "Your Orders",
            path: "/orders",
        });
    }).catch((err) => {
        console.log(err);
    });
};
export const postOrder = (req, res, next) => {
    var _a;
    let fetchedCart;
    let duplicatedProducts;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.getCart().then((cart) => {
        fetchedCart = cart;
        return cart.getProducts();
    }).then((products) => {
        var _a;
        duplicatedProducts = products;
        return (_a = req.user) === null || _a === void 0 ? void 0 : _a.createOrder();
    }).then((order) => {
        return order.addProducts(duplicatedProducts.map((product) => {
            product.orderItem = { quantity: product.cartItem.quantity };
            return product;
        }));
    }).then((result) => {
        fetchedCart.setProducts(null);
    }).then((result) => {
        res.redirect("/orders");
    }).catch((err) => {
        console.log(err);
    });
};
//# sourceMappingURL=shop.js.map