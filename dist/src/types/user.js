"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EUserAccount = exports.EUserRole = void 0;
var EUserRole;
(function (EUserRole) {
    EUserRole["ADMIN"] = "admin";
    EUserRole["SUPER_ADMIN"] = "super_admin";
    EUserRole["GUEST"] = "guest";
    EUserRole["PLAYER"] = "player";
    EUserRole["COACH"] = "coach";
})(EUserRole || (exports.EUserRole = EUserRole = {}));
var EUserAccount;
(function (EUserAccount) {
    EUserAccount["CREDENTIALS"] = "credentials";
    EUserAccount["GOOGLE"] = "google";
})(EUserAccount || (exports.EUserAccount = EUserAccount = {}));
