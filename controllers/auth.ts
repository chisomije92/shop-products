import { Request, Response, NextFunction } from "express";
import User from "../models/user.js";

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
