import { Request, Response, NextFunction } from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const getLogin = (req: Request, res: Response, next: NextFunction) => {
  let message: string[] | string | null = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
  });
};

export const getSignup = (req: Request, res: Response, next: NextFunction) => {
  let message: string[] | string | null = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    errorMessage: message,
  });
};

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save(() => {
            return res.redirect("/");
          });
        } else {
          return res.redirect("/login");
        }
      });
    })
    .catch((err) => console.log(err));
};

export const postLogout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

export const postSignup = (req: Request, res: Response, next: NextFunction) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const confirmedPassword: string = req.body.confirmedPassword;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "User already exists. Use another email.");
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
