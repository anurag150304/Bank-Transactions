import cors from "cors";

import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/user.routes.js";
import accountRoutes from "./routes/account.routers.js";
import e, { type Application, type NextFunction, type Request, type Response } from "express";
import type { errHandler } from "./types/errorHandler.js";

const app: Application = e();

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(morgan("dev"));
app.use(e.json());
app.use(cookieParser());
app.use(e.urlencoded({ extended: true }));

app.get("/api", (_: Request, res: Response) => {
    return res.status(200).json({ status: true, message: "Welcomre to Bank Transactions API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);

/**
 * Global error handler middleware.
 * @param {errHandler} err - Error object.
 * @param {Request} _ - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
app.use((err: errHandler, _: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) next(err);

    const { message = "Internal server error", status = 500 } = err;
    res.status(status).json({ status: false, data: null, message });
});

export default app;
