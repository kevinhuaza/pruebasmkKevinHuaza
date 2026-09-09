import { body } from 'express-validator';

export const registerRules = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 3, max: 80 })
    .withMessage('El nombre de usuario debe tener entre 3 y 80 caracteres'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contrasena debe tener al menos 6 caracteres'),
  body('confirmPassword')
    .custom((value: string, { req }) => value === req.body.password)
    .withMessage('Las contrasenas no coinciden'),
  body('role').isIn(['user', 'admin']).withMessage('El rol debe ser "user" o "admin"'),
];

export const loginRules = [
  body('username').trim().notEmpty().withMessage('El nombre de usuario es obligatorio'),
  body('password').notEmpty().withMessage('La contrasena es obligatoria'),
];
