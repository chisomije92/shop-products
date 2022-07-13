import { Request, Response, NextFunction } from "express";
import path from "path";
import PDFDocument from "pdfkit";
import fs from "fs";
import Product from "../models/product.js";
import { UserType } from "../models/user.js";
import Order from "../models/order.js";
import fetch from "node-fetch";
import { CustomError } from "../utils/custom-err.js";

const ITEMS_PER_PAGE = 2;

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let queryPage;
  if (req.query && req.query.page) {
    queryPage = +req.query.page;
  }
  const page: number = queryPage || 1;

  let totalItems: number;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then((products) => {
          res.render("shop/product-list", {
            products: products,
            pageTitle: "Products",
            path: "/products",
            totalItems: totalItems,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(numProducts / ITEMS_PER_PAGE),
            numProducts: numProducts,
          });
        });
    })
    .catch((err: Error) => {
      return next(new CustomError(err.message, 500));
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
    .catch((err: Error) => {
      return next(new CustomError(err.message, 500));
    });
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  let queryPage;
  if (req.query && req.query.page) {
    queryPage = +req.query.page;
  }
  const page: number = queryPage || 1;

  let totalItems: number;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then((products) => {
          res.render("shop/index", {
            products: products,
            pageTitle: "Shop",
            path: "/",
            totalItems: totalItems,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(numProducts / ITEMS_PER_PAGE),
            numProducts: numProducts,
          });
        });
    })
    .catch((err: Error) => {
      return next(new CustomError(err.message, 500));
    });
};

export const getCart = (req: Request, res: Response, next: NextFunction) => {
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
    .catch((err: Error) => next(new CustomError(err.message, 500)));
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
      {
        return next(new CustomError(err.message, 500));
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
    .catch((err: Error) => {
      return next(new CustomError(err.message, 500));
    });
};

export const getCheckout = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.user
    ?.populate("cart.items.productId")
    .then((user: UserType) => {
      const products = user.cart.items;

      let totalPrice = 0;
      products.forEach((product: any) => {
        totalPrice += product.quantity * product.productId.price;
      });
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalPrice: totalPrice,
        userEmail: user.email,
      });
    })
    .catch((err: Error) => {
      return next(new CustomError(err.message, 500));
    });
};

export const verifyOrder = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reference = req.query.reference;

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
      return fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          authorization: `bearer ${process.env.PAYSTACK_KEY}`,
        },
      });
    })
    .then((response: any) => {
      return response.json();
    })
    .then((data: any) => {
      res.status(200).json(data);
    })
    .catch((err: Error) => {
      return next(new CustomError(err.message, 500));
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
    .catch((err: Error) => {
      return next(new CustomError(err.message, 500));
    });
};
