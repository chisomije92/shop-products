import { NextFunction, Request, Response } from "express";

export const get500Page = (req: Request, res: Response, next: NextFunction) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
};
