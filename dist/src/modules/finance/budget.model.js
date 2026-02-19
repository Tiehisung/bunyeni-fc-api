"use strict";
/**
 * Mongoose Schemas and Models for Football Club Resource Management
 * Database layer with validation and type safety
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetSchema = exports.BudgetModel = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("./types");
// Budget Schema
const budgetSchema = new mongoose_1.Schema({
    year: {
        type: Number,
        required: [true, "Year is required"],
        min: [2000, "Year must be realistic"],
        max: [new Date().getFullYear() + 10, "Year cannot be too far in the future"],
    },
    month: {
        type: Number,
        min: [1, "Month must be between 1 and 12"],
        max: [12, "Month must be between 1 and 12"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: [...Object.values(types_1.IncomeCategory), ...Object.values(types_1.ExpenseCategory)],
    },
    plannedAmount: {
        type: Number,
        required: [true, "Planned amount is required"],
        min: [0, "Amount cannot be negative"],
    },
    actualAmount: {
        type: Number,
        min: [0, "Amount cannot be negative"],
    },
    notes: {
        type: String,
        trim: true,
    },
}, { timestamps: true });
exports.budgetSchema = budgetSchema;
// Create unique index to prevent duplicate budgets
// budgetSchema.index({ clubId: 1, year: 1, month: 1, category: 1 }, { unique: true })
// Create models with type checking
exports.BudgetModel = (mongoose_1.models.Budget || (0, mongoose_1.model)("Budget", budgetSchema));
