// import { ConnectMongoDb } from "@/lib/dbconfig";
// import { NextRequest, NextResponse } from "next/server";
// import { getErrorMessage, removeEmptyKeys } from "@/lib";
// import { TSearchKey } from "@/types";
// import { logAction } from "../../logs/helper";
// import { deleteCldAssets } from "../../file/route";
// import { ELogSeverity } from "@/types/log";
// import FolderModel, { IPostFolder } from "@/models/folder";
// import { auth } from "@/auth";
// import { EUserRole, IUser } from "@/types/user";
// import DocModel from "@/models/doc";
// import { IDocFile, IFolder } from "@/types/doc";

// ConnectMongoDb();

// export async function GET(request: NextRequest) {

//     const { searchParams } = new URL(request.url);
//     const page = Number.parseInt(searchParams.get("page") || "1", 10);
//     const limit = Number.parseInt(searchParams.get("limit") || "20", 10);

//     const search = searchParams.get("doc_search") as TSearchKey || "";

//     const skip = (page - 1) * limit;

//     const regex = new RegExp(search, "i");
//     const query = {
//         $or: [
//             { "name": regex },
//             { "original_filename": regex },
//             { "folder": regex },
//             { "description": regex },
//         ],
//     };

//     const cleaned = removeEmptyKeys(query);

//     const logs = await FolderModel.find(cleaned)
//         .sort({ createdAt: 'desc' })
//         .skip(skip)
//         .limit(limit)
//         .lean();

//     const total = await FolderModel.countDocuments(cleaned);
//     return NextResponse.json({
//         success: true,
//         data: logs, pagination: {
//             page,
//             limit,
//             total,
//             pages: Math.ceil(total / limit),
//         },
//     });
// }

// export async function POST(req: NextRequest) {
//     try {
//         const { name, description, isDefault, } = await req.json() as IPostFolder

//         const doc = await FolderModel.create({
//             name,
//             description,
//             isDefault,
//         });

//         // log
//         await logAction({
//             title: `Folder created - ${name}`,
//             description: `${name} created on ${Date.now()}` as string,
//         });
//         return NextResponse.json({
//             success: true,
//             message: "New Folder Created",
//             data: doc,
//         });
//     } catch (error) {
//         return NextResponse.json({
//             success: false,
//             message: getErrorMessage(error, "Failed to create folder"),
//         });
//     }
// }

// //Delete from Cloud then pull id from collection files field
// export async function DELETE(req: NextRequest) {
//     try {
//         const session = await auth();
//         if ((session?.user as IUser)?.role !== EUserRole.SUPER_ADMIN) {
//             return NextResponse.json({
//                 message: "Unauthorized",
//                 success: false,
//             });
//         }

//         const folderId = await req.json()

//         const deletedFolder: IFolder = await FolderModel.findById(folderId).populate('documents');

//         //Delete file from cloudinary
//         await deleteCldAssets(deletedFolder?.documents
//             ?.map((doc) => ({ public_id: doc.public_id })) ?? []);

//         //Delete file data from database
//         const deleteFromDb = await DocModel.deleteMany({
//             _id: {
//                 $in: deletedFolder?.documents?.map(doc => doc._id).filter(Boolean) ?? [],
//             }
//         });
//         // log
//         const logDesc = deletedFolder?.documents?.length ? `${deletedFolder?.documents?.length} docs deleted. [${deletedFolder?.documents?.map(dd => dd.name)?.join(', ')}].` : 'No documents to delete.';
//         await logAction({
//             title: "Folder deleted",
//             description: logDesc,
//             severity: ELogSeverity.CRITICAL,
//         });
//         return NextResponse.json({
//             message: "Delete  successful ",
//             success: true,
//             data: deleteFromDb,
//         });
//     } catch (error) {
//         return NextResponse.json({
//             message: "Failed to delete file.",
//             success: false,
//             data: error,
//         });
//     }
// }