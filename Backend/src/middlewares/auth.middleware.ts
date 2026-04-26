import type { Request, Response, NextFunction } from "express";
import { errHandler } from "../types/errorHandler.js";
import { decodeToken } from "../utils/common.utils.js";
import userModel from "../models/user.model.js";

/**
 * - Middleware to authenticate user using JWT token from cookies or Authorization header.
 * - If token is valid, attaches the user object to the request and calls next().
 * - Otherwise, throws an appropriate error.
 */
export async function authUser(req: Request, _: Response, next: NextFunction) {
    const token = String(req.cookies?.auth_token)?.trim() ||
        req.headers.authorization?.split(" ")[1]?.trim() || "";
    if (!token) throw new errHandler(401, "Auth token not found!")

    let decodedEmail: { email: string };

    try {
        decodedEmail = decodeToken<typeof decodedEmail>(token);
        if (!decodedEmail) throw new errHandler(401, "Invalid auth token!");
    } catch (err) {
        throw err;
    }

    const user = await userModel.findOne({ email: decodedEmail.email });
    if (!user) throw new errHandler(404, "User not found!");

    req.user = user;
    return next();
}

export async function authSystemUser(req: Request, _: Response, next: NextFunction) {
    const token = String(req.cookies?.auth_token)?.trim() ||
        req.headers.authorization?.split(" ")[1]?.trim() || "";
    if (!token) throw new errHandler(401, "Auth token not found!");

    let decodedEmail: { email: string };

    try {
        decodedEmail = decodeToken<typeof decodedEmail>(token);
        if (!decodedEmail) throw new errHandler(401, "Invalid auth token!");
    } catch (err) {
        throw err;
    }

    const user = await userModel.findOne({ email: decodedEmail.email });
    if (!user) throw new errHandler(404, "User not found!");
    if (!user.systemUser) throw new errHandler(403, "Access denied! System user only resource!");

    req.user = user;
    return next();
}
