import mongoose, { Schema } from "mongoose";

const captainSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["captain", "vice"] },
    startDate: { type: String, default: () => new Date().toISOString() },
    endDate: { type: String },
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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CaptaincyModel =
  mongoose.models.captains || mongoose.model("captains", captainSchema);

export default CaptaincyModel;
