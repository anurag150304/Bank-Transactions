import { Router } from "express";
import { asyncWrap } from "../utils/asyncWrap.js";
import { signup, signin, profile, signout } from "../controllers/user.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";


const router: Router = Router();

router.post("/signup", asyncWrap(signup));
router.post("/signin", asyncWrap(signin));
router.get("/profile", asyncWrap(authUser), asyncWrap(profile));
router.get("/signout", asyncWrap(authUser), asyncWrap(signout));

export default router;