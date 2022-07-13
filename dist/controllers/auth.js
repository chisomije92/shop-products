var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
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
export const getLogin = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
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
export const getSignup = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
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
export const postLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield User.findOne({ email: email });
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
        const isEqual = yield bcrypt.compare(password, user.password);
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
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
export const postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};
export const postSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const userDoc = yield User.findOne({ email: email });
        if (userDoc) {
            req.flash("error", "User already exists. Use another email.");
            return res.redirect("/signup");
        }
        const hashedPassword = yield bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
        });
        yield user.save();
        res.redirect("/login");
        yield transporter.sendMail({
            from: "chisomije92@gmail.com",
            to: email,
            subject: "Signup succeeded",
            html: "<h1>You successfully signed up!</h1>",
        });
    }
    catch (err) {
        return next(new CustomError(err.message, 500));
    }
});
export const getReset = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render("auth/reset", {
        pageTitle: "Reset Password",
        path: "/reset",
        errorMessage: message,
    });
};
export const postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        try {
            const user = yield User.findOne({
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
        }
        catch (err) {
            next(new CustomError(err.message, 500));
        }
    }));
};
export const getNewPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    const user = yield User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    });
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render("auth/new-password", {
        pageTitle: "New Password",
        path: "/new-password",
        errorMessage: message,
        userId: user === null || user === void 0 ? void 0 : user._id.toString(),
        passwordToken: token,
    });
});
export const postNewPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newPassword = req.body.password;
        const { userId, passwordToken } = req.body;
        const user = yield User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId,
        });
        yield bcrypt.hash(newPassword, 12);
        if (!user) {
            req.flash("error", "Invalid token");
            return res.redirect("/reset");
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        yield user.save();
        res.redirect("/login");
    }
    catch (err) {
        next(new CustomError(err.message, 500));
    }
});
//# sourceMappingURL=auth.js.map