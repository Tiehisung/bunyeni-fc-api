"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiConfig = exports.baseUrl = void 0;
exports.baseUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://konjiehifc.vercel.app";
exports.apiConfig = {
    base: `${exports.baseUrl}/api`,
    features: `${exports.baseUrl}/api/features`,
    users: `${exports.baseUrl}/api/users`,
    auth: `${exports.baseUrl}/api/auth`,
    signin: `${exports.baseUrl}/api/auth/signin`,
    credentialSignin: `${exports.baseUrl}/api/auth/credentials`,
    signout: `${exports.baseUrl}/api/auth/signout`,
    logout: `${exports.baseUrl}/api/auth/users/logout`,
    sponsors: `${exports.baseUrl}/api/sponsors`,
    docs: `${exports.baseUrl}/api/documents`,
    moveCopyDoc: `${exports.baseUrl}/api/documents/move-copy`,
    teams: `${exports.baseUrl}/api/teams`,
    matches: `${exports.baseUrl}/api/matches`,
    goals: `${exports.baseUrl}/api/goals`,
    cards: `${exports.baseUrl}/api/cards`,
    mvps: `${exports.baseUrl}/api/mvps`,
    injuries: `${exports.baseUrl}/api/injuries`,
    players: `${exports.baseUrl}/api/players`,
    trainingSession: `${exports.baseUrl}/api/training`,
    managers: `${exports.baseUrl}/api/managers`,
    captains: `${exports.baseUrl}/api/captains`,
    currentCaptains: `${exports.baseUrl}/api/captains/current`,
    galleries: `${exports.baseUrl}/api/galleries`,
    messages: `${exports.baseUrl}/api/messages`,
    transactions: `${exports.baseUrl}/api/finance/transactions`,
    news: `${exports.baseUrl}/api/news`,
    squad: `${exports.baseUrl}/api/squad`,
    fileUpload: `${exports.baseUrl}/api/file/cloudinary`,
    file: `${exports.baseUrl}/api/file`,
    highlights: `${exports.baseUrl}/api/highlights`,
};
