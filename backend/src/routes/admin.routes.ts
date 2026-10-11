import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

// Route-level RBAC: Only ADMIN can access telemetry and role management
router.use(authenticateJwt);
router.use(requireRole(['ADMIN']));

router.get('/telemetry', AdminController.getTelemetry);
router.get('/users', AdminController.getUsers);
router.post('/users/role', AdminController.updateUserRole);

export default router;
