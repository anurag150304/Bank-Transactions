import jwt, { type JwtPayload } from "jsonwebtoken";

/**
 * Generates a JWT token for the given email.
 * @param {string} email - Email to include in the token payload.
 * @returns {string} - Signed JWT token.
 */
export function generateToken(email: string) {
    return jwt.sign({ email }, process.env.JWT_SECRET as string, { algorithm: "HS256", expiresIn: "7d" });
}

/**
 * Decodes and verifies a JWT token.
 * @template T
 * @param {string} token - JWT token to decode.
 * @returns {T} - Decoded token payload.
 */
export function decodeToken<T>(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET as string) as (JwtPayload | string) & T;
}