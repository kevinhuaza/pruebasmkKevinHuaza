import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import documentRoutes from './document.routes';

const router = Router();

router.get('/health', (req: Request, res: Response) =>
  res.status(200).json({ success: true, status: 'ok' })
);
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);

export default router;
