// routes/auth.routes.ts
import { Router } from 'express';

import { authenticate, authorize } from '../../middleware/auth.middleware';
import { login, logout, getMe, changePassword, register, refreshToken } from './auth.controller';
import { EUserRole } from '../../types/user.interface';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);

// Admin only routes
router.get('/admin-only', authenticate, authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN,), (req, res) => {
    res.json({ message: 'Welcome admin!' });
});

export default router;