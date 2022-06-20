export const getLogin = (req, res, next) => {
    const isLoggedIn = req.session.isLoggedIn;
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: isLoggedIn,
    });
};
export const postLogin = (req, res, next) => {
    req.session.isLoggedIn = true;
    res.redirect("/");
};
//# sourceMappingURL=auth.js.map