"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGallery = createGallery;
const configs_1 = require("../../../lib/configs");
async function createGallery({ title, description, files, tags, }) {
    try {
        const response = await fetch(configs_1.apiConfig.galleries, {
            method: 'POST', body: JSON.stringify({
                title,
                description,
                files, tags,
            }), headers: { 'content-type': 'application/json' }
        });
        const result = await response.json();
        return result;
    }
    catch {
        // optionally log this to an external monitoring tool (Sentry, etc.)
        return { message: 'Failed to create gallery', success: false };
    }
}
