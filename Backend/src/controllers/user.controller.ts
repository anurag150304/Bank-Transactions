import type { Request, Response } from "express";
import { errHandler } from "../types/errorHandler.js";
import userModel from "../models/user.model.js"
import { generateToken } from "../utils/common.utils.js";

/**
 * Registers a new user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @throws {errHandler} If required fields are missing or email already exists.
 */
export async function signup(req: Request, res: Response) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        throw new errHandler(409, "Required fields are missing!");
    }

    const alreadyExists = await userModel.findOne({ email });
    if (alreadyExists) throw new errHandler(401, "Email already exists!");

    const newUser = await userModel.create({ name, email, password });
    return res.status(201).json({
        status: true,
        message: "User created sucessfully",
        data: { name: newUser.name, email: newUser.email }
    });
}

/**
 * Authenticates a user and generates a token.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @throws {errHandler} If credentials are invalid.
 */
export async function signin(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errHandler(409, "Required fields are missing!");
    }

    const alreadyExists = await userModel.findOne({ email }).select("+password");
    if (!alreadyExists) throw new errHandler(404, "No user found with this email, create new one");

    const isPassMatched: boolean = await alreadyExists.comparePassword(password);
    if (!isPassMatched) throw new errHandler(401, "Invalid credentials!");

    const token = generateToken(alreadyExists.email);
    res.cookie("auth_token", token);
    return res.status(200).json({
        status: true,
        message: "Logged in successfully",
        data: null
    });
}

/**
 * Retrieves the profile of the authenticated user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export async function profile(req: Request, res: Response) {
    res.status(200).json({
        status: true,
        message: "User profile",
        data: { name: req.user?.name, email: req.user?.email }
    });
}

export async function signout(_: Request, res: Response) {
    res.clearCookie("auth_token");
    res.status(200).json({
        status: true,
        message: "Logged out sucessfully",
        data: null
    })
}