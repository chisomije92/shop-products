import express from "express";
import bodyParser from "body-parser";
import adminRoute from "./routes/admin.js";
import shopRoute from "./routes/shop.js";
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/admin", adminRoute);
app.use(shopRoute);
app.use((req, res, next) => {
    res.status(404).send("<h1>Page not found</h1>");
});
app.listen(3000);
//# sourceMappingURL=server.js.map