import { Request, Response, NextFunction } from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const getLogin = (req: Request, res: Response, next: NextFunction) => {
  const isLoggedIn = req.session.isLoggedIn;
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: isLoggedIn,
  });
};

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  User.findById("62a89fa640132445849b1e25")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

export const postLogout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

export const getSignup = (req: Request, res: Response, next: NextFunction) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    isAuthenticated: false,
  });
};

export const postSignup = (req: Request, res: Response, next: NextFunction) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const confirmedPassword: string = req.body.confirmedPassword;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/signup");
      }

      return bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] },
        });
        return user.save().then((result) => {
          res.redirect("/login");
        });
      });
    })
    .catch((err) => console.log(err));
};
