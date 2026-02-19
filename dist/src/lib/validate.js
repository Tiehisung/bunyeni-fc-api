"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isObjectId = isObjectId;
function isValidEmail(email) {
    if (!email)
        return false;
    // Trim spaces
    const value = email.trim();
    // RFC 5322 compliant (safe + not overly strict)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
}
function isObjectId(value) {
    return (typeof value === "string" &&
        /^[a-fA-F0-9]{24}$/.test(value));
}
