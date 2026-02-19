"use strict";
// Hash password function
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasher = hasher;
exports.compareHashedText = compareHashedText;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function hasher(text) {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(text, salt);
}
async function compareHashedText(text, hashedText) {
    return bcryptjs_1.default.compare(text, hashedText);
}
