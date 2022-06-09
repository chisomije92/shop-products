import { Request, Response, NextFunction } from "express";
import { CartItemModelType } from "../models/cart-item.js";
import { Cart, CartModelType } from "../models/cart.js";
import Product, { ProductType } from "../models/product.js";

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getProduct = (req: Request, res: Response, next: NextFunction) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then((products) => {
  //     res.render("shop/product-detail", {
  //       product: products[0],
  //       pageTitle: products[0]?.title,
  //       path: "/products",
  //     });
  //   })
  //   .catch((err: Error) => {
  //     console.log(err);
  //   });
  Product.findByPk(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product?.title,
        path: "/products",
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getCart = (req: Request, res: Response, next: NextFunction) => {
  req.user
    ?.getCart()
    .then((cart: any) => {
      return cart
        .getProducts()
        .then((products: ProductType[]) => {
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
          });
        })
        .catch((err: Error) => {});
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const postCart = (req: Request, res: Response, next: NextFunction) => {
  const prodId: string = req.body.productId;
  let fetchedCart: any;
  let newQuantity = 1;
  req.user
    ?.getCart()
    .then((cart: any) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products: ProductType[]) => {
      let product: any;

      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        newQuantity = product.cartItem.quantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then((product: any) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err: Error) => {
      console.log(err);
    });

  // Product.findById(prodId, (product: ProductType) => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect("/cart");
};

export const deleteCartDeleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: string = req.body.productId;
  // Product.findById(prodId, (product: ProductType) => {
  //   Cart.deleteProduct(prodId, product.price);
  //   res.redirect("/cart");
  // });
};

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
  // const products = Product.fetchAll((products: ProductType[]) => {
  //   res.render("shop/orders", {
  //     products,
  //     pageTitle: "Your Orders",
  //     path: "/orders",
  //   });
  // });
};

export const getCheckout = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const products = Product.fetchAll((products: ProductType[]) => {
  //   res.render("shop/checkout", {
  //     products,
  //     pageTitle: "Checkout",
  //     path: "/checkout",
  //   });
  // });
};
