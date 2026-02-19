import mongoose, { Schema } from "mongoose";
import { EInjurySeverity } from "../../../types/injury.interface";

export const injurySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    minute: String,
    player: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "players",
        required: true
      },
      name: String,
      avatar: String,
      number: Number
    },
    severity: { type: String, enum: Object.values(EInjurySeverity), default: EInjurySeverity.MINOR },
    status: { type: String, default: () => 'active' }, // active, recovered, long-term
    match: {},
    user: {},
  },
  { timestamps: true }
);

const InjuryModel = mongoose.models.injuries || mongoose.model("injuries", injurySchema);

export default InjuryModel;

export type IPostInjury = mongoose.InferSchemaType<typeof injurySchema>;