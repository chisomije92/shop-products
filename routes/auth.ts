import express from "express";
import { getLogin, postLogin, postLogout } from "../controllers/auth.js";

const router = express.Router();

router.get("/login", getLogin);

router.post("/login", postLogin);

router.post("/logout", postLogout);
export default router;
