
import mongoose from "mongoose";

export const docFolderSchema = new mongoose.Schema(
    {
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
    },

    { timestamps: true }
);

const FolderModel = mongoose.models["folders"] || mongoose.model("folders", docFolderSchema);

export default FolderModel;

export type IPostFolder = mongoose.InferSchemaType<typeof docFolderSchema>;


