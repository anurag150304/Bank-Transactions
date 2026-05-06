import { Router } from "express";
import { asyncWrap } from "../utils/asyncWrap.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { createAccount, getAccount } from "../controllers/account.controller.js";

const router: Router = Router();
router.post("/create", asyncWrap(authUser), asyncWrap(createAccount));
router.get("/profile", asyncWrap(authUser), asyncWrap(getAccount));
export default router;
