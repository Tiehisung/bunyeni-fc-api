import mongoose, { Schema } from "mongoose";
import { EGoalType } from "../../../types/match.interface";

export const goalSchema = new Schema(
  {
    match: { type: Schema.Types.ObjectId, ref: "matches", required: true },
    minute: String,
    scorer: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "players",
      },
      name: String,
      avatar: String,
      number: Number
    },
    assist: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "players",
      },
      name: String,
      avatar: String,
      number: Number
    },
    type: String,
    description: String,
    modeOfScore: { type: String, default: () => EGoalType.UNKNOWN, enum: Object.values(EGoalType) },
    forKFC: { type: Boolean, default: () => false }
  },
  { timestamps: true }
);

const GoalModel = mongoose.models.goals || mongoose.model("goals", goalSchema);

export default GoalModel;

export type IPostGoal = mongoose.InferSchemaType<typeof goalSchema>;