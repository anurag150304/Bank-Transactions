import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import type { UserMethods, UserSchema } from "../types/common.js";

/**
 * Mongoose schema for the User model.
 * Represents users with email, name, and password.
 */
const userSchema = new Schema<UserSchema, Model<UserSchema>, UserMethods>({
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i, "Invalid email address"],
        unique: [true, "Email already exists"]
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        select: false,
        minLength: [6, "Password should contain more than 6 chanracter"]
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: true // systemUser field should not be changed once set
    }
}, { timestamps: true });

/**
 * Pre-hook to hash the password before saving the user document.
 */
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }
});

/**
 * Method to compare passwords for authentication.
 * @param {string} password - Plain text password to compare.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

const model = mongoose.model("User", userSchema);
export default model;
