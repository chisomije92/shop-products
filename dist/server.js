import http from "http";
import express from "express";
const app = express();
app.use((req, res, next) => {
    console.log("Middleware 1");
    next();
});
app.use((req, res, next) => {
    console.log("Middleware 2");
});
const server = http.createServer(app);
server.listen(3000);
//# sourceMappingURL=server.js.map