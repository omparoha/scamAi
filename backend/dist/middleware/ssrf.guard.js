"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssrfGuardMiddleware = ssrfGuardMiddleware;
const ssrf_1 = require("../utils/ssrf");
async function ssrfGuardMiddleware(req, res, next) {
    const targetUrl = req.body.url || req.query.url;
    if (!targetUrl || typeof targetUrl !== 'string') {
        return next();
    }
    const ssrfResult = await (0, ssrf_1.validateUrlSsrf)(targetUrl);
    if (!ssrfResult.isSafe) {
        return res.status(400).json({
            error: 'SECURITY_SSRF_PROHIBITED',
            message: `SSRF Policy Violation: ${ssrfResult.reason}`,
            resolvedIp: ssrfResult.resolvedIp,
        });
    }
    // Attach sanitized URL to request
    req.body.sanitizedUrl = ssrfResult.sanitizedUrl;
    next();
}
