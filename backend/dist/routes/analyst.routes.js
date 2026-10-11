"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyst_controller_1 = require("../controllers/analyst.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Route-level RBAC: Only SECURITY_ANALYST and ADMIN can access analyst triage
router.use(auth_1.authenticateJwt);
router.use((0, auth_1.requireRole)(['SECURITY_ANALYST', 'ADMIN']));
router.get('/queue', analyst_controller_1.AnalystController.getTriageQueue);
router.post('/reviews', analyst_controller_1.AnalystController.submitReview);
exports.default = router;
