import { Request, Response, NextFunction } from "express";

export const getLogin = (req: Request, res: Response, next: NextFunction) => {
  const isLoggedIn = req.session.isLoggedIn;
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: isLoggedIn,
  });
};

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  req.session.isLoggedIn = true;
  res.redirect("/");
};
