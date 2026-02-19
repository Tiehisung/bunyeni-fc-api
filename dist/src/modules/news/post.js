"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postNews = postNews;
const lib_1 = require("../../lib");
const news_model_1 = __importDefault(require("./news.model"));
async function postNews({ headline, metaDetails, type }) {
    try {
        let body = {};
        switch (type) {
            case 'squad':
                body = { headline, metaDetails, type };
                break;
            case 'general':
                body = { headline, details: metaDetails, type };
                break;
            default:
                body = { headline, details: metaDetails, type };
        }
        const slug = (0, lib_1.slugify)(headline?.text);
        const saved = await news_model_1.default.create({
            ...body, slug
        });
        return saved;
    }
    catch {
        // optionally log this to an external monitoring tool (Sentry, etc.)
        return null;
    }
}
