import { Request, Response, NextFunction } from "express";
import Product from "../models/product.js";

export const getAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
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
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });

  product
    .save()
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err: Error) => {
      console.log(err);
    });
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
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err: Error) => {
      console.log(err);
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

  Product.findById(prodId)
    .then((product) => {
      product!.title = updatedTitle;
      product!.price = updatedPrice;
      product!.description = updatedDescription;
      product!.imageUrl = updatedImageUrl;
      return product!.save();
    })
    .then(() => {
      res.redirect("/admin/products");
    });
  //     product
  //       .update({
  //         title: updatedTitle,
  //         price: updatedPrice,
  //         imageUrl: updatedImageUrl,
  //         description: updatedDescription,
  //       })
  //       .then((result) => {
  //         res.redirect("/admin/products");
  //       });
  //   })
  //   .catch((err: Error) => {
  //     console.log(err);
  //   });
};

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Product.find()
    // .select("title price -_id") // this is to select data to be returned. N.B. -_id is to exclude the id from the data
    // .populate("userId") // this is to populate the userId field with the user details
    .then((products) => {
      res.render("admin/products", {
        products: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const postDeleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  //   Product.destroy({
  //     where: {
  //       id: prodId,
  //     },
  //   }).then(() => {
  //     res.redirect("/admin/products");
  //   });

  Product.findByIdAndRemove(prodId)
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
