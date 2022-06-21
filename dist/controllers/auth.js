import User from "../models/user.js";
export const getLogin = (req, res, next) => {
    const isLoggedIn = req.session.isLoggedIn;
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: isLoggedIn,
    });
};
export const postLogin = (req, res, next) => {
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
export const postSignup = (req, res, next) => { };
//# sourceMappingURL=auth.js.map