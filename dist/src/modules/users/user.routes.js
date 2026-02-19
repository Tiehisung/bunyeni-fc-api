"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/user.routes.ts
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const user_1 = require("../../types/user");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes (optional - remove if not needed)
// router.use(authenticate);
router.route("/")
    .get(user_controller_1.getUsers)
    .post(user_controller_1.createUser);
router.route("/:slug")
    .get(user_controller_1.getUserBySlugOrId)
    .put(auth_middleware_1.authenticate, user_controller_1.updateUserBySlugOrId)
    .delete(auth_middleware_1.authenticate, user_controller_1.deleteUserBySlugOrId);
// Additional user operations
router.post("/:slug/change-password", (0, auth_middleware_1.authorize)(user_1.EUserRole.ADMIN, user_1.EUserRole.SUPER_ADMIN, user_1.EUserRole.COACH, user_1.EUserRole.PLAYER, user_1.EUserRole.GUEST), user_controller_1.changeUserPassword);
router.get("/me", auth_middleware_1.authenticate, user_controller_1.getMe);
exports.default = router;
