"use strict";
/**
 * Core TypeScript interfaces for Football Club Resource Management
 * Defines the shape of all data structures used in the system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseCategory = exports.IncomeCategory = exports.TransactionType = void 0;
// Enums for type safety
var TransactionType;
(function (TransactionType) {
    TransactionType["INCOME"] = "income";
    TransactionType["EXPENSE"] = "expense";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var IncomeCategory;
(function (IncomeCategory) {
    IncomeCategory["SPONSORSHIP"] = "sponsorship";
    IncomeCategory["DONATIONS"] = "donations";
    IncomeCategory["TRAVEL"] = "travel";
    IncomeCategory["EQUIPMENT"] = "equipment";
    IncomeCategory["FUNDRAISERS"] = "fundraisers";
    IncomeCategory["GRANTS"] = "grants";
    IncomeCategory["OTHER"] = "other_income";
    // MERCHANDISE = "merchandise",          // jerseys, kits, balls sold
})(IncomeCategory || (exports.IncomeCategory = IncomeCategory = {}));
var ExpenseCategory;
(function (ExpenseCategory) {
    ExpenseCategory["TRAVEL"] = "travel";
    ExpenseCategory["EQUIPMENT"] = "equipment";
    ExpenseCategory["TRAINING"] = "training";
    ExpenseCategory["MEDICAL"] = "medical";
    ExpenseCategory["MAINTENANCE"] = "maintenance";
    ExpenseCategory["MARKETING"] = "marketing";
    ExpenseCategory["UTILITIES"] = "utilities";
    ExpenseCategory["ADMINISTRATION"] = "administration";
    ExpenseCategory["PLAYER_WAGES"] = "player_wages";
    ExpenseCategory["STAFF_WAGES"] = "staff_wages";
    ExpenseCategory["OTHER"] = "other_expenses";
})(ExpenseCategory || (exports.ExpenseCategory = ExpenseCategory = {}));
