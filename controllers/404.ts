import { NextFunction, Request, Response } from "express";

export const get404Page = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).render("404", { pageTitle: "Page not found", path: "404" });
};
