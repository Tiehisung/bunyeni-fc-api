"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EGoalType = exports.EMatchStatus = void 0;
var EMatchStatus;
(function (EMatchStatus) {
    EMatchStatus["FT"] = "FT";
    EMatchStatus["LIVE"] = "LIVE";
    EMatchStatus["UPCOMING"] = "UPCOMING";
})(EMatchStatus || (exports.EMatchStatus = EMatchStatus = {}));
var EGoalType;
(function (EGoalType) {
    EGoalType["OPEN_PLAY"] = "Open Play Goal";
    EGoalType["SET_PIECE"] = "Set Piece Goal";
    EGoalType["PENALTY"] = "Penalty Goal";
    EGoalType["OWN_GOAL"] = "Own Goal";
    EGoalType["COUNTER_ATTACK"] = "Counter-Attack Goal";
    EGoalType["HEADER"] = "Header Goal";
    EGoalType["VOLLEY"] = "Volley Goal";
    EGoalType["TAP_IN"] = "Tap-In Goal";
    EGoalType["LONG_RANGE"] = "Long-Range Goal";
    EGoalType["UNKNOWN"] = "Unknown";
})(EGoalType || (exports.EGoalType = EGoalType = {}));
