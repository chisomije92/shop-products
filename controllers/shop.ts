import { Request, Response, NextFunction } from "express";
import { Product, ProductType } from "../models/product.js";

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const products = Product.fetchAll((products: ProductType[]) => {
    res.render("shop/product-list", {
      products,
      pageTitle: "All Products",
      path: "/products",
    });
  });
};

export const getProduct = (req: Request, res: Response, next: NextFunction) => {
  const prodId = req.params.productId;
  Product.findById(prodId, (product: ProductType) => {
    console.log(product);
  });
  res.redirect("/");
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  const products = Product.fetchAll((products: ProductType[]) => {
    res.render("shop/index", { products, pageTitle: "Shop", path: "/" });
  });
};

export const getCart = (req: Request, res: Response, next: NextFunction) => {
  const products = Product.fetchAll((products: ProductType[]) => {
    res.render("shop/cart", {
      products,
      pageTitle: "Your Cart",
      path: "/cart",
    });
  });
};

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
  const products = Product.fetchAll((products: ProductType[]) => {
    res.render("shop/orders", {
      products,
      pageTitle: "Your Orders",
      path: "/orders",
    });
  });
};

export const getCheckout = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const products = Product.fetchAll((products: ProductType[]) => {
    res.render("shop/checkout", {
      products,
      pageTitle: "Checkout",
      path: "/checkout",
    });
  });
};
