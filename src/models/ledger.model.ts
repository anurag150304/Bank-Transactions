import { model, Model, Schema, Types } from "mongoose";
import type { LedgerSchema } from "../types/common.js";

/**
 * Mongoose schema for the Ledger model.
 * Represents ledger entries for transactions with immutability constraints.
 */
const ledgerSchema = new Schema<LedgerSchema, Model<LedgerSchema>>({
    accountId: {
        type: Types.ObjectId,
        ref: "Account",
        required: [true, "Account Id is required!"],
        index: true,
        immutable: true // accountId should not be changed once set
    },
    balance: {
        type: Number,
        required: [true, "Balance is required!"],
        min: [0, "Balance cannot be negative!"],
        immutable: true // balance should not be changed directly, it should be updated through transactions
    },
    transactionId: {
        type: Types.ObjectId,
        ref: "Transaction",
        required: [true, "Transaction Id is required!"],
        index: true,
        immutable: true // transactionId should not be changed once set
    },
    type: {
        type: String,
        enum: {
            values: ["DEBIT", "CREDIT"],
            message: "Type can be either DEBIT or CREDIT"
        },
        required: [true, "Type is required!"],
        immutable: true // type should not be changed once set
    }
}, { timestamps: true });

/**
 * Pre-hooks to prevent modification or deletion of ledger entries.
 */
function preventLedgerModification() {
    throw new Error("Ledger entries cannot be modified or deleted!");
}

// pre-hooks to prevent modification or deletion of ledger entries
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

const ledgerModel = model("Ledger", ledgerSchema);
export default ledgerModel;