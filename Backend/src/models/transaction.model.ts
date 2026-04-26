import { model, Model, Schema, Types } from "mongoose";
import type { TransactionSchema } from "../types/common.js";

/**
 * Mongoose schema for the Transaction model.
 * Represents transactions between accounts with status and idempotency.
 */
const transactionSchema = new Schema<TransactionSchema, Model<TransactionSchema>>({
    idempotencyKey: { // to ensure that the same transaction is not processed multiple times
        type: String,
        required: [true, "Idempotency Key is required!"],
        unique: true
    },
    fromAccountId: {
        type: Types.ObjectId,
        ref: "Account",
        required: [true, "From Account Id is required!"],
        index: true
    },
    toAccountId: {
        type: Types.ObjectId,
        ref: "Account",
        required: [true, "To Account Id is required!"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status can be either PENDING, COMPLETED, FAILED, or REVERSED"
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Amount is required!"],
        min: [0.01, "Amount must be at least 0.01!"]
    }
}, { timestamps: true });

/**
 * Mongoose model for the Transaction schema.
 */
const transactionModel = model("Transaction", transactionSchema);
export default transactionModel;
