// routes/search.routes.ts
import { Router } from "express";
import { SearchController } from "./search.controller";

const router = Router();

// Global search across all entities
router.get("/", SearchController.globalSearch);

// Quick search for autocomplete
router.get("/quick", SearchController.quickSearch);

export default router;