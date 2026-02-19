"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinancialSummary = getFinancialSummary;
exports.getClubTransactions = getClubTransactions;
const transaction_model_1 = require("./transaction.model");
const types_1 = require("./types");
/**
 * Get financial summary for a club within a date range
 */
async function getFinancialSummary(startDate, endDate) {
    const query = {};
    if (startDate || endDate) {
        console.log('dates', startDate, endDate);
        if (startDate)
            query['date.$gte'] = startDate;
        if (endDate)
            query['date.$lte'] = endDate;
    }
    else { //Only today
        query['date.$gte'] = new Date();
        query['date.$lte'] = new Date();
    }
    const transactions = await transaction_model_1.TransactionModel.find(query);
    const incomeByCategory = {};
    const expensesByCategory = {};
    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach((transaction) => {
        if (transaction.type === types_1.TransactionType.INCOME) {
            totalIncome += transaction.amount;
            incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
        }
        else {
            totalExpenses += transaction.amount;
            expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
        }
    });
    return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        incomeByCategory,
        expensesByCategory,
        period: { startDate, endDate },
    };
}
/**
 * Get transactions for a club with optional filtering
 */
async function getClubTransactions(filters) {
    const query = {};
    if (filters?.category)
        query.category = filters.category;
    if (filters?.type)
        query.type = filters.type;
    if (filters?.startDate || filters?.endDate) {
        query.date = {};
        if (filters.startDate)
            query.date.$gte = filters.startDate;
        if (filters.endDate)
            query.date.$lte = filters.endDate;
    }
    const skip = filters?.skip || 0;
    const limit = filters?.limit || 50;
    return transaction_model_1.TransactionModel.find(query).sort({ date: -1 }).skip(skip).limit(limit);
}
/**
 * Compare actual spending against budget
 */
// export async function getBudgetVariance(clubId: string, year: number, month?: number) {
//     const query: any = { clubId, year }
//     if (month) query.month = month
//     const budgets = await Budget.find(query)
//     const startDate = new Date(year, month ? month - 1 : 0, 1)
//     const endDate = new Date(year, month ? month : 12, 0)
//     const summary = await getFinancialSummary(clubId, startDate, endDate)
//     return budgets.map((budget: IBudget) => ({
//         category: budget.category,
//         planned: budget.plannedAmount,
//         actual: summary.expensesByCategory[budget.category] || 0,
//         variance: (summary.expensesByCategory[budget.category] || 0) - budget.plannedAmount,
//         variancePercentage:
//             ((summary.expensesByCategory[budget.category] || 0) - budget.plannedAmount) / budget.plannedAmount,
//     }))
// }
