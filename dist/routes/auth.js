import express from "express";
import { getLogin } from "../controllers/auth.js";
const router = express.Router();
router.get("/login", getLogin);
export default router;
//# sourceMappingURL=auth.js.map