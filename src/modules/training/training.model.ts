import { Schema, model, models, } from "mongoose";
import { IPlayerMini } from "../../types/player.interface";
import { IUser } from "../../types/user";

const TrainingSessionSchema = new Schema({
    date: { type: Date, required: true, default: Date.now },
    location: String,
    note: String,
    attendance: {
        allPlayers: [{
            _id: { type: Schema.Types.ObjectId, ref: "Player" },
            name: { type: String, },
            number: { type: String, },
            avatar: String,
        },]
        ,
        attendedBy: [{
            _id: { type: Schema.Types.ObjectId, ref: "Player" },
            name: { type: String, },
            number: { type: String, },
            avatar: String,
        },
        ]
    },
    updateCount: { type: Number, default: 0 },
    recordedBy: {},
}, { timestamps: true, });

const TrainingSessionModel = models.training_session ||
    model("training_session", TrainingSessionSchema);

export default TrainingSessionModel

export interface IPostTrainingSession {
    date: string;
    location: string;
    note?: string;
    recordedBy?: Partial<IUser>;
    attendance: {
        allPlayers: Array<IPlayerMini>;
        attendedBy: Array<IPlayerMini>;
    };
}