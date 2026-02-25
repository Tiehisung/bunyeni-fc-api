// routes/finance/transaction.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "../../../middleware/auth.middleware";
import { EUserRole } from "../../../types/user.interface";
import {
    getTransactions,
    getTransactionStats,
    getTransactionSummary,
    getTransactionsByType,
    getTransactionsByCategory,
    exportTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from "./transaction.controller";



const router = Router();

// Public routes (if finance is public - usually restricted)
// router.get("/", getTransactions);
// router.get("/stats", getTransactionStats);
// router.get("/summary", getTransactionSummary);
// router.get("/type/:type", getTransactionsByType);
// router.get("/category/:category", getTransactionsByCategory);
// router.get("/export", exportTransactions);
// router.get("/:id", getTransactionById);

// Protected routes - require authentication and finance role
router.use(authenticate);

// Finance team and above can view
router.get(
    "/",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    getTransactions
);

router.get(
    "/stats",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    getTransactionStats
);

router.get(
    "/summary",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    getTransactionSummary
);

router.get(
    "/type/:type",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    getTransactionsByType
);

router.get(
    "/category/:category",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    getTransactionsByCategory
);

router.get(
    "/export",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    exportTransactions
);

router.get(
    "/:id",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,),
    getTransactionById
);

// Transaction management (create, update, delete) - higher privileges
router.post(
    "/",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    createTransaction
);

router.put(
    "/:id",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    updateTransaction
);

router.delete(
    "/:id",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteTransaction
);

export default router;