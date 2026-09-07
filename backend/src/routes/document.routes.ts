import { Router } from 'express';
import * as documentController from '../controllers/document.controller';
import authenticate from '../middlewares/auth.middleware';
import authorize from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';
import { uploadLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.use(authenticate);

router.get('/', documentController.list);
router.get('/template', documentController.downloadTemplate);
router.post('/upload', uploadLimiter, upload.single('file'), documentController.upload);
router.get('/:id/download', documentController.download);
router.delete('/:id', authorize('admin'), documentController.remove);

export default router;
