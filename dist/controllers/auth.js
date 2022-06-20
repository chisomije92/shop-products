export const getLogin = (req, res, next) => {
    var _a;
    const isLoggedIn = ((_a = req.get("Cookie")) === null || _a === void 0 ? void 0 : _a.split("=")[1]) === "true";
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: isLoggedIn,
    });
};
export const postLogin = (req, res, next) => {
    res.setHeader("set-cookie", "loggedIn=true");
    res.redirect("/");
};
//# sourceMappingURL=auth.js.map