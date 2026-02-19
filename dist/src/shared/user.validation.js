"use strict";
// import { Request, Response, NextFunction } from "express";
// import { body, validationResult, ValidationChain } from "express-validator";
// // User validation rules
// export const validateUser = [
//     body("email")
//         .optional()
//         .isEmail()
//         .normalizeEmail()
//         .withMessage("Please provide a valid email"),
//     body("password")
//         .optional()
//         .isLength({ min: 6 })
//         .withMessage("Password must be at least 6 characters long"),
//     body("name")
//         .optional()
//         .trim()
//         .isLength({ min: 2, max: 50 })
//         .withMessage("Name must be between 2 and 50 characters"),
//     body("role")
//         .optional()
//         .isIn(["admin", "user", "manager", "editor"])
//         .withMessage("Invalid role specified"),
//     // Validation result handler
//     (req: Request, res: Response, next: NextFunction) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 errors: errors.array().map(err => ({
//                     field: err.type === 'field' ? err.path : 'unknown',
//                     message: err.msg
//                 }))
//             });
//         }
//         next();
//     }
// ];
