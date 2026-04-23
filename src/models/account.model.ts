import { Schema, Model, Types, model } from "mongoose";
import type { AccountMethods, AccountSchema } from "../types/common.js";
import ledgerModel from "./ledger.model.js";

/**
 * Mongoose schema for the Account model.
 * Represents user accounts with status and currency.
 */
const accSchema = new Schema<AccountSchema, Model<AccountSchema>, AccountMethods>({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: [true, "User Id is required!"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN, or CLOSED"
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required!"],
        default: "INR"
    }
}, { timestamps: true });

accSchema.index({ userId: 1, status: 1 });

accSchema.methods.getBalance = async function () {
    // here we have to calculated the balance of the acccount document based on its ledger entries
    // We will sum all the credit entries and subtract all the debit entries to get the current balance of the account
    const balanceData = await ledgerModel.aggregate([
        { $match: { accountId: this._id } },
        {
            $group: {
                _id: null,
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        }
    ]);

    // If there are no ledger entries for the account, then the balance will be 0
    return balanceData[0]?.totalCredit - balanceData[0]?.totalDebit || 0;
}

/**
 * Mongoose model for the Account schema.
 */
const accModel = model("Account", accSchema);
export default accModel;