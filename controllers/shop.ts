import { Request, Response, NextFunction } from "express";
import { Cart, CartType } from "../models/cart.js";
import { Product, ProductType } from "../models/product.js";

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const products = Product.fetchAll()
    .then(([row]) => {
      res.render("shop/product-list", {
        products: row,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {});
};

export const getProduct = (req: Request, res: Response, next: NextFunction) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(([row]) => {
    res.render("shop/product-detail", {
      product: row[0],
      pageTitle: row[0].title,
      path: "/products",
    });
  });
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  const products = Product.fetchAll()
    .then(([rows]) => {
      res.render("shop/index", {
        pageTitle: "Shop",
        path: "/",
        products: rows,
      });
    })
    .catch();
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
