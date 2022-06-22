import express from "express";
import {
  getLogin,
  getReset,
  getSignup,
  postLogin,
  postLogout,
  postReset,
  postSignup,
} from "../controllers/auth.js";

const router = express.Router();

router.get("/login", getLogin);

router.get("/signup", getSignup);

router.post("/login", postLogin);

router.post("/logout", postLogout);

router.post("/signup", postSignup);

router.get("/reset", getReset);

router.post("/reset", postReset);

export default router;
