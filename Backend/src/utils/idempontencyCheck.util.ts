import transactionModel from "../models/transaction.model.js";
import { errHandler } from "../types/errorHandler.js";

/**
    * Checks if a transaction with the given idempotency key already exists and returns its status.
    * @param {string} key - The idempotency key to check.
    * @returns {Promise<{status: boolean, message: string, data: object|null}|undefined>} - An object containing the status, message, and data of the existing transaction if found, or undefined if no transaction with the given idempotency key exists.
 */
export async function idempontencyCheck(key: string): Promise<{ status: boolean; message: string; data: object | null; } | undefined> {
    // idempotency key logic
    const existingTrans = await transactionModel.findOne({ idempotencyKey: key });
    if (existingTrans) {
        switch (existingTrans.status) {
            case "PENDING":
                return {
                    status: true,
                    message: "Transaction is being processed, please wait!",
                    data: null // no need to return the transaction details as it is still pending and may change
                };
            case "COMPLETED":
                return {
                    status: true,
                    message: "Transaction already completed!",
                    data: {
                        fromAcc: existingTrans.fromAccountId,
                        toAcc: existingTrans.toAccountId,
                        amount: existingTrans.amount
                    }
                };
            case "FAILED":
                return {
                    status: false,
                    message: "Transaction was failed, please try again!",
                    data: {
                        fromAcc: existingTrans.fromAccountId,
                        toAcc: existingTrans.toAccountId,
                        amount: existingTrans.amount
                    }
                };
            case "REVERSED":
                return {
                    status: false,
                    message: "Transaction was reversed, please try again!",
                    data: {
                        fromAcc: existingTrans.fromAccountId,
                        toAcc: existingTrans.toAccountId,
                        amount: existingTrans.amount
                    }
                };
            default:
                return {
                    status: false,
                    message: "Invalid transaction status found for the given idempotency key!",
                    data: null
                }
        }
    }
}
