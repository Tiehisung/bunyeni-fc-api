"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const file_model_1 = require("../media/files/file.model");
const player_interface_1 = require("../../types/player.interface");
const playerSchema = new mongoose_1.Schema({
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
            validator: function (v) {
                if (!v)
                    return true; // skip validation if empty
                return /\S+@\S+\.\S+/.test(v); // check format if exists
            },
            message: "Email must be valid",
        },
    },
    height: { type: Number },
    captaincy: { type: String },
    dob: { type: String, required: true },
    about: { type: String, },
    history: { type: String, },
    dateSigned: { type: String, required: true },
    avatar: String,
    featureMedia: { type: [file_model_1.fileSchema], default: () => [] },
    manager: {
        fullname: String,
        phone: String,
    },
    performance: { type: mongoose_1.Schema.Types.Array, default: () => [] },
    galleries: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "galleries", default: [] }],
    cards: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "cards", default: [] }],
    injuries: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "injuries", default: [] }],
    goals: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "goals", default: [] }],
    assists: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "goals", default: [] }],
    ratings: [{ match: { type: mongoose_1.Schema.Types.ObjectId, ref: "matches" }, rating: Number, default: [] }],
    matches: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "matches", default: [] }],
    mvps: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "mvps", default: [] }],
    issues: { type: [{ title: String, description: String, date: { type: String, default: () => new Date().toISOString() } }], default: () => [] },
    ageStatus: { type: String, enum: Object.values(player_interface_1.EPlayerAgeStatus), default: () => player_interface_1.EPlayerAgeStatus.YOUTH },
    status: { type: String, enum: Object.values(player_interface_1.EPlayerStatus), default: () => player_interface_1.EPlayerStatus.CURRENT },
    availability: { type: String, default: () => player_interface_1.EPlayerAvailability.AVAILABLE, enum: Object.values(player_interface_1.EPlayerAvailability) },
    number: { type: String, },
    position: {
        type: String,
    },
    training: { type: mongoose_1.Schema.Types.Mixed, default: () => ({ team: "A" }) },
    code: { type: String, required: [true, 'Player ID is required'], unique: [true, 'Player ID must be a unique value'] }, //IS091223
}, { timestamps: true });
const PlayerModel = mongoose_1.default.models.players || mongoose_1.default.model("players", playerSchema);
exports.default = PlayerModel;
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
