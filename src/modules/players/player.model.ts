import mongoose, { Schema } from "mongoose";
import { fileSchema } from "../media/files/file.model";
import { EPlayerAgeStatus, EPlayerAvailability, EPlayerStatus } from "../../types/player.interface";


const playerSchema = new Schema(
    {
        slug: { type: String, unique: [true, 'Player with slug already exists'] },
        firstName: {
            type: String,
            required: true,
            message: "First name required",
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            message: "Last name required",
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            message: "Phone number required",
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            lowercase: true,
            validate: {
                validator: function (v: string) {
                    if (!v) return true; // skip validation if empty
                    return /\S+@\S+\.\S+/.test(v); // check format if exists
                },
                message: "Email must be valid",
            },
        },
        avatar: String,
        height: { type: Number },
        captaincy: { type: String },
        dob: { type: String, required: true },
        about: { type: String, },
        history: { type: String, },
        dateSigned: { type: String, required: true },
        featureMedia: { type: [fileSchema], default: () => [] },
        manager: {
            fullname: String,
            phone: String,
        },
        performance: { type: Schema.Types.Array, default: () => [] },

        galleries: [{ type: Schema.Types.ObjectId, ref: "galleries", default: [] }],
        cards: [{ type: Schema.Types.ObjectId, ref: "cards", default: [] }],
        injuries: [{ type: Schema.Types.ObjectId, ref: "injuries", default: [] }],
        goals: [{ type: Schema.Types.ObjectId, ref: "goals", default: [] }],
        assists: [{ type: Schema.Types.ObjectId, ref: "goals", default: [] }],
        ratings: [{ match: { type: Schema.Types.ObjectId, ref: "matches" }, rating: Number, default: [] }],
        matches: [{ type: Schema.Types.ObjectId, ref: "matches", default: [] }],
        mvps: [{ type: Schema.Types.ObjectId, ref: "mvps", default: [] }],

        issues: { type: [{ title: String, description: String, date: { type: String, default: () => new Date().toISOString() } }], default: () => [] },
        ageStatus: { type: String, enum: Object.values(EPlayerAgeStatus), default: () => EPlayerAgeStatus.YOUTH },
        status: { type: String, enum: Object.values(EPlayerStatus), default: () => EPlayerStatus.CURRENT },
        availability: { type: String, default: () => EPlayerAvailability.AVAILABLE, enum: Object.values(EPlayerAvailability) },

        number: { type: String, },
        position: {
            type: String,
        },
        training: { type: Schema.Types.Mixed, default: () => ({ team: "A" }) },
        code: { type: String, required: [true, 'Player ID is required'], unique: [true, 'Player ID must be a unique value'] },//IS091223

    },
    { timestamps: true }
);

const PlayerModel =
    mongoose.models.players || mongoose.model("players", playerSchema);

export default PlayerModel;




// email: {
//   type: String,
//     trim: true,
//       lowercase: true,
//         validate: {
//     validator: function (v: string) {
//       if (!v) return true; // skip validation if empty
//       return /\S+@\S+\.\S+/.test(v); // check format if exists
//     },
//     message: "Email must be valid",
//       },
// }