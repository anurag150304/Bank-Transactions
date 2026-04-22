import type { Request, Response } from "express";
import { errHandler } from "../types/errorHandler.js";
import accModel from "../models/account.model.js";

export async function createTransaction(req: Request, res: Response) {
    const { fromAcc, toAcc, amount, idmpKey } = req.body;
    if (!fromAcc || !toAcc || !amount || !idmpKey) {
        throw new errHandler(409, "Required fields are missing!");
    }

    const fromAccInfo = await accModel.findById(fromAcc.id);
    const toAccInfo = await accModel.findById(toAcc.id);

    // both accounts should exist
    if (!fromAccInfo || !toAccInfo) {
        throw new errHandler(404, `${fromAccInfo ? "To" : "From"} account not found!`);
    }

    // from account should be owned by th authenticated user
    if (!fromAccInfo._id.equals(req.user._id)) {
        throw new errHandler(403, "Unauthorized to perform transaction from this account!");
    }


}