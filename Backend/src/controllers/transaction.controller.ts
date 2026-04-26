import type { Request, Response } from "express";
import { errHandler } from "../types/errorHandler.js";
import accModel from "../models/account.model.js";
import transactionModel from "../models/transaction.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import ledgerModel from "../models/ledger.model.js";
import { idempontencyCheck } from "../utils/idempontencyCheck.util.js";

export async function createTransaction(req: Request, res: Response) {
    const { fromAccId, toAccId, amount, idmpKey } = req.body;
    if (!fromAccId || !toAccId || !amount || !idmpKey) {
        throw new errHandler(409, "Required fields are missing!");
    }

    // ensure both account ids are valid ObjectId
    if (!isValidObjectId(fromAccId)) throw new errHandler(409, "Invalid from account id!")
    if (!isValidObjectId(toAccId)) throw new errHandler(409, "Invalid to account id!");

    const fromAccInfo = await accModel.findById(fromAccId);
    const toAccInfo = await accModel.findById(toAccId);

    // both accounts should exist
    if (!fromAccInfo || !toAccInfo) {
        throw new errHandler(404, `${fromAccInfo ? "To" : "From"} account not found!`);
    }

    // both accounts should be active
    if (fromAccInfo.status !== "ACTIVE" && toAccInfo.status !== "ACTIVE") {
        throw new errHandler(403, "Both accounts are not active!");
    } else if (fromAccInfo.status !== "ACTIVE") {
        throw new errHandler(403, "Your account is not active!");
    } else if (toAccInfo.status !== "ACTIVE") {
        throw new errHandler(403, "Receiver's account is not active!");
    }

    // from account should be owned by th authenticated user
    if (!fromAccInfo._id.equals(req.user._id)) {
        throw new errHandler(403, "Unauthorized to perform transaction from this account!");
    }

    try {
        const idempCheck = await idempontencyCheck(idmpKey);
        if (idempCheck) {
            return res.status(idempCheck.status ? 200 : 409).json(idempCheck);
        }
    } catch (err) {
        throw err;
    }

    // if no transaction with the same idempotency key exists, create a new transaction with pending status
    // but firstly we have to check the balance of the from account, if it is less than the amount to be transferred, we will not create the transaction and return an error
    const fromAccBalance = await fromAccInfo.getBalance();
    if (fromAccBalance < amount) { // amount is request debit amount
        throw new errHandler(409, "Insufficient balance in the your account!");
    }

    // The session / transaction is required here to ensure that both the transaction creation and the ledger updates are atomic operations
    // Meaning either both of them succeed or both of them fail, maintaining the consistency of the data in case of any errors during the process.

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // creating the transaction with pending status
        const newTrans = new transactionModel({
            fromAccountId: fromAccInfo._id,
            toAccountId: toAccInfo._id,
            amount: Number(amount),
            idempotencyKey: String(idmpKey)
        });

        // creating the ledger entries from the from account (debit) and to the to account (credit)
        await ledgerModel.create([{
            accountId: fromAccInfo._id,
            amount: Number(amount),
            transactionId: newTrans._id,
            type: "DEBIT"
        }], { session });

        await ledgerModel.create([{
            accountId: toAccInfo._id,
            amount: Number(amount),
            transactionId: newTrans._id,
            type: "CREDIT"
        }], { session });

        // change the transaction status to completed after successful creation of the transaction and ledger entries
        newTrans.status = "COMPLETED";
        await newTrans.save({ session });

        // finnaly commit the transaction to make all the changes permanent in the database
        await session.commitTransaction();

        // return the response to the client
        return res.status(201).json({
            status: true,
            message: "Transaction created successfully and is being processed!",
            data: {
                id: newTrans._id,
                fromAcc: newTrans.fromAccountId,
                toAcc: newTrans.toAccountId,
                amount: newTrans.amount,
                status: newTrans.status
            }
        });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }


}

export async function transferFunds(req: Request, res: Response) {
    const { toAccId, amount, idemKey } = req.body;
    if (!toAccId || !amount || !idemKey) {
        throw new errHandler(409, "Required fields are missing!");
    }

    // The implementation of this function will be similar to the createTransaction function, but with some differences:
    // 1. The fromAcc will be the system account so there will be no amount deduction and no ledger wil be created for fromAcc, only for toAcc (credit entry)
    // 3. The rest of the logic for creating the transaction and ledger entries will be similar to the createTransaction function for toAcc (credit entry) and transaction creation with pending status, idempotency key check, and transaction status update to completed after successful creation.

    // ensure toAccId is valid ObjectId
    if (!isValidObjectId(toAccId)) throw new errHandler(409, "Invalid Receiver's account id!");

    // check if the to account exists and is active
    const toAccInfo = await accModel.findById(toAccId);
    if (!toAccInfo) {
        throw new errHandler(404, "Receiver's account not found!");
    }

    if (toAccInfo.status !== "ACTIVE") {
        throw new errHandler(403, "Receiver's account is not active!");
    }

    // idempotency key logic
    try {
        const idempCheck = await idempontencyCheck(idemKey);
        if (idempCheck) {
            return res.status(idempCheck.status ? 200 : 409).json(idempCheck);
        }
    } catch (err) {
        throw err;
    }

    // creating the transaction and ledger entry for the to account (credit) with session/transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newTrans = new transactionModel({
            fromAccountId: req.user._id, // system user id
            toAccountId: toAccInfo._id,
            amount: Number(amount),
            idempotencyKey: String(idemKey)
        });

        // creating the ledger entry for the to account (credit)
        await ledgerModel.create([{
            accountId: toAccInfo._id,
            amount: Number(amount),
            transactionId: newTrans._id,
            type: "CREDIT"
        }], { session });

        // change the transaction status to completed after successful creation of the transaction and ledger entry
        newTrans.status = "COMPLETED";
        await newTrans.save({ session });

        // finnaly commit the transaction to make all the changes permanent in the database
        await session.commitTransaction();

        // return the response to the client
        return res.status(201).json({
            status: true,
            message: "Funds transferred successfully and transaction is completed!",
            data: {
                id: newTrans._id,
                fromAcc: newTrans.fromAccountId,
                toAcc: newTrans.toAccountId,
                amount: newTrans.amount,
                status: newTrans.status
            }
        });
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        await session.endSession();
    }
}
