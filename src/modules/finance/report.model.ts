/**
 * Mongoose Schemas and Models for Football Club Resource Management
 * Database layer with validation and type safety
 */

import { Schema, type Document, model, models } from "mongoose"
import { type IReport, } from "./types"

// Report Schema
const reportSchema = new Schema<IReport & Document>(
    {
        title: {
            type: String,
            required: [true, "Report title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        period: {
            startDate: {
                type: Date,
                required: true,
            },
            endDate: {
                type: Date,
                required: true,
                // validate: {
                //     validator: function (v: Date) {
                //         return v > (this as { period: { startDate: Date } }).period.startDate
                //     },
                //     message: "End date must be after start date",
                // },
            },
        },
        summary: {
            totalIncome: {
                type: Number,
                default: 0,
            },
            totalExpenses: {
                type: Number,
                default: 0,
            },
            netBalance: {
                type: Number,
                default: 0,
            },
        },
        transactions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Transaction",
            },
        ],
    },
    { timestamps: true },
)

// Create models with type checking

export const ReportModel = (models.Report || model<IReport & Document>("Report", reportSchema))

export { reportSchema }
