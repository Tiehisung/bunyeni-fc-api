"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TrainingSessionSchema = new mongoose_1.Schema({
    date: { type: Date, required: true, default: Date.now },
    location: String,
    note: String,
    attendance: {
        allPlayers: [{
                _id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Player" },
                name: { type: String, },
                number: { type: String, },
                avatar: String,
            },],
        attendedBy: [{
                _id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Player" },
                name: { type: String, },
                number: { type: String, },
                avatar: String,
            },]
    },
    updateCount: { type: Number, default: 0 },
    recordedBy: {},
}, { timestamps: true, });
const TrainingSessionModel = mongoose_1.models.training_session ||
    (0, mongoose_1.model)("training_session", TrainingSessionSchema);
exports.default = TrainingSessionModel;
