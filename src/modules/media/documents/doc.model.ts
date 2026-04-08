
import mongoose, { Schema } from "mongoose";

export const docSchema = new mongoose.Schema(
    {
        original_filename: { type: String },
        description: { type: String },
        secure_url: { type: String },
        thumbnail_url: String,
        url: { type: String },
        resource_type: String,
        bytes: Number,
        public_id: String,
        asset_id: String,
        format: String,
        width: Number,
        height: Number,
        tags: { type: [String], default: () => [] },
        //Essential
        folder: { type: Schema.Types.ObjectId, ref: "folders", },
        createdBy: { _id: String, name: String, avatar: String } //As IUser
    },
    { timestamps: true }
);

const DocModel = mongoose.models.documents || mongoose.model("documents", docSchema);

export default DocModel;


export type IPostDoc = mongoose.InferSchemaType<typeof docSchema>;