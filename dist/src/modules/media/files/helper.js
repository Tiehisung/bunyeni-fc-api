"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCldAssets = deleteCldAssets;
const configs_1 = require("../../../lib/configs");
async function deleteCldAssets(files) {
    try {
        //Delete file from cloudinary
        const response = await fetch(configs_1.apiConfig.fileUpload, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(files),
        });
        const result = await response.json();
        return result;
    }
    catch (error) {
        return { data: error, success: false, };
    }
}
