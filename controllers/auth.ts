import { Request, Response, NextFunction } from "express";

export const getLogin = (req: Request, res: Response, next: NextFunction) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: false,
  });
};

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  req.isLoggedIn = true;
  res.redirect("/");
};
