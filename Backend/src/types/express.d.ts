import userModel from "../models/user.model.ts"

declare global {
    namespace Express {
        interface Request {
            user?: userModel;
        }
    }
}
