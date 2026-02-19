
import mongoose from "mongoose";

export const fileSchema = new mongoose.Schema(
  {
    name: { type: String },
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
    tags: { type: [String], default: () => [] }, //Can be used to store any tags associated with the file eg.'objectIds', 'profile-picture', 'gallery-image','video', etc.
  },
  { timestamps: true }
);

const FileModel = mongoose.models.files || mongoose.model("files", fileSchema);

export default FileModel;




