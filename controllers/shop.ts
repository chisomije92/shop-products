import { Request, Response, NextFunction } from "express";
import { ObjectId, WithId } from "mongodb";

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
    .then(() => {
      res.redirect("/cart");
    });
};

export const deleteCartProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  req.user
    ?.deleteItemFromCart(new ObjectId(prodId))
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
  req.user
    ?.getOrders()
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
  req.user?.addOrder().then(() => {
    res.redirect("/orders");
  });
};
