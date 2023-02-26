import { Request, Response, NextFunction } from "express";
import path from "path";
import PDFDocument from "pdfkit";
import fs from "fs";
import Product from "../models/product.js";
import Users from "../models/user.js";
import Order from "../models/order.js";
import { CustomError } from "../utils/custom-err.js";

const ITEMS_PER_PAGE = 2;

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let queryPage;
  if (req.query && req.query.page) {
    queryPage = +req.query.page;
  }
  const page: number = queryPage || 1;

  try {
    const totalDocuments = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/product-list", {
      products: products,
      pageTitle: "Products",
      path: "/products",
      totalItems: totalDocuments,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalDocuments,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalDocuments / ITEMS_PER_PAGE),
      numProducts: totalDocuments,
    });
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product?.title,
      path: "/products",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const getIndex = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let queryPage;
  if (req.query && req.query.page) {
    queryPage = +req.query.page;
  }
  const page: number = queryPage || 1;

  try {
    const totalDocuments = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render("shop/index", {
      products: products,
      pageTitle: "Shop",
      path: "/",
      totalItems: totalDocuments,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalDocuments,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalDocuments / ITEMS_PER_PAGE),
      numProducts: totalDocuments,
    });
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await req.user?.populate("cart.items.productId");
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products.cart.items,
    });
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const postCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  const product = await Product.findById(prodId);
  await req.user?.addToCart(product);

  res.redirect("/cart");
};

export const deleteCartProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  try {
    if (req.user) {
      const user = await Users.findById(req.user.id)
      const cartItems = user?.cart.items.slice().filter(item => {
        return item.productId.toString() !== prodId
      })

      await Users.findOneAndUpdate({ id: req.user.id }, {
        cart: {
          items: cartItems
        }
      })
      res.redirect("/cart");

    }
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ "user.userId": req.user?._id });
    res.render("shop/orders", {
      orders: orders,
      pageTitle: "Your Orders",
      path: "/orders",
    });
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const getCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await req.user?.populate("cart.items.productId");
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
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const verifyOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reference = req.query.reference;

  try {
    const user = await req.user?.populate("cart.items.productId");

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
    await order.save();

    req.user?.clearCart();

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          authorization: `bearer ${process.env.PAYSTACK_KEY}`,
        },
      }
    );

    const data = await response.json();

    res.status(200).json(data);
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const getInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new Error("No order found."));
    }
    if (order.user.userId.toString() !== req.user?._id.toString()) {
      return next(new Error("Unauthorized"));
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("src", "data", "invoices", invoiceName);
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
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};
