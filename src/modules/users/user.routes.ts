// routes/user.routes.ts
import { Router } from "express";
import {
    getUsers,
    getUserBySlugOrId,
    createUser,
    updateUserBySlugOrId,
    patchUserBySlugOrId,
    deleteUserBySlugOrId,
    changeUserPassword,
    toggleUserStatus,
    getMe
} from "./user.controller";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import { EUserRole } from "../../types/user";


const router = Router();

// Apply authentication middleware to all routes (optional - remove if not needed)
// router.use(authenticate);

router.route("/")
    .get(getUsers)
    .post(createUser);

router.route("/:slug")
    .get(getUserBySlugOrId)
    .put(authenticate, updateUserBySlugOrId)
    .delete(authenticate, deleteUserBySlugOrId);

// Additional user operations
router.post(
    "/:slug/change-password",
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH, EUserRole.PLAYER, EUserRole.GUEST),
    changeUserPassword
);
router.get("/me", authenticate, getMe);

export default router;