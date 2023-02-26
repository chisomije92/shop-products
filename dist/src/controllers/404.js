export const get404Page = (req, res, next) => {
    res.status(404).render("404", {
        pageTitle: "Page not found",
        path: "404",
        isAuthenticated: req.session.isLoggedIn,
    });
};
//# sourceMappingURL=404.js.map