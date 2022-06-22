import express from "express";
import { getLogin, getReset, getSignup, postLogin, postLogout, postSignup, } from "../controllers/auth.js";
const router = express.Router();
router.get("/login", getLogin);
router.get("/signup", getSignup);
router.post("/login", postLogin);
router.post("/logout", postLogout);
router.post("/signup", postSignup);
router.get("/reset", getReset);
export default router;
//# sourceMappingURL=auth.js.map