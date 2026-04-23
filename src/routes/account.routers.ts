import { Router } from "express";
import { asyncWrap } from "../utils/asyncWrap.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { createAccount } from "../controllers/account.controller.js";

const router: Router = Router();
router.post("/create", asyncWrap(authUser), asyncWrap(createAccount));
export default router;