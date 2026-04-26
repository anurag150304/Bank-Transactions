import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Utility function to wrap asynchronous route handlers.
 * Catches errors and passes them to the next middleware.
 * @param {Function} fn - Asynchronous route handler function.
 * @returns {RequestHandler} - Wrapped route handler.
 */
export function asyncWrap(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
