import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { registerRules, loginRules } from '../validators/auth.validator';
import { authLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/register', authLimiter, registerRules, authController.register);
router.post('/login', authLimiter, loginRules, authController.login);

export default router;
