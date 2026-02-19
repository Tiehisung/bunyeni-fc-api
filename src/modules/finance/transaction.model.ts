/**
 * Mongoose Schemas and Models for Football Club Resource Management
 * Database layer with validation and type safety
 */

import { Schema, type Document, model, models } from "mongoose"
import {
    type ITransaction,
    TransactionType,
    IncomeCategory,
    ExpenseCategory,
} from "./types"

// Transaction Schema
const transactionSchema = new Schema<ITransaction & Document>(
    {
        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: [true, "Transaction type is required"],
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"],
            validate: {
                validator: (v: number) => Number.isFinite(v),
                message: "Amount must be a valid number",
            },
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [...Object.values(IncomeCategory), ...Object.values(ExpenseCategory)],
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
    },
    { timestamps: true },
)

// Create compound index for efficient queries
// transactionSchema.index({ clubId: 1, date: -1 })
// transactionSchema.index({ clubId: 1, category: 1 })

// Create models with type checking

export const TransactionModel = (models.Transaction ||
    model<ITransaction & Document>("Transaction", transactionSchema))


export { transactionSchema, }
