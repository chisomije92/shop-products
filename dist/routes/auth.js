import express from "express";
import { getLogin, getNewPassword, getReset, getSignup, postLogin, postLogout, postNewPassword, postReset, postSignup, } from "../controllers/auth.js";
import { check, body } from "express-validator";
import User from "../models/user.js";
const router = express.Router();
router.get("/login", getLogin);
router.get("/signup", getSignup);
router.post("/login", [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email address.")
        .normalizeEmail(),
    body("password", "Password has to be valid.")
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
], postLogin);
router.post("/logout", postLogout);
router.post("/signup", [
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject("Email already exists");
            }
        });
    }),
    body("password", "Password must be at least 5 characters and must be numbers and text")
        .isLength({ min: 5 })
        .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords don't match!");
        }
        return true;
    }),
], postSignup);
router.get("/reset", getReset);
router.post("/reset", postReset);
router.get("/reset/:token", getNewPassword);
router.post("/new-password", postNewPassword);
export default router;
//# sourceMappingURL=auth.js.map