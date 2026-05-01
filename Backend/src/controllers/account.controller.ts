import type { Request, Response } from "express";
import accountModel from "../models/account.model.js";
import { errHandler } from "../types/errorHandler.js";

/**
 * Creates a new account for the authenticated user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @throws {errHandler} If the account already exists.
 */
export async function createAccount(req: Request, res: Response) {
    const { currency } = req.body;
    const user = req.user;

    const alreadyCreated: boolean = Boolean(await accountModel.findOne({ userId: user._id }));
    if (alreadyCreated) throw new errHandler(409, "Account already created for this user");

    const newAccount = await accountModel.create({
        userId: user._id,
        ...(currency && { currency }),
    });

    return res.status(201).json({
        status: true,
        message: "Account created sucessfully",
        data: {
            id: newAccount.id,
            accHolder: user.name,
            status: newAccount.status,
            currency: newAccount.currency
        }
    });
}

export async function getAccount(req: Request, res: Response) {
    const user = req.user;
    console.log(user);

    const account = await accountModel.findOne({ userId: user._id }).populate<{ userId: { name: string } }>("userId", "name");
    if (!account) throw new errHandler(404, "Account not found for the user!");

    const currentBalance = await account.getBalance();

    return res.status(200).json({
        status: true,
        message: "Account details fetched successfully",
        data: {
            accId: account.id,
            accHolder: account.userId.name,
            status: account.status,
            balance: currentBalance,
            currency: account.currency
        }
    });
}
