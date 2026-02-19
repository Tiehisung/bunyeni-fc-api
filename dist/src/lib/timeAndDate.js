"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYears = exports.getTimeAgo = exports.formatDate = exports.getAgeFromDOB = void 0;
exports.formatTimeToAmPm = formatTimeToAmPm;
exports.isToday = isToday;
exports.getDateFromDaysAgo = getDateFromDaysAgo;
exports.getTimeLeftOrAgo = getTimeLeftOrAgo;
const moment_1 = __importDefault(require("moment"));
/**
 *
 * @param birthdate Date arg as string
 * @returns Years as number
 */
const getAgeFromDOB = (birthdate) => {
    // Parse the birthdate string into a Date object
    const birthdateObj = new Date(birthdate);
    const currentDate = new Date();
    const ageInMillis = Number(currentDate) - Number(birthdateObj);
    const ageInYears = Math.floor(ageInMillis / (1000 * 60 * 60 * 24 * 365));
    return ageInYears;
};
exports.getAgeFromDOB = getAgeFromDOB;
const formatDate = (dateString, format) => {
    if (!dateString)
        return "";
    const createdAt = new Date(dateString);
    switch (format) {
        case "March 2, 2025":
            return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(createdAt);
        case "dd/mm/yyyy":
            return (0, moment_1.default)(dateString).format("DD/MM/YYYY");
        case "Sunday, March 2, 2025":
            return createdAt.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            });
        default:
            return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(createdAt);
    }
};
exports.formatDate = formatDate;
function formatTimeToAmPm(time, separator = '.') {
    if (!time)
        return "";
    // Expecting formats like "13:45", "09:02", "23:59"
    const [rawHour, rawMinute] = time.split(":");
    let hour = Number(rawHour);
    const minute = rawMinute || "00";
    const ampm = hour >= 12 ? "pm" : "am";
    hour = hour % 12 || 12; // converts 0 → 12, 13 → 1, etc.
    return `${hour}${separator}${minute}${ampm}`;
}
const getTimeAgo = (dateString) => (0, moment_1.default)(dateString).fromNow();
exports.getTimeAgo = getTimeAgo;
/**
 * Checks whether the given date (MongoDB date, ISO string, or JS Date)
 * represents "today" (local timezone).
 */
function isToday(date) {
    if (!date)
        return false;
    // Convert MongoDB ISO string, timestamp, or Date to Date object
    const d = new Date(date);
    if (isNaN(d.getTime()))
        return false; // invalid date
    const now = new Date();
    // Compare year, month, and day only
    return (d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate());
}
/**
 * @param daysAgo Accepts days in number and last date it falls on in time back
 * @returns Returns a JavaScript Date object, which MongoDB stores as ISODate.
 */
function getDateFromDaysAgo(daysAgo) {
    const date = new Date();
    if (!daysAgo || typeof daysAgo !== "number")
        return date;
    date.setDate(date.getDate() - daysAgo);
    return date;
}
/**
 * Returns time difference between now and a given date in the most relevant unit.
 * Handles both future ("X days left") and past ("X days ago") scenarios.
 */
function getTimeLeftOrAgo(date) {
    const now = new Date();
    const target = new Date(date ?? Date.now());
    if (isNaN(target.getTime())) {
        throw new Error("Invalid date provided to getTimeLeftUntil()");
    }
    const diffMs = target.getTime() - now.getTime();
    const absDiffMs = Math.abs(diffMs);
    const minutes = Math.floor(absDiffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    let value;
    let unit;
    if (months >= 1) {
        value = months;
        unit = "m";
    }
    else if (weeks >= 1) {
        value = weeks;
        unit = "wk";
    }
    else if (days >= 1) {
        value = days;
        unit = "d";
    }
    else if (hours >= 1) {
        value = hours;
        unit = "hr";
    }
    else {
        value = Math.max(1, minutes); // at least 1 minute
        unit = "min";
    }
    const expired = diffMs < 0;
    const formatted = expired
        ? `${value} ${unit}${value !== 1 ? "s" : ""} ago`
        : `${value} ${unit}${value !== 1 ? "s" : ""} left`;
    return { value, unit, expired, formatted };
}
const getYears = (from = 2020, to = new Date().getFullYear(), asc = false) => {
    const years = [];
    while (from <= to) {
        years.push(from);
        from = from + 1;
    }
    return asc ? years : years.sort((a, b) => b - a);
};
exports.getYears = getYears;
