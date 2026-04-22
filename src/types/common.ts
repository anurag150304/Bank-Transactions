import type { Types } from "mongoose";

/**
 * Interface for the User schema.
 */
export interface UserSchema {
    email: string;
    name: string;
    password: string;
    timestamp: Date
}

/**
 * Interface for methods available on User documents.
 */
export interface UserMethods {
    comparePassword(password: string): Promise<boolean>;
}

/**
 * Interface for the Account schema.
 */
export interface AccountSchema {
    userId: Types.ObjectId;
    status: "ACTIVE" | "FROZEN" | "CLOSED";
    currency: string;
}

/**
 * Interface for the Transaction schema.
 */
export interface TransactionSchema {
    fromAccountId: Types.ObjectId;
    toAccountId: Types.ObjectId;
    status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
    amount: number;
    idempotencyKey: string;
}

export interface LedgerSchema {
    accountId: Types.ObjectId;
    balance: number;
    transactionId: Types.ObjectId;
    type: "DEBIT" | "CREDIT";
}