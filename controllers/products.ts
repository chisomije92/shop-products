import { Request, Response, NextFunction } from "express";

interface ProductType {
  title: string;
}

export const products: ProductType[] = [];

export const getAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
  });
};

export const postAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  products.push({ title: req.body.title });
  res.redirect("/");
};

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(products);
  res.render("shop", { products, pageTitle: "Shop", path: "/" });
};
