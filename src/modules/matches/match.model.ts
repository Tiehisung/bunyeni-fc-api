import mongoose, { Schema } from "mongoose";
import { EMatchStatus } from "../../types/match.interface";

const matchSchema = new Schema(
  {
    title: { type: String },
    slug: { type: String, unique: [true, "Slug must be unique"] },
    opponent: { type: Schema.Types.ObjectId, ref: "teams", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: [...Object.values(EMatchStatus)],
      default: () => EMatchStatus.UPCOMING,
    },
    goals: [{ type: Schema.Types.ObjectId, ref: "goals" }],
    squad: [{ type: Schema.Types.ObjectId, ref: "squad" }],
    cards: [{ type: Schema.Types.ObjectId, ref: "cards" }],
    injuries: [{ type: Schema.Types.ObjectId, ref: "injury" }],

    sponsor: [{ type: Schema.Types.ObjectId, ref: "sponsors" }],
    broadcaster: {},
    venue: { name: { type: String, default: () => 'Home Park' }, files: [{}] },
    isHome: Boolean,
    events: [{ description: String, title: String, minute: String, modeOfScore: String }],
    mvp: {} //iplayer preferred
  },
  { timestamps: true }
);

const MatchModel =
  mongoose.models.matches || mongoose.model("matches", matchSchema);

export default MatchModel;

export type IPostMatch = mongoose.InferSchemaType<typeof matchSchema>;