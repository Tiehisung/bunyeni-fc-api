// routes/player.routes.ts
import { Router } from "express";
import {
    getPlayers,
    getPlayerBySlugOrId,

    createPlayer,

    updatePlayer,
    updatePlayerBySlugOrId,
    patchPlayerBySlugOrId,

    deletePlayerBySlugOrId,
} from "../../modules/players/player.controller";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import { EUserRole } from "../../types/user";


const router = Router();

// Public routes (if needed)
// router.get("/", getPlayers);
// router.get("/:id", getPlayerById);

// Protected routes
router.use(authenticate);

// Collection routes
router.route("/")
    .get(getPlayers)
    .post(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), createPlayer);

// Dynamic player routes by slug or ID
router.route("/:slug")
    .get(getPlayerBySlugOrId)
    .put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.PLAYER,), updatePlayerBySlugOrId)
    .patch(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.PLAYER,), patchPlayerBySlugOrId)
    .delete(authorize(EUserRole.SUPER_ADMIN), deletePlayerBySlugOrId);

export default router;