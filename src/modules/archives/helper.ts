import { Request } from "express";
import { EArchivesCollection, } from "../../types/archive.interface";
import ArchiveModel from "./archive.model";
import { IUser } from "../../types/user.interface";

export async function saveToArchive(
    doc: any, sourceCollection: EArchivesCollection, reason?: string, req?: Request, user?: IUser
) {
    try {
        const userData = user || req?.user
        // const session = await auth()
        const archive = await ArchiveModel.create({
            doc,
            sourceCollection,
            user: userData,
            reason,
        });
        return archive;
    } catch (error) {
        console.error("Failed to commit archive:", error);
        return null;
    }
}
