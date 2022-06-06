import { Request, Response, NextFunction } from "express";
import { Cart } from "../models/cart.js";
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
    res.render("shop/product-detail", {
      product,
      pageTitle: "Product Detail",
      path: "/products",
    });
  });
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

export const postCart = (req: Request, res: Response, next: NextFunction) => {
  const prodId: string = req.body.productId;
  Product.findById(prodId, (product: ProductType) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect("/cart");
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
