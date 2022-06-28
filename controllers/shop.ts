import { Request, Response, NextFunction } from "express";
import path from "path";
import PDFDocument from "pdfkit";
import fs from "fs";
import Product, { ProductType } from "../models/product.js";
import User, { UserType } from "../models/user.js";
import Order from "../models/order.js";

const ITEMS_PER_PAGE = 2;

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
      });
    })
    .catch((err: any) => {
      const error = new Error(err);
      //@ts-ignore
      error.httpStatusCode = 500;
      return next(error);
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
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err: any) => {
      const error = new Error(err);
      //@ts-ignore
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  const page: any = req.query.page || 1;
  Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .find()
    .then((products) => {
      console.log(products);
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err: any) => {
      console.log(err);
      const error = new Error(err);
      //@ts-ignore
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const getCart = (req: Request, res: Response, next: NextFunction) => {
  // User.findById(req.session.user?._id)
  req.user
    ?.populate("cart.items.productId")
    .then((user: UserType) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err: Error) => console.log(err));
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
    .catch((err: any) => {
      {
        const error = new Error(err);
        //@ts-ignore
        error.httpStatusCode = 500;
        return next(error);
      }
    });
};

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
  Order.find({ "user.userId": req.user?._id })
    .then((orders) => {
      res.render("shop/orders", {
        orders: orders,
        pageTitle: "Your Orders",
        path: "/orders",
      });
    })
    .catch((err: any) => {
      const error = new Error(err);
      //@ts-ignore
      error.httpStatusCode = 500;
      return next(error);
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
          email: req.user?.email,
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
    .catch((err: any) => {
      const error = new Error(err);
      //@ts-ignore
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const getInvoice = (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.user?._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));

      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Invoice", { underline: true });
      pdfDoc.text("--------------------");
      let totalPrice = 0;
      order.products.forEach((product: any) => {
        totalPrice += product.quantity * product.product.price;
        pdfDoc
          .fontSize(16)
          .text(
            product.product.title +
              " - " +
              product.quantity +
              " x " +
              product.product.price
          );
      });
      pdfDoc.text("--------------------");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
      pdfDoc.end();
    })
    .catch((err: any) => {
      return next(err);
    });
};
