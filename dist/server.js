import express from "express";
import bodyParser from "body-parser";
import adminRoute from "./routes/admin.js";
import shopRoute from "./routes/shop.js";
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(adminRoute);
app.use(shopRoute);
app.listen(3000);
//# sourceMappingURL=server.js.map