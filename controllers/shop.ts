import { Request, Response, NextFunction } from "express";

import Product, { ProductType } from "../models/product.js";
import User from "../models/user.js";
import Order from "../models/order.js";
export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: false,
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
        isAuthenticated: false,
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: false,
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getCart = (req: Request, res: Response, next: NextFunction) => {
  // User.findById(req.user?._id)
  req.user
    ?.populate("cart.items.productId")
    .then((products: any) => {
      const items = products?.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: items,
        isAuthenticated: false,
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
    ?.deleteItemFromCart(prodId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
  Order.find({ "user.userId": req.user?._id })
    .then((orders) => {
      res.render("shop/orders", {
        orders: orders,
        pageTitle: "Your Orders",
        path: "/orders",
        isAuthenticated: false,
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const postOrder = (req: Request, res: Response, next: NextFunction) => {
  req.user
    ?.populate("cart.items.productId")
    .then((user: any) => {
      const products = user?.cart.items.map((i: any) => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc },
        };
      });
      const order = new Order({
        user: {
          name: req.user?.name,
          userId: req.user?._id,
        },
        products: products,
      });
      return order.save();
    })
    .then(() => {
      req.user?.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
