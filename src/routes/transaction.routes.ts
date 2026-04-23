import { Router } from "express";
import { asyncWrap } from "../utils/asyncWrap.js";
import { authSystemUser, authUser } from "../middlewares/auth.middleware.js";
import { createTransaction } from "../controllers/transaction.controller.js";

const router: Router = Router();
router.post("/create", asyncWrap(authUser), asyncWrap(createTransaction));
// router.post("/transfer-funds", asyncWrap(authSystemUser), asyncWrap());
export default router;