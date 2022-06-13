import { Request, Response, NextFunction } from "express";

import Product, { ProductType } from "../models/product.js";

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getProduct = (req: Request, res: Response, next: NextFunction) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product?.title,
        path: "/products",
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getCart = (req: Request, res: Response, next: NextFunction) => {
  req.user
    ?.getCart()
    .then((products: ProductType[]) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const postCart = (req: Request, res: Response, next: NextFunction) => {
  const prodId: string = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user?.addToCart(product);
    })
    .then((result) => {
      // console.log(result);
    });
  // let fetchedCart: any;
  // let newQuantity = 1;
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

export const deleteCartDeleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  req.user
    ?.getCart()
    .then((cart: any) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products: ProductType[]) => {
      let product: any;
      product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err: Error) => {});
};

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
  req.user
    ?.getOrders({ include: ["products"] })
    .then((orders: any) => {
      res.render("shop/orders", {
        orders: orders,
        pageTitle: "Your Orders",
        path: "/orders",
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const postOrder = (req: Request, res: Response, next: NextFunction) => {
  let fetchedCart: any;
  let duplicatedProducts: any;
  req.user
    ?.getCart()
    .then((cart: any) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products: ProductType[]) => {
      duplicatedProducts = products;
      return req.user?.createOrder();
    })
    .then((order: any) => {
      return order.addProducts(
        duplicatedProducts.map((product: any) => {
          product.orderItem = { quantity: product.cartItem.quantity };
          return product;
        })
      );
    })
    .then((result: any) => {
      fetchedCart.setProducts(null);
    })
    .then((result: any) => {
      res.redirect("/orders");
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
