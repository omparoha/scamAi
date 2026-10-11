import { Router } from 'express';
import multer from 'multer';
import { ScanController } from '../controllers/scan.controller';
import { authenticateJwt } from '../middleware/auth';
import { ssrfGuardMiddleware } from '../middleware/ssrf.guard';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  storage: multer.memoryStorage(), // Memory buffer storage - no permanent raw image storage
});

const router = Router();

router.post('/text', authenticateJwt, ScanController.scanText);
router.post('/url', authenticateJwt, ssrfGuardMiddleware, ScanController.scanUrl);
router.post('/ocr', authenticateJwt, upload.single('file'), ScanController.scanOcrFile);
router.get('/history', authenticateJwt, ScanController.getScanHistory);
router.get('/:id', authenticateJwt, ScanController.getScanById);

export default router;
