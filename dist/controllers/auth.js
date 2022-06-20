export const getLogin = (req, res, next) => {
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: false,
    });
};
export const postLogin = (req, res, next) => {
    req.isLoggedIn = true;
    res.redirect("/");
};
//# sourceMappingURL=auth.js.map