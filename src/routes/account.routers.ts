import { Router } from "express";
import { asyncWrap } from "../utils/asyncWrap.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { createAccount } from "../controllers/account.controller.js";

/**
 * Express router for account-related routes.
 */
const router: Router = Router();

/**
 * Route to create a new account.
 * @route POST /create
 */
router.post("/create", asyncWrap(authUser), asyncWrap(createAccount));
export default router;