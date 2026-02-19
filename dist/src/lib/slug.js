"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugIdFilters = void 0;
const validate_1 = require("../lib/validate");
/**
 *
 * @param value any of id, slug or email
 * @returns object of the matching field
 */
const slugIdFilters = (value) => (0, validate_1.isValidEmail)(value) ? { email: value } : (0, validate_1.isObjectId)(value) ? { _id: value } : { slug: value };
exports.slugIdFilters = slugIdFilters;
