import dns from 'dns';
import { URL } from 'url';

export interface SSRFCheckResult {
  isSafe: boolean;
  reason?: string;
  resolvedIp?: string;
  sanitizedUrl?: string;
}

/**
 * Helper to convert IPv4 string to 32-bit unsigned integer
 */
function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Checks whether an IPv4 address is in a restricted/private/loopback range.
 */
function isPrivateIPv4(ip: string): boolean {
  const longIp = ipToLong(ip);

  // 127.0.0.0/8 (Loopback)
  if (((longIp & 0xff000000) >>> 0) === 0x7f000000) return true;

  // 10.0.0.0/8 (Private Network)
  if (((longIp & 0xff000000) >>> 0) === 0x0a000000) return true;

  // 172.16.0.0/12 (Private Network: 172.16.0.0 - 172.31.255.255)
  if (((longIp & 0xfff00000) >>> 0) === 0xac100000) return true;

  // 192.168.0.0/16 (Private Network)
  if (((longIp & 0xffff0000) >>> 0) === 0xc0a80000) return true;

  // 169.254.0.0/16 (Link-Local & AWS IMDS 169.254.169.254)
  if (((longIp & 0xffff0000) >>> 0) === 0xa9fe0000) return true;

  // 100.64.0.0/10 (Shared Address Space / CGNAT)
  if (((longIp & 0xffc00000) >>> 0) === 0x64400000) return true;

  // 0.0.0.0/8 (Broadcast/Current network)
  if (((longIp & 0xff000000) >>> 0) === 0x00000000) return true;

  // 255.255.255.255 (Broadcast)
  if (longIp === 0xffffffff) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is loopback or link-local/private
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  if (normalized.startsWith('fe80:')) return true; // Link local
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // Unique local
  return false;
}

/**
 * Validates a target URL against SSRF attacks using pre-flight DNS lookup.
 */
export async function validateUrlSsrf(inputUrl: string): Promise<SSRFCheckResult> {
  let parsedUrl: URL;
  try {
    // Add protocol if missing
    const urlToParse = inputUrl.match(/^https?:\/\//i) ? inputUrl : `http://${inputUrl}`;
    parsedUrl = new URL(urlToParse);
  } catch {
    return { isSafe: false, reason: 'Invalid URL format' };
  }

  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { isSafe: false, reason: `Unsupported protocol: ${parsedUrl.protocol}` };
  }

  const hostname = parsedUrl.hostname;

  // Direct IP checks on hostname
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return { isSafe: false, reason: `Direct private/internal IPv4 prohibited (${hostname})`, resolvedIp: hostname };
    }
  }

  if (hostname.includes(':')) {
    if (isPrivateIPv6(hostname)) {
      return { isSafe: false, reason: `Direct private/internal IPv6 prohibited (${hostname})`, resolvedIp: hostname };
    }
  }

  // Pre-flight DNS resolution
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      return { isSafe: false, reason: 'DNS resolution failed (no records found)' };
    }

    for (const record of addresses) {
      const ip = record.address;
      if (record.family === 4 && isPrivateIPv4(ip)) {
        return { isSafe: false, reason: `Host ${hostname} resolves to prohibited internal IPv4: ${ip}`, resolvedIp: ip };
      }
      if (record.family === 6 && isPrivateIPv6(ip)) {
        return { isSafe: false, reason: `Host ${hostname} resolves to prohibited internal IPv6: ${ip}`, resolvedIp: ip };
      }
    }

    return {
      isSafe: true,
      resolvedIp: addresses[0].address,
      sanitizedUrl: parsedUrl.toString()
    };
  } catch (err: any) {
    return { isSafe: false, reason: `DNS lookup error: ${err.message || 'Domain unresolvable'}` };
  }
}
