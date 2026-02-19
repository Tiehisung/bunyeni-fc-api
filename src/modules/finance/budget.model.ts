/**
 * Mongoose Schemas and Models for Football Club Resource Management
 * Database layer with validation and type safety
 */

import { Schema, type Document, model, models } from "mongoose"
import {type IBudget,IncomeCategory, ExpenseCategory,} from "./types"
    
// Budget Schema
const budgetSchema = new Schema<IBudget & Document>(
    {
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
            enum: [...Object.values(IncomeCategory), ...Object.values(ExpenseCategory)],
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
    },
    { timestamps: true },
)

// Create unique index to prevent duplicate budgets
// budgetSchema.index({ clubId: 1, year: 1, month: 1, category: 1 }, { unique: true })

// Create models with type checking

export const BudgetModel = (models.Budget || model<IBudget & Document>("Budget", budgetSchema))

export { budgetSchema }
