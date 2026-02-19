"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/finance/transaction.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const user_1 = require("../../../types/user");
const transaction_controller_1 = require("./transaction.controller");
const router = (0, express_1.Router)();
// Public routes (if finance is public - usually restricted)
// router.get("/", getTransactions);
// router.get("/stats", getTransactionStats);
// router.get("/summary", getTransactionSummary);
// router.get("/type/:type", getTransactionsByType);
// router.get("/category/:category", getTransactionsByCategory);
// router.get("/export", exportTransactions);
// router.get("/:id", getTransactionById);
// Protected routes - require authentication and finance role
router.use(auth_middleware_1.authenticate);
// Finance team and above can view
router.get("/", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.getTransactions);
router.get("/stats", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.getTransactionStats);
router.get("/summary", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.getTransactionSummary);
router.get("/type/:type", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.getTransactionsByType);
router.get("/category/:category", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.getTransactionsByCategory);
router.get("/export", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.exportTransactions);
router.get("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.getTransactionById);
// Transaction management (create, update, delete) - higher privileges
router.post("/", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.createTransaction);
router.put("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.updateTransaction);
router.delete("/:id", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN), transaction_controller_1.deleteTransaction);
exports.default = router;
