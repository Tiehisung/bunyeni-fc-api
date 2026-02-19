// import { auth } from "@/auth";

import { ELogSeverity, ILog } from "../../types/log.interface";
import connectDB from "../../config/db";
import LogModel from "./logs.model";
import { getMe } from "../users/user.controller";

connectDB();
export async function logAction({
    title,
    description,
    severity = ELogSeverity.INFO,
    meta = {},
}: Omit<ILog, "_id" | "createdAt">) {
    try {
        // const me = await getMe()
        const log = await LogModel.create({
            title,
            description,
            // user: (session?.user),
            severity,
            meta,
            createdAt: new Date(),
        });
        return log;
    } catch (error) {
        console.error("Failed to commit log:", error);
        return null;
    }
}
