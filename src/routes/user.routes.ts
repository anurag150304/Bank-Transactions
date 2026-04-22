import { Router } from "express";
import { asyncWrap } from "../utils/asyncWrap.js";
import { signup, signin, profile, signout } from "../controllers/user.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

/**
 * Express router for user-related routes.
 */
const router: Router = Router();

/**
 * Route to register a new user.
 * @route POST /signup
 */
router.post("/signup", asyncWrap(signup));

/**
 * Route to authenticate a user.
 * @route POST /signin
 */
router.post("/signin", asyncWrap(signin));

/**
 * Route to get the profile of the authenticated user.
 * @route GET /profile
 */
router.get("/profile", asyncWrap(authUser), asyncWrap(profile));

/**
 * Route to sign out the authenticated user.
 * @route GET /signout
 */
router.get("/signout", asyncWrap(authUser), asyncWrap(signout));

export default router;