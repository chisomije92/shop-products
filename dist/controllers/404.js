export const get404Page = (req, res, next) => {
    res.status(404).render("404", { pageTitle: "Page not found", path: "Error" });
};
//# sourceMappingURL=404.js.map