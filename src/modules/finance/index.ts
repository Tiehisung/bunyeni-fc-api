 
 
import { QueryFilter } from "mongoose"
import { TransactionModel } from "./transaction.model"
import { IFinancialSummary, ITransaction, TransactionType } from "./types"

/**
 * Get financial summary for a club within a date range
 */
export async function getFinancialSummary(startDate: string, endDate: string): Promise<IFinancialSummary> {

    const query = {} as QueryFilter<unknown>

    if (startDate || endDate) {

        console.log('dates', startDate, endDate)
        if (startDate) query['date.$gte'] = startDate

        if (endDate) query['date.$lte'] = endDate
    } else {//Only today
        query['date.$gte'] = new Date()
        query['date.$lte'] = new Date()
    }

    const transactions = await TransactionModel.find(query)

    const incomeByCategory: Record<string, number> = {}
    const expensesByCategory: Record<string, number> = {}
    let totalIncome = 0
    let totalExpenses = 0

    transactions.forEach((transaction: ITransaction) => {
        if (transaction.type === TransactionType.INCOME) {
            totalIncome += transaction.amount
            incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount
        } else {
            totalExpenses += transaction.amount
            expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount
        }
    })

    return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        incomeByCategory,
        expensesByCategory,
        period: { startDate, endDate },
    }
}

/**
 * Get transactions for a club with optional filtering
 */
export async function getClubTransactions(
    filters?: {
        category?: string
        type?: TransactionType
        startDate?: Date
        endDate?: Date
        limit?: number
        skip?: number
    },
) {
    const query: QueryFilter<unknown> = {}

    if (filters?.category) query.category = filters.category
    if (filters?.type) query.type = filters.type
    if (filters?.startDate || filters?.endDate) {
        query.date = {}
        if (filters.startDate) query.date.$gte = filters.startDate
        if (filters.endDate) query.date.$lte = filters.endDate
    }

    const skip = filters?.skip || 0
    const limit = filters?.limit || 50

    return TransactionModel.find(query).sort({ date: -1 }).skip(skip).limit(limit)
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
