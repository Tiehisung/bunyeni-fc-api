
import mongoose, { Schema } from "mongoose";

export const docFolderSchema = new mongoose.Schema(
    {
        // slug: { type: String, required: true, unique: [true, 'Slug must be unique'] },
        name: {
            type: String,
            required: [true, 'You must provide a folder name'],
            unique: [true, 'Name must be a unique value']
        },

        description: { type: String },

        isDefault: { type: Boolean, default: () => false },

        documents: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "documents", default: () => []
        },
        createdBy: { _id: String, name: String, avatar: String } //As IUser
    },

    { timestamps: true }
);

const FolderModel = mongoose.models["folders"] || mongoose.model("folders", docFolderSchema);

export default FolderModel;

export type IPostFolder = mongoose.InferSchemaType<typeof docFolderSchema>;


