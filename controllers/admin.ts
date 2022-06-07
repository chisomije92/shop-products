import { Request, Response, NextFunction } from "express";
import { Product, ProductType } from "../models/product.js";

export const getAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

export const postAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const title: string = req.body.title;
  const imageUrl: string = req.body.imageUrl;
  const price: number = req.body.price;
  const description: string = req.body.description;
  const product = new Product(title, imageUrl, description, price);
  product.save();
  res.redirect("/");
  console.log("postAddProduct");
};

export const getEditProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId, (product: ProductType) => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product,
    });
  });
};

export const postEditProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  const updatedTitle: string = req.body.title;
  const updatedPrice: number = req.body.price;
  const updatedImageUrl: string = req.body.imageUrl;
  const updatedDescription: string = req.body.description;
  const updatedProduct = new Product(
    updatedTitle,
    updatedImageUrl,
    updatedDescription,
    updatedPrice,
    prodId
  );
  updatedProduct.save();
  res.redirect("/admin/products");
};

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const products = Product.fetchAll((products: ProductType[]) => {
    res.render("admin/products", {
      products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  });
};

export const postDeleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  Product.deleteById(prodId);
  res.redirect("/admin/products");
};
