/**
 * Core TypeScript interfaces for Football Club Resource Management
 * Defines the shape of all data structures used in the system
 */

// Enums for type safety
export enum TransactionType {
    INCOME = "income",
    EXPENSE = "expense",
}

export enum IncomeCategory {
    SPONSORSHIP = "sponsorship",          // funds from local partners
    DONATIONS = "donations",              // from supporters or individuals
    TRAVEL = "travel",                    // gate collections
    EQUIPMENT = "equipment",              // balls, cones, boots, kits
    FUNDRAISERS = "fundraisers",          // tournaments, events
    GRANTS = "grants",                    // from associations or FA
    OTHER = "other_income",               // any other income
    // MERCHANDISE = "merchandise",          // jerseys, kits, balls sold
}

export enum ExpenseCategory {
    TRAVEL = "travel",                    // away matches, transport
    EQUIPMENT = "equipment",              // balls, cones, boots, kits
    TRAINING = "training",                // training facilities, fees
    MEDICAL = "medical",                  // treatments, supplies
    MAINTENANCE = "maintenance",          // pitch, club house upkeep
    MARKETING = "marketing",              // posters, media, events
    UTILITIES = "utilities",              // water, electricity, comms
    ADMINISTRATION = "administration",    // office, stationery, etc.
    PLAYER_WAGES = "player_wages",        // players’ payments
    STAFF_WAGES = "staff_wages",          // coaches, admin, medics
    OTHER = "other_expenses",             // anything else
}

// Base transaction interface
export interface ITransaction {
    _id?: string
    type: TransactionType
    amount: number
    category: IncomeCategory | ExpenseCategory
    description: string
    date: string
    notes?: string
    attachmentUrl?: string
    createdAt?: string
    updatedAt?: string
}

// Transaction with populated club info
export interface ITransactionPopulated extends ITransaction {
    club: IClub
}

// Club interface
export interface IClub {
    _id?: string
    name: string
    shortName: string
    email: string
    phone?: string
    address?: string
    city?: string
    country?: string
    founded?: number
    logo?: string
    createdAt: string
    updatedAt: string
}

// Budget interface for monthly/yearly planning
export interface IBudget {
    _id?: string
    clubId: string
    year: number
    month?: number // Optional - if not provided, it's yearly
    category: IncomeCategory | ExpenseCategory
    plannedAmount: number
    actualAmount?: number
    notes?: string
    createdAt: string
    updatedAt: string
}

// Financial summary interface
export interface IFinancialSummary {
    totalIncome: number
    totalExpenses: number
    netBalance: number
    incomeByCategory: Record<IncomeCategory | ExpenseCategory, number>
    expensesByCategory: Record<IncomeCategory | ExpenseCategory, number>
    period: {
        startDate: string
        endDate: string
    }
}

// Report interface
export interface IReport {
    _id?: string
    clubId: string
    title: string
    period: {
        startDate: string
        endDate: string
    }
    summary: IFinancialSummary
    transactions: ITransaction[]
    createdAt: string
    updatedAt: string
}
