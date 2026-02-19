// src/types/express/index.d.ts
import { IUser } from '../user';

declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: string;
                id: string;
                email: string;
                name: string;
                role: string;
                [key: string]: any;
            };
            token?: string;
        }
    }
}

// This export is needed to make it a module
export { };