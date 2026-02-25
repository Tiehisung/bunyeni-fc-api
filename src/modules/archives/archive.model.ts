import mongoose from "mongoose";
import { EArchivesCollection } from "../../types/archive.interface";



const archiveSchema = new mongoose.Schema(
  {
    // Original data
    doc: {},

    sourceCollection: {
      type: String,
      enum: [...Object.values(EArchivesCollection)],
      required: [true, 'Source collection collection required']
    },
    // Archive metadata

    user: {
      name: String,
      email: String,
      image: String,
      role: String
    }
    ,
    reason: String,

  }, {
  timestamps: true,
}

);

// Export models (fixed naming consistency)
export const ArchiveModel = mongoose.models.Archive ||
  mongoose.model("Archive", archiveSchema);

export default ArchiveModel