export const get500Page = (req, res, next) => {
    res.status(500).render("500", {
        pageTitle: "Error",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn,
    });
};
//# sourceMappingURL=500.js.map