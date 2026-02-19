"use strict";
/**
 * Mongoose Schemas and Models for Football Club Resource Management
 * Database layer with validation and type safety
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportSchema = exports.ReportModel = void 0;
const mongoose_1 = require("mongoose");
// Report Schema
const reportSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Transaction",
        },
    ],
}, { timestamps: true });
exports.reportSchema = reportSchema;
// Create models with type checking
exports.ReportModel = (mongoose_1.models.Report || (0, mongoose_1.model)("Report", reportSchema));
