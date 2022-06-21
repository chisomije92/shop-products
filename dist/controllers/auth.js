import User from "../models/user.js";
import bcrypt from "bcryptjs";
export const getLogin = (req, res, next) => {
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        errorMessage: req.flash("error"),
    });
};
export const postLogin = (req, res, next) => {
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
            }
            else {
                return res.redirect("/login");
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
export const getSignup = (req, res, next) => {
    res.render("auth/signup", {
        pageTitle: "Signup",
        path: "/signup",
        isAuthenticated: false,
    });
};
export const postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;
    User.findOne({ email: email })
        .then((userDoc) => {
        if (userDoc) {
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
//# sourceMappingURL=auth.js.map