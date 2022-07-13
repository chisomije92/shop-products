import { Request, Response, NextFunction } from "express";
import Product from "../models/product.js";
import { validationResult } from "express-validator";
import { deleteFile } from "../utils/file.js";
import { CustomError } from "../utils/custom-err.js";

export const getAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

export const postAddProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const title: string = req.body.title;
  const image: Express.Multer.File | undefined = req.file;
  const price: number = req.body.price;
  const description: string = req.body.description;

  if (!image) {
    return res.status(400).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Invalid image file",
      validationErrors: [],
    });
  }

  const imageUrl = image.path;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  try {
    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.user,
    });

    await product.save();
    res.redirect("/admin/products");
  } catch (err: any) {
    next(new CustomError(err.message));
  }
};

export const getEditProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);

    if (!product) {
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      hasError: false,
      errorMessage: null,
      product: product,
      validationErrors: [],
    });
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const postEditProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  const updatedTitle: string = req.body.title;
  const updatedPrice: number = req.body.price;
  const updatedImage: Express.Multer.File | undefined = req.file;
  const updatedDescription: string = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const product = await Product.findById(prodId);

  if (product?.userId.toString() !== req.user?.id.toString()) {
    return res.redirect("/");
  } else {
    product!.title = updatedTitle;
    product!.price = updatedPrice;
    product!.description = updatedDescription;
    if (updatedImage) {
      deleteFile(product!.imageUrl);
      product!.imageUrl = updatedImage.path;
    }
    return product!.save().then(() => {
      res.redirect("/admin/products");
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find({
      userId: req.user?.id,
    });

    res.render("admin/products", {
      products: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.params.productId;
  try {
    const product = await Product.findById(prodId);

    if (!product) {
      return next(new Error("Product not found"));
    }

    deleteFile(product.imageUrl);
    await product.deleteOne({
      _id: prodId,
      userId: req.user?.id,
    });

    res.status(200).json({
      message: "Success!",
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Deleting product failed",
    });
  }
};
