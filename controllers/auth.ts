import { Request, Response, NextFunction } from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";
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
          return transporter
            .sendMail({
              from: "chisomije92@gmail.com",
              to: email,
              subject: "Signup succeeded",
              html: "<h1>You successfully signed up!</h1>",
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
    })
    .catch((err) => console.log(err));
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
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({
      email: req.body.email,
    })
      .then((user) => {
        if (!user) {
          req.flash("error", "Email not found!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save();
        return user;
      })
      .then((result) => {
        res.redirect("/");
        return transporter.sendMail({
          from: "chisomije92@gmail.com",
          to: req.body.email,
          subject: "Password Reset",
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>  
          `,
        });
      })
      .catch((err) => console.log(err));
  });
};
