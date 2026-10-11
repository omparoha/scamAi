import { Router } from 'express';
import { AnalystController } from '../controllers/analyst.controller';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

// Route-level RBAC: Only SECURITY_ANALYST and ADMIN can access analyst triage
router.use(authenticateJwt);
router.use(requireRole(['SECURITY_ANALYST', 'ADMIN']));

router.get('/queue', AnalystController.getTriageQueue);
router.post('/reviews', AnalystController.submitReview);

export default router;
