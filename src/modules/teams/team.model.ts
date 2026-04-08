import mongoose, { Schema } from "mongoose";

const teamSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    alias: String,
    community: { type: String },
    contactName: { type: String },
    contact: { type: String },
    logo: String,
    isHome: Boolean,
    players: [{ name: String, number: String, avatar: String, },],
    createdBy: { _id: String, name: String, avatar: String } //As IUser
  },
  { timestamps: true }
);

const TeamModel =
  mongoose.models.teams || mongoose.model("teams", teamSchema);

export default TeamModel;


