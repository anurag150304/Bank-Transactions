import { Schema, Model, Types, model } from "mongoose";
import type { AccountSchema } from "../types/common.js";

/**
 * Mongoose schema for the Account model.
 * Represents user accounts with status and currency.
 */
const accSchema = new Schema<AccountSchema, Model<AccountSchema>>({
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

/**
 * Mongoose model for the Account schema.
 */
const accModel = model("Account", accSchema);
export default accModel;