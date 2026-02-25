// routes/user.routes.ts
import { Router } from "express";
import {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    createUser
} from "./user.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { EUserRole } from "../../types/user.interface";


const router = Router();

// Apply authentication middleware to all routes (optional - remove if not needed)
// router.use(authenticate);

router.get('/', getUsers)

router.route("/:slug")
    .get(getUser)
    .put(authenticate, updateUser)
    .delete(deleteUser);

router.post('/', authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,), createUser)

// Additional user operations
router.post(
    "/:slug/change-password",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH, EUserRole.PLAYER, EUserRole.GUEST),
    changeUserPassword
);

// router.get("/me", authenticate, getMe);

export default router;