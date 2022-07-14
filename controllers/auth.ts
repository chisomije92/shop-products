import { Request, Response, NextFunction } from "express";
import User, { UserType } from "../models/user.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import user from "../models/user.js";
import { validationResult } from "express-validator";
import { CustomError } from "../utils/custom-err.js";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

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
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
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
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        errorMessage: "Invalid email or password!",
        oldInput: {
          email: email,
          password: password,
        },
        validationErrors: [],
      });
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        errorMessage: "Invalid email or password!",
        oldInput: {
          email: email,
          password: password,
        },
        validationErrors: [],
      });
    }
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save(() => {
      return res.redirect("/");
    });
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};

export const postLogout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items: [] },
    });
    await user.save();
    res.redirect("/login");
    await transporter.sendMail({
      from: "chisomije92@gmail.com",
      to: email,
      subject: "Signup succeeded",
      html: "<h1>You successfully signed up!</h1>",
    });
  } catch (err: any) {
    return next(new CustomError(err.message, 500));
  }
};

export const getReset = (req: Request, res: Response, next: NextFunction) => {
  let message: string[] | string | null = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: message,
  });
};

export const postReset = (req: Request, res: Response, next: NextFunction) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");

    try {
      const user = await User.findOne({
        email: req.body.email,
      });

      if (!user) {
        req.flash("error", "Email not found!");
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      user.save().then(() => {
        res.redirect("/");
        return transporter
          .sendMail({
            from: "chisomije92@gmail.com",
            to: req.body.email,
            subject: "Password Reset",
            html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="https://shop-products2.herokuapp.com/reset/${token}">link</a> to set a new password</p>  
          `,
          })
          .catch((err) => {
            console.log(err);
          });
      });
    } catch (err: any) {
      next(new CustomError(err.message, 500));
    }
  });
};

export const getNewPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.params.token;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });
  let message: string[] | string | null = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/new-password", {
    pageTitle: "New Password",
    path: "/new-password",
    errorMessage: message,
    userId: user?._id.toString(),
    passwordToken: token,
  });
};

export const postNewPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newPassword = req.body.password;
    const { userId, passwordToken } = req.body;
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    await bcrypt.hash(newPassword, 12);
    if (!user) {
      req.flash("error", "Invalid token");
      return res.redirect("/reset");
    }
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  } catch (err: any) {
    next(new CustomError(err.message, 500));
  }
};
