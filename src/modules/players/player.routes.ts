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
router.route('/')
    .get(getPlayers)
    .post(authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,), createPlayer);;

router.get("/:slug", getPlayer)

// Protected routes
router.use(authenticate);

// Dynamic player routes by slug or ID
router.route("/:slug")
    .put(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.PLAYER,), updatePlayer)
    .patch(authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.PLAYER,), patchPlayer)
    .delete(authorize(EUserRole.SUPER_ADMIN), deletePlayer);

export default router;