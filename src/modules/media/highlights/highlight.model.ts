
import mongoose from "mongoose";

export const highlightSchema = new mongoose.Schema(
  {
    original_filename: { type: String },
    name: { type: String },
    title: String,
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
    tags: { type: [String], default: () => [] },//Can be used to store any tags associated with the file eg.'objectIds', 'profile-picture', 'gallery-image','video', etc.
    match: {},
  },
  { timestamps: true }
);

const HighlightModel = mongoose.models.highlights || mongoose.model("highlights", highlightSchema);

export default HighlightModel;

export type IPostHighlight = mongoose.InferSchemaType<typeof highlightSchema>;


