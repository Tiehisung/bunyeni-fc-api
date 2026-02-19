"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTransactions = exports.getTransactionStats = exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransactionsByCategory = exports.getTransactionsByType = exports.getTransactionById = exports.getTransactionSummary = exports.getTransactions = void 0;
const __1 = require("..");
const lib_1 = require("../../../lib");
const log_interface_1 = require("../../../types/log.interface");
const helper_1 = require("../../logs/helper");
const transaction_model_1 = require("../transaction.model");
// GET /api/transactions
const getTransactions = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        const search = req.query.transaction_search || "";
        const startDate = req.query.startDate || "";
        const endDate = req.query.endDate || "";
        const type = req.query.type || "";
        const category = req.query.category || "";
        const minAmount = req.query.minAmount ? Number(req.query.minAmount) : undefined;
        const maxAmount = req.query.maxAmount ? Number(req.query.maxAmount) : undefined;
        const regex = new RegExp(search, "i");
        const query = {};
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
            if (startDate)
                query.date.$gte = new Date(startDate);
            if (endDate)
                query.date.$lte = new Date(endDate);
        }
        // Amount range filter
        if (minAmount !== undefined || maxAmount !== undefined) {
            query.amount = {};
            if (minAmount !== undefined)
                query.amount.$gte = minAmount;
            if (maxAmount !== undefined)
                query.amount.$lte = maxAmount;
        }
        const cleanedQuery = (0, lib_1.removeEmptyKeys)(query);
        // Get transactions with pagination
        const transactions = await transaction_model_1.TransactionModel.find(cleanedQuery)
            .sort({ date: -1 })
            .limit(limit)
            .skip(skip)
            .lean();
        // Get financial summary for the period
        const summary = await (0, __1.getFinancialSummary)(startDate, endDate);
        // Get club transactions (additional stats)
        const clubTrans = await (0, __1.getClubTransactions)(cleanedQuery);
        const total = await transaction_model_1.TransactionModel.countDocuments(cleanedQuery);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch transactions"),
        });
    }
};
exports.getTransactions = getTransactions;
// GET /api/transactions/summary
const getTransactionSummary = async (req, res) => {
    try {
        const { startDate, endDate, period = 'month' } = req.query;
        const summary = await (0, __1.getFinancialSummary)(startDate, endDate);
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch transaction summary"),
        });
    }
};
exports.getTransactionSummary = getTransactionSummary;
// GET /api/transactions/:id
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await transaction_model_1.TransactionModel.findById(id).lean();
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch transaction"),
        });
    }
};
exports.getTransactionById = getTransactionById;
// GET /api/transactions/type/:type
const getTransactionsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction type. Must be 'income' or 'expense'",
            });
        }
        const transactions = await transaction_model_1.TransactionModel.find({ type })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await transaction_model_1.TransactionModel.countDocuments({ type });
        // Calculate totals
        const totals = await transaction_model_1.TransactionModel.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch transactions by type"),
        });
    }
};
exports.getTransactionsByType = getTransactionsByType;
// GET /api/transactions/category/:category
const getTransactionsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = Number.parseInt(req.query.page || "1", 10);
        const limit = Number.parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        const transactions = await transaction_model_1.TransactionModel.find({ category })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await transaction_model_1.TransactionModel.countDocuments({ category });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch transactions by category"),
        });
    }
};
exports.getTransactionsByCategory = getTransactionsByCategory;
// POST /api/transactions
const createTransaction = async (req, res) => {
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
        const savedTransaction = await transaction_model_1.TransactionModel.create({
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
        await (0, helper_1.logAction)({
            title: "💰 Transaction Created",
            description: `${type}: ${description} - ${amount}`,
            severity: log_interface_1.ELogSeverity.INFO,
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
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to create transaction"),
            success: false,
        });
    }
};
exports.createTransaction = createTransaction;
// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Remove _id from updates
        delete updates._id;
        // Find existing transaction
        const existingTransaction = await transaction_model_1.TransactionModel.findById(id);
        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }
        // Update transaction
        const updatedTransaction = await transaction_model_1.TransactionModel.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
                updatedBy: req.user?.id,
            },
        }, { new: true, runValidators: true });
        // Log action
        await (0, helper_1.logAction)({
            title: "💰 Transaction Updated",
            description: updates.description || existingTransaction.description,
            severity: log_interface_1.ELogSeverity.INFO,
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
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to update transaction"),
            success: false,
        });
    }
};
exports.updateTransaction = updateTransaction;
// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        // Find transaction first
        const transaction = await transaction_model_1.TransactionModel.findById(id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }
        // Delete transaction
        const deleted = await transaction_model_1.TransactionModel.findByIdAndDelete(id);
        // Log action
        await (0, helper_1.logAction)({
            title: "💰 Transaction Deleted",
            description: `Transaction ${transaction.description} deleted`,
            severity: log_interface_1.ELogSeverity.WARNING,
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
    }
    catch (error) {
        res.status(500).json({
            message: (0, lib_1.getErrorMessage)(error, "Failed to delete transaction"),
            success: false,
        });
    }
};
exports.deleteTransaction = deleteTransaction;
// GET /api/transactions/stats
const getTransactionStats = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        const stats = await transaction_model_1.TransactionModel.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to fetch transaction statistics"),
        });
    }
};
exports.getTransactionStats = getTransactionStats;
// GET /api/transactions/export
const exportTransactions = async (req, res) => {
    try {
        const { startDate, endDate, type, category, format = 'json' } = req.query;
        const query = {};
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = new Date(startDate);
            if (endDate)
                query.date.$lte = new Date(endDate);
        }
        if (type)
            query.type = type;
        if (category)
            query.category = category;
        const transactions = await transaction_model_1.TransactionModel.find(query)
            .sort({ date: -1 })
            .lean();
        if (format === 'csv') {
            // Convert to CSV format
            const csv = transactions.map(t => `${t.date},${t.type},${t.category},${t.description},${t.amount},${t.notes || ''}`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
            return res.send(csv);
        }
        // Default JSON response
        res.status(200).json({
            success: true,
            data: transactions,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (0, lib_1.getErrorMessage)(error, "Failed to export transactions"),
        });
    }
};
exports.exportTransactions = exportTransactions;
