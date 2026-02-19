"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAYER_POSITION_UI_MAP = exports.EPlayerPosition = exports.EPlayerFitness = exports.EPlayerAvailability = exports.EPlayerStatus = exports.EPlayerAgeStatus = void 0;
const color_1 = require("./color");
var EPlayerAgeStatus;
(function (EPlayerAgeStatus) {
    EPlayerAgeStatus["JUVENILE"] = "juvenile";
    EPlayerAgeStatus["YOUTH"] = "youth";
})(EPlayerAgeStatus || (exports.EPlayerAgeStatus = EPlayerAgeStatus = {}));
var EPlayerStatus;
(function (EPlayerStatus) {
    EPlayerStatus["CURRENT"] = "current";
    EPlayerStatus["FORMER"] = "former";
})(EPlayerStatus || (exports.EPlayerStatus = EPlayerStatus = {}));
var EPlayerAvailability;
(function (EPlayerAvailability) {
    EPlayerAvailability["AVAILABLE"] = "AVAILABLE";
    EPlayerAvailability["INJURED"] = "INJURED";
    EPlayerAvailability["SUSPENDED"] = "SUSPENDED";
    EPlayerAvailability["PERSONAL_LEAVE"] = "PERSONAL_LEAVE";
})(EPlayerAvailability || (exports.EPlayerAvailability = EPlayerAvailability = {}));
var EPlayerFitness;
(function (EPlayerFitness) {
    EPlayerFitness["FIT"] = "FIT";
    EPlayerFitness["MINOR_INJURY"] = "MINOR_INJURY";
    EPlayerFitness["MAJOR_INJURY"] = "MAJOR_INJURY";
    EPlayerFitness["RECOVERING"] = "RECOVERING";
    EPlayerFitness["UNFIT"] = "UNFIT";
})(EPlayerFitness || (exports.EPlayerFitness = EPlayerFitness = {}));
var EPlayerPosition;
(function (EPlayerPosition) {
    EPlayerPosition["KEEPER"] = "goal keeper";
    EPlayerPosition["DEFENDER"] = "defender";
    EPlayerPosition["MIDFILDER"] = "midfielder";
    EPlayerPosition["FORWARD"] = "forward";
    EPlayerPosition["STRIKER"] = "striker";
    EPlayerPosition["WING_BACK"] = "wing back";
    EPlayerPosition["CENTER_BACK"] = "center back";
    EPlayerPosition["ATTACKING_MIDFIELDER"] = "attacking midfielder";
    EPlayerPosition["DEFENSIVE_MIDFIELDER"] = "defensive midfielder";
    EPlayerPosition["WINGER"] = "winger";
    EPlayerPosition["SWEEPER"] = "sweeper";
})(EPlayerPosition || (exports.EPlayerPosition = EPlayerPosition = {}));
exports.PLAYER_POSITION_UI_MAP = {
    [EPlayerPosition.KEEPER]: {
        icon: "🧤",
        color: color_1.EColor.PURPLE,
    },
    [EPlayerPosition.DEFENDER]: {
        icon: "🛡️",
        color: color_1.EColor.BLUE,
    },
    [EPlayerPosition.CENTER_BACK]: {
        icon: "🧱",
        color: color_1.EColor.INGIGO,
    },
    [EPlayerPosition.WING_BACK]: {
        icon: "🏃‍♂️",
        color: color_1.EColor.TEAL,
    },
    [EPlayerPosition.SWEEPER]: {
        icon: "🧹",
        color: color_1.EColor.GRAY,
    },
    [EPlayerPosition.DEFENSIVE_MIDFIELDER]: {
        icon: "⚙️",
        color: color_1.EColor.GREEN,
    },
    [EPlayerPosition.MIDFILDER]: {
        icon: "🎯",
        color: color_1.EColor.GREEN,
    },
    [EPlayerPosition.ATTACKING_MIDFIELDER]: {
        icon: "🎨",
        color: color_1.EColor.YELLOW,
    },
    [EPlayerPosition.WINGER]: {
        icon: "⚡",
        color: color_1.EColor.ORANGE,
    },
    [EPlayerPosition.FORWARD]: {
        icon: "🚀",
        color: color_1.EColor.RED,
    },
    [EPlayerPosition.STRIKER]: {
        icon: "🥅",
        color: color_1.EColor.AMBER,
    },
};
