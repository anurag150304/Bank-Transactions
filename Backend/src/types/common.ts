import type { Types } from "mongoose";

export interface UserSchema {
    email: string;
    name: string;
    password: string;
    systemUser: boolean;
}

export interface UserMethods {
    comparePassword(password: string): Promise<boolean>;
}

export interface AccountSchema {
    userId: Types.ObjectId;
    status: "ACTIVE" | "FROZEN" | "CLOSED";
    currency: string;
}

export interface AccountMethods {
    getBalance(): Promise<number>;
}

export interface TransactionSchema {
    fromAccountId: Types.ObjectId;
    toAccountId: Types.ObjectId;
    status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
    amount: number;
    idempotencyKey: string;
}

export interface LedgerSchema {
    accountId: Types.ObjectId;
    amount: number;
    transactionId: Types.ObjectId;
    type: "DEBIT" | "CREDIT";
}