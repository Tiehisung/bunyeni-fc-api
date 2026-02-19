"use strict";
/**
 * Mongoose Schemas and Models for Football Club Resource Management
 * Database layer with validation and type safety
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionSchema = exports.TransactionModel = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("./types");
// Transaction Schema
const transactionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(types_1.TransactionType),
        required: [true, "Transaction type is required"],
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount cannot be negative"],
        validate: {
            validator: (v) => Number.isFinite(v),
            message: "Amount must be a valid number",
        },
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: [...Object.values(types_1.IncomeCategory), ...Object.values(types_1.ExpenseCategory)],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    date: {
        type: String,
        required: [true, "Transaction date is required"],
        default: () => new Date().toISOString(),
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    attachmentUrl: {
        type: String,
        trim: true,
    },
}, { timestamps: true });
exports.transactionSchema = transactionSchema;
// Create compound index for efficient queries
// transactionSchema.index({ clubId: 1, date: -1 })
// transactionSchema.index({ clubId: 1, category: 1 })
// Create models with type checking
exports.TransactionModel = (mongoose_1.models.Transaction ||
    (0, mongoose_1.model)("Transaction", transactionSchema));
