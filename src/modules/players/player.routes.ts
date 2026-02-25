// routes/player.routes.ts
import { Router } from "express";
import {
    getPlayers,
    getPlayer,
    createPlayer,
    updatePlayer,
    patchPlayer,
    deletePlayer,
} from "../../modules/players/player.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { EUserRole } from "../../types/user.interface";


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
    .get(getPlayer)
    .put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.PLAYER,), updatePlayer)
    .patch(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.PLAYER,), patchPlayer)
    .delete(authorize(EUserRole.SUPER_ADMIN), deletePlayer);

export default router;