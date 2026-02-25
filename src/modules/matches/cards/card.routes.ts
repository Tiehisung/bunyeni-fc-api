// routes/card.routes.ts
import { Router } from "express";
import {
  getCards,
  getCardById,
  getCardsByMatch,
  getCardsByPlayer,
  createCard,
  updateCard,
  deleteCard,
  getCardStats,
} from "./card.controller";
import { authenticate, authorize } from "../../../middleware/auth.middleware";
import { EUserRole } from "../../../types/user.interface";

const router = Router();

// Public routes
router.get("/", getCards);
router.get("/stats", getCardStats);
router.get("/match/:matchId", getCardsByMatch);
router.get("/player/:playerId", getCardsByPlayer);
router.get("/:id", getCardById);

// Protected routes - require authentication
router.use(authenticate);

// Card management
router.route("/")
  .post(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    createCard
  );

router.route("/:id")
  .put(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN, EUserRole.COACH,),
    updateCard
  )
  .delete(
    authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
    deleteCard
  );

export default router;