/**
 * Custom error handler class.
 * Extends the built-in Error class to include HTTP status codes.
 */
export class errHandler extends Error {
    public status: number;
    public message: string;

    /**
     * Constructs a new error handler instance.
     * @param {number} status - HTTP status code.
     * @param {string} message - Error message.
     */
    constructor(status: number, message: string) {
        super();
        this.status = status;
        this.message = message;
    }
}
