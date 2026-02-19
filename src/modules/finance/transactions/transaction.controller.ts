// controllers/finance/transaction.controller.ts
import type { Request, Response } from "express";
import { QueryFilter } from "mongoose";
import { getFinancialSummary, getClubTransactions } from "..";
import { removeEmptyKeys, getErrorMessage } from "../../../lib";
import { ELogSeverity } from "../../../types/log.interface";
import { logAction } from "../../logs/helper";
import { TransactionModel } from "../transaction.model";
import { TransactionType } from "../types";


// GET /api/transactions
export const getTransactions = async (req: Request, res: Response) => {
    try {
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "20", 10);
        const skip = (page - 1) * limit;

        const search = (req.query.transaction_search as string) || "";
        const startDate = (req.query.startDate as string) || "";
        const endDate = (req.query.endDate as string) || "";
        const type = (req.query.type as TransactionType) || "";
        const category = (req.query.category as string) || "";
        const minAmount = req.query.minAmount ? Number(req.query.minAmount) : undefined;
        const maxAmount = req.query.maxAmount ? Number(req.query.maxAmount) : undefined;

        const regex = new RegExp(search, "i");

        const query: QueryFilter<any> = {};

        // Search filter
        if (search) {
            query.$or = [
                { description: regex },
                { notes: regex },
                { category: regex },
                { reference: regex },
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Type filter (income/expense)
        if (type) {
            query.type = type;
        }

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Amount range filter
        if (minAmount !== undefined || maxAmount !== undefined) {
            query.amount = {};
            if (minAmount !== undefined) query.amount.$gte = minAmount;
            if (maxAmount !== undefined) query.amount.$lte = maxAmount;
        }

        const cleanedQuery = removeEmptyKeys(query);

        // Get transactions with pagination
        const transactions = await TransactionModel.find(cleanedQuery)
            .sort({ date: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        // Get financial summary for the period
        const summary = await getFinancialSummary(startDate, endDate);

        // Get club transactions (additional stats)
        const clubTrans = await getClubTransactions(cleanedQuery);

        const total = await TransactionModel.countDocuments(cleanedQuery);

        res.status(200).json({
            success: true,
            data: {
                transactions,
                financialSummary: summary,
                clubTransactions: clubTrans,
            },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch transactions"),
        });
    }
};

// GET /api/transactions/summary
export const getTransactionSummary = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, period = 'month' } = req.query;

        const summary = await getFinancialSummary(
            startDate as string,
            endDate as string,
            // period as string
        );

        res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch transaction summary"),
        });
    }
};

// GET /api/transactions/:id
export const getTransactionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const transaction = await TransactionModel.findById(id).lean();

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        res.status(200).json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch transaction"),
        });
    }
};

// GET /api/transactions/type/:type
export const getTransactionsByType = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "20", 10);
        const skip = (page - 1) * limit;

        if (!['income', 'expense'].includes(type as string)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction type. Must be 'income' or 'expense'",
            });
        }

        const transactions = await TransactionModel.find({ type })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await TransactionModel.countDocuments({ type });

        // Calculate totals
        const totals = await TransactionModel.aggregate([
            { $match: { type } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    averageAmount: { $avg: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                transactions,
                summary: {
                    totalAmount: totals[0]?.totalAmount || 0,
                    averageAmount: totals[0]?.averageAmount || 0,
                    totalCount: totals[0]?.count || 0,
                },
            },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch transactions by type"),
        });
    }
};

// GET /api/transactions/category/:category
export const getTransactionsByCategory = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const page = Number.parseInt(req.query.page as string || "1", 10);
        const limit = Number.parseInt(req.query.limit as string || "20", 10);
        const skip = (page - 1) * limit;

        const transactions = await TransactionModel.find({ category })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await TransactionModel.countDocuments({ category });

        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch transactions by category"),
        });
    }
};

// POST /api/transactions
export const createTransaction = async (req: Request, res: Response) => {
    try {
        const { type, category, notes, description, amount, date, attachmentUrl, reference } = req.body;

        // Validate required fields
        if (!type || !category || !amount || !description) {
            return res.status(400).json({
                success: false,
                message: "Type, category, amount, and description are required",
            });
        }

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero",
            });
        }

        // Create transaction
        const savedTransaction = await TransactionModel.create({
            type,
            category,
            notes,
            description,
            amount,
            date: date || new Date(),
            attachmentUrl,
            reference: reference || `TRX-${Date.now()}`,
            createdBy: req.user?.id,
            createdAt: new Date(),
        });

        // Log action
        await logAction({
            title: "💰 Transaction Created",
            description: `${type}: ${description} - ${amount}`,
            severity: ELogSeverity.INFO,
            meta: {
                transactionId: savedTransaction._id,
                type,
                amount,
                category,
            },
        });

        res.status(201).json({
            message: "Transaction created successfully!",
            success: true,
            data: savedTransaction,
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to create transaction"),
            success: false,
        });
    }
};

// PUT /api/transactions/:id
export const updateTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove _id from updates
        delete updates._id;

        // Find existing transaction
        const existingTransaction = await TransactionModel.findById(id);
        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        // Update transaction
        const updatedTransaction = await TransactionModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                    updatedBy: req.user?.id,
                },
            },
            { new: true, runValidators: true }
        );

        // Log action
        await logAction({
            title: "💰 Transaction Updated",
            description: updates.description || existingTransaction.description,
            
            severity: ELogSeverity.INFO,
            meta: {
                transactionId: id,
                updates: Object.keys(updates),
            },
        });

        res.status(200).json({
            message: "Transaction updated successfully",
            success: true,
            data: updatedTransaction,
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to update transaction"),
            success: false,
        });
    }
};

// DELETE /api/transactions/:id
export const deleteTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find transaction first
        const transaction = await TransactionModel.findById(id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        // Delete transaction
        const deleted = await TransactionModel.findByIdAndDelete(id);

        // Log action
        await logAction({
            title: "💰 Transaction Deleted",
            description: `Transaction ${transaction.description} deleted`,
            severity: ELogSeverity.WARNING,
            meta: {
                transactionId: id,
                type: transaction.type,
                amount: transaction.amount,
            },
        });

        res.status(200).json({
            message: "Transaction deleted successfully",
            success: true,
            data: {
                id: deleted?._id,
                description: transaction.description,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error, "Failed to delete transaction"),
            success: false,
        });
    }
};

// GET /api/transactions/stats
export const getTransactionStats = async (req: Request, res: Response) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const stats = await TransactionModel.aggregate([
            {
                $facet: {
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalIncome: {
                                    $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                                },
                                totalExpense: {
                                    $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                                },
                                transactionCount: { $sum: 1 },
                                averageAmount: { $avg: "$amount" },
                            },
                        },
                    ],
                    byCategory: [
                        {
                            $group: {
                                _id: { category: "$category", type: "$type" },
                                total: { $sum: "$amount" },
                                count: { $sum: 1 },
                            },
                        },
                        {
                            $group: {
                                _id: "$_id.category",
                                income: {
                                    $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] }
                                },
                                expense: {
                                    $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] }
                                },
                                count: { $sum: "$count" },
                            },
                        },
                        { $sort: { income: -1, expense: -1 } },
                    ],
                    byMonth: [
                        {
                            $match: {
                                date: {
                                    $gte: new Date(`${year}-01-01`),
                                    $lte: new Date(`${year}-12-31`),
                                },
                            },
                        },
                        {
                            $group: {
                                _id: { month: { $month: "$date" }, type: "$type" },
                                total: { $sum: "$amount" },
                            },
                        },
                        {
                            $group: {
                                _id: "$_id.month",
                                income: {
                                    $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] }
                                },
                                expense: {
                                    $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] }
                                },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ],
                    recentTransactions: [
                        { $sort: { date: -1 } },
                        { $limit: 10 },
                        {
                            $project: {
                                description: 1,
                                amount: 1,
                                type: 1,
                                category: 1,
                                date: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                summary: stats[0]?.totalStats[0] || {
                    totalIncome: 0,
                    totalExpense: 0,
                    transactionCount: 0,
                    averageAmount: 0,
                },
                byCategory: stats[0]?.byCategory || [],
                byMonth: stats[0]?.byMonth || [],
                recentTransactions: stats[0]?.recentTransactions || [],
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to fetch transaction statistics"),
        });
    }
};

// GET /api/transactions/export
export const exportTransactions = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, type, category, format = 'json' } = req.query;

        const query: QueryFilter<any> = {};

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }

        if (type) query.type = type;
        if (category) query.category = category;

        const transactions = await TransactionModel.find(query)
            .sort({ date: -1 })
            .lean();

        if (format === 'csv') {
            // Convert to CSV format
            const csv = transactions.map(t =>
                `${t.date},${t.type},${t.category},${t.description},${t.amount},${t.notes || ''}`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
            return res.send(csv);
        }

        // Default JSON response
        res.status(200).json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(error, "Failed to export transactions"),
        });
    }
};