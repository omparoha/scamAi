"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Route-level RBAC: Only ADMIN can access telemetry and role management
router.use(auth_1.authenticateJwt);
router.use((0, auth_1.requireRole)(['ADMIN']));
router.get('/telemetry', admin_controller_1.AdminController.getTelemetry);
router.get('/users', admin_controller_1.AdminController.getUsers);
router.post('/users/role', admin_controller_1.AdminController.updateUserRole);
exports.default = router;
