import { Request, Response, NextFunction } from "express";
import { Cart, CartType } from "../models/cart.js";
import Product, { ProductType } from "../models/product.js";

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Product.findAll()
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
        pageTitle: product?.title,
        path: "/products",
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  Product.findAll()
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

export const postCart = (req: Request, res: Response, next: NextFunction) => {
  const prodId: string = req.body.productId;
  // Product.findById(prodId, (product: ProductType) => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect("/cart");
};

export const deleteCartDeleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  // Product.findById(prodId, (product: ProductType) => {
  //   Cart.deleteProduct(prodId, product.price);
  //   res.redirect("/cart");
  // });
};

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
  // const products = Product.fetchAll((products: ProductType[]) => {
  //   res.render("shop/orders", {
  //     products,
  //     pageTitle: "Your Orders",
  //     path: "/orders",
  //   });
  // });
};

export const getCheckout = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const products = Product.fetchAll((products: ProductType[]) => {
  //   res.render("shop/checkout", {
  //     products,
  //     pageTitle: "Checkout",
  //     path: "/checkout",
  //   });
  // });
};
