import express from "express";
import { getLogin, getNewPassword, getReset, getSignup, postLogin, postLogout, postNewPassword, postReset, postSignup, } from "../controllers/auth.js";
const router = express.Router();
router.get("/login", getLogin);
router.get("/signup", getSignup);
router.post("/login", postLogin);
router.post("/logout", postLogout);
router.post("/signup", postSignup);
router.get("/reset", getReset);
router.post("/reset", postReset);
router.get("/reset/:token", getNewPassword);
router.post("/new-password", postNewPassword);
export default router;
//# sourceMappingURL=auth.js.map