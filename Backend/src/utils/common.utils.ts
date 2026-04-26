import jwt, { type JwtPayload } from "jsonwebtoken";

/**
 * Generates a JWT token for the given email.
 * @param {string} email - Email to include in the token payload.
 * @returns {string} - Signed JWT token.
 */
export function generateToken(email: string): string {
    return jwt.sign({ email }, process.env.JWT_SECRET as string, { algorithm: "HS256", expiresIn: "7d" });
}

/**
 * Decodes and verifies a JWT token.
 * @template T - Type of the expected token payload.
 * @param {string} token - JWT token to decode.
 * @returns {(JwtPayload | string) & T} - Decoded token payload with type T.
 */
export function decodeToken<T>(token: string): (JwtPayload | string) & T {
    return jwt.verify(token, process.env.JWT_SECRET as string) as (JwtPayload | string) & T;
}