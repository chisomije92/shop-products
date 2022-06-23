import User from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";
import user from "../models/user.js";
import { validationResult } from "express-validator";
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
export const postLogin = (req, res, next) => {
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
    User.findOne({ email: email })
        .then((user) => {
        if (!user) {
            return res.status(422).render("auth/login", {
                pageTitle: "Login",
                path: "/login",
                errorMessage: "Invalid email or password",
                oldInput: {
                    email: email,
                    password: password,
                },
                validationErrors: [],
            });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                req.session.save(() => {
                    return res.redirect("/");
                });
            }
            else {
                return res.status(422).render("auth/login", {
                    pageTitle: "Login",
                    path: "/login",
                    errorMessage: "Invalid email or password",
                    oldInput: {
                        email: email,
                        password: password,
                    },
                    validationErrors: [],
                });
            }
        });
    })
        .catch((err) => console.log(err));
};
export const postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};
export const postSignup = (req, res, next) => {
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
export const getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    }).then((user) => {
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
};
export const postNewPassword = (req, res, next) => {
    let resetUser;
    const newPassword = req.body.password;
    const { userId, passwordToken } = req.body;
    user
        .findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
    })
        .then((user) => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
        .then((hashedPassword) => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
        .then((result) => {
        res.redirect("/login");
    })
        .catch((err) => console.log(err));
};
//# sourceMappingURL=auth.js.map