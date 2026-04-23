import type { Request, Response } from "express";
import { errHandler } from "../types/errorHandler.js";
import accModel from "../models/account.model.js";
import transactionModel from "../models/transaction.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import ledgerModel from "../models/ledger.model.js";

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

    // is valid idempotency key provided
    if (!isValidObjectId(idmpKey)) {
        throw new errHandler(409, "Invalid idempotency key provided!");
    }

    // checking, is the transaction with the same idempotency key already exists with pending state\
    // The idmKey always exists in DB We have to check the status of the transaction, if it is in 'PENDING' state
    // If yes, it means the transaction is being processed, so we will not process it again, just return the pending status
    const existingTrans = await transactionModel.findOne({ idempotencyKey: idmpKey });
    if (existingTrans) {
        switch (existingTrans.status) {
            case "PENDING":
                return res.status(200).json({
                    status: true,
                    message: "Transaction is being processed, please wait!",
                    data: null // no need to return the transaction details as it is still pending and may change
                });
            case "COMPLETED":
                return res.status(200).json({
                    status: true,
                    message: "Transaction already completed!",
                    data: {
                        fromAcc: existingTrans.fromAccountId,
                        toAcc: existingTrans.toAccountId,
                        amount: existingTrans.amount
                    }
                });
            case "FAILED":
                return res.status(409).json({
                    status: false,
                    message: "Transaction was failed, please try again!",
                    data: {
                        fromAcc: existingTrans.fromAccountId,
                        toAcc: existingTrans.toAccountId,
                        amount: existingTrans.amount
                    }
                });
            case "REVERSED":
                return res.status(409).json({
                    status: false,
                    message: "Transaction was reversed, please try again!",
                    data: {
                        fromAcc: existingTrans.fromAccountId,
                        toAcc: existingTrans.toAccountId,
                        amount: existingTrans.amount
                    }
                });
            default:
                throw new errHandler(409, "Invalid transaction status found for the given idempotency key!");
        }
    }

    // if no transaction with the same idempotency key exists, create a new transaction with pending status
    // but firstly we have to check the balance of the from account, if it is less than the amount to be transferred, we will not create the transaction and return an error
    const fromAccBalance = await fromAccInfo.getBalance();
    if (fromAccBalance < amount) {
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
        await newTrans.save({ session });

        // creating the ledger entries from the from account (debit) and to the to account (credit)
        const debitEntry = new ledgerModel({
            accountId: fromAccInfo._id,
            amount: Number(amount),
            transactionId: newTrans._id,
            type: "DEBIT"
        });

        const creditEntry = new ledgerModel({
            accountId: toAccInfo._id,
            amount: Number(amount),
            transactionId: newTrans._id,
            type: "CREDIT"
        });

        await debitEntry.save({ session });
        await creditEntry.save({ session });

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