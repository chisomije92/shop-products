import http from "http";
import { requestHandler } from "./routes.js";
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
