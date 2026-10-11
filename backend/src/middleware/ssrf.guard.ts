import { Request, Response, NextFunction } from 'express';
import { validateUrlSsrf } from '../utils/ssrf';

export async function ssrfGuardMiddleware(req: Request, res: Response, next: NextFunction) {
  const targetUrl = req.body.url || req.query.url;

  if (!targetUrl || typeof targetUrl !== 'string') {
    return next();
  }

  const ssrfResult = await validateUrlSsrf(targetUrl);
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
